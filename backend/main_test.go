package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func submit(handler http.Handler, body, ip string) *httptest.ResponseRecorder {
	r := httptest.NewRequest("POST", "/api/contact", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	r.RemoteAddr = ip + ":12345"
	r.Header.Set("X-Forwarded-For", "198.51.100.99")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	return w
}

func TestValidation(t *testing.T) {
	for _, tc := range []struct {
		name, body     string
		status, errors int
	}{
		{"valid", `{"name":" Ada ","email":"ada@example.com","message":" Hello "}`, 200, 0},
		{"required", `{"name":" ","email":"","message":"\n"}`, 422, 3},
		{"bad email", `{"name":"Ada","email":"not-an-email","message":"Hello"}`, 422, 1},
		{"display name", `{"name":"Ada","email":"Ada <ada@example.com>","message":"Hello"}`, 422, 1},
		{"missing domain suffix", `{"name":"Ada","email":"ada@localhost","message":"Hello"}`, 422, 1},
		{"malformed", `{`, 400, 0},
		{"multiple objects", `{} {}`, 400, 0},
		{"wrong type", `{"name":12}`, 400, 0},
		{"unknown field", `{"extra":true}`, 400, 0},
		{"oversized", `{"message":"` + strings.Repeat("a", 17000) + `"}`, 400, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := submit(contactHandler(func(context.Context, submission) error { return nil }), tc.body, "192.0.2.1")
			if w.Code != tc.status {
				t.Fatalf("status %d: %s", w.Code, w.Body.String())
			}
			var result response
			if err := json.Unmarshal(w.Body.Bytes(), &result); err != nil {
				t.Fatal(err)
			}
			if len(result.Errors) != tc.errors {
				t.Fatalf("errors: %v", result.Errors)
			}
		})
	}
}

func TestRateLimit(t *testing.T) {
	handler := contactHandler(func(context.Context, submission) error { return nil })
	const valid = `{"name":"Ada","email":"ada@example.com","message":"Hello"}`
	// Invalid requests must not consume any of the five successful submissions.
	for i := 0; i < rateLimit+2; i++ {
		for _, tc := range []struct {
			body   string
			status int
		}{{`{}`, 422}, {`{`, 400}} {
			if w := submit(handler, tc.body, "192.0.2.1"); w.Code != tc.status {
				t.Fatalf("invalid submission: got %d, want %d", w.Code, tc.status)
			}
		}
	}
	for i := 0; i < rateLimit; i++ {
		if w := submit(handler, valid, "192.0.2.1"); w.Code != 200 {
			t.Fatal(w.Code)
		}
	}
	w := submit(handler, valid, "192.0.2.1")
	if w.Code != 429 || w.Header().Get("Retry-After") == "" {
		t.Fatal("missing rate limit response")
	}
	if w := submit(handler, `{}`, "192.0.2.1"); w.Code != 422 {
		t.Fatal("validation errors should still be returned after reaching the limit")
	}
	if w := submit(handler, valid, "192.0.2.2"); w.Code != 200 {
		t.Fatal("distinct IP was blocked")
	}
}

func TestRateLimitExpires(t *testing.T) {
	l := &limiter{visitors: make(map[string]visitor)}
	now := time.Now()
	for i := 0; i < rateLimit; i++ {
		l.allow("192.0.2.1", now)
	}
	if allowed, _ := l.allow("192.0.2.1", now); allowed {
		t.Fatal("limit not applied")
	}
	if allowed, _ := l.allow("192.0.2.1", now.Add(rateWindow)); !allowed {
		t.Fatal("limit did not expire")
	}
}

func TestMethodAndContentType(t *testing.T) {
	for _, tc := range []struct {
		method string
		status int
	}{{"GET", 405}, {"POST", 415}} {
		w := httptest.NewRecorder()
		contactHandler(func(context.Context, submission) error { return nil }).ServeHTTP(w, httptest.NewRequest(tc.method, "/api/contact", nil))
		if w.Code != tc.status {
			t.Fatalf("%s: %d", tc.method, w.Code)
		}
	}
}
