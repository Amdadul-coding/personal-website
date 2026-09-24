package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestContactEmailDelivery(t *testing.T) {
	for _, tc := range []struct {
		name           string
		providerStatus int
		providerBody   string
		want           int
	}{
		{"accepted", 200, `{"id":"email-123"}`, 200},
		{"rejected", 403, `{"message":"private provider error"}`, 502},
		{"unavailable", 503, `{}`, 502},
		{"invalid response", 200, `{}`, 502},
	} {
		t.Run(tc.name, func(t *testing.T) {
			calls := 0
			provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				calls++
				if r.Method != "POST" || r.Header.Get("Authorization") != "Bearer test-key" {
					t.Error("incorrect provider request")
				}
				var payload struct {
					From    string
					To      []string
					ReplyTo string `json:"reply_to"`
					Text    string
				}
				if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
					t.Error(err)
				}
				if payload.From != "contact@example.com" || len(payload.To) != 1 || payload.To[0] != "owner@example.com" || payload.ReplyTo != "" || payload.Text != "Name: Ada\nEmail: ada@example.com\n\nHello" {
					t.Errorf("wrong email payload: %+v", payload)
				}
				w.WriteHeader(tc.providerStatus)
				_, _ = w.Write([]byte(tc.providerBody))
			}))
			defer provider.Close()
			sender := &emailSender{"test-key", "contact@example.com", "owner@example.com", provider.URL, provider.Client()}
			handler := contactHandler(sender.send)
			if w := submit(handler, `{}`, "192.0.2.1"); w.Code != 422 || calls != 0 {
				t.Fatal("invalid submission reached provider")
			}
			w := submit(handler, `{"name":" Ada ","email":"ada@example.com","message":" Hello "}`, "192.0.2.1")
			if w.Code != tc.want || calls != 1 {
				t.Fatalf("status=%d calls=%d", w.Code, calls)
			}
		})
	}
}

func TestEmailTimeout(t *testing.T) {
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { time.Sleep(50 * time.Millisecond) }))
	defer provider.Close()
	sender := &emailSender{"key", "from@example.com", "to@example.com", provider.URL, &http.Client{Timeout: 20 * time.Millisecond}}
	if err := sender.send(context.Background(), submission{}); err == nil {
		t.Fatal("expected timeout")
	}
}

func TestEmailConfiguration(t *testing.T) {
	t.Setenv("RESEND_API_KEY", "key")
	t.Setenv("CONTACT_FROM_EMAIL", "Portfolio <contact@example.com>")
	t.Setenv("CONTACT_TO_EMAIL", "owner@example.com")
	if _, err := emailSenderFromEnv(); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"} {
		t.Run(key, func(t *testing.T) {
			t.Setenv(key, "")
			if _, err := emailSenderFromEnv(); err == nil {
				t.Fatal("missing configuration accepted")
			}
		})
	}
}

func TestWebsite(t *testing.T) {
	dir := t.TempDir()
	for name, body := range map[string]string{"index.html": "portfolio", "app.js": "script"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0600); err != nil {
			t.Fatal(err)
		}
	}
	for _, tc := range []struct {
		path   string
		status int
		body   string
	}{
		{"/", 200, "portfolio"}, {"/about", 200, "portfolio"}, {"/app.js", 200, "script"}, {"/missing.js", 404, ""}, {"/api/missing", 404, ""},
	} {
		w := httptest.NewRecorder()
		websiteHandler(dir).ServeHTTP(w, httptest.NewRequest("GET", tc.path, nil))
		if w.Code != tc.status || (tc.body != "" && w.Body.String() != tc.body) {
			t.Fatalf("%s: %d %s", tc.path, w.Code, w.Body.String())
		}
	}
}
