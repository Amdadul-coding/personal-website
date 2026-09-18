package main

import (
	"encoding/json"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"net/mail"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const rateWindow = 10 * time.Minute
const rateLimit = 5

type visitor struct {
	count int
	reset time.Time
}

type limiter struct {
	mu       sync.Mutex
	visitors map[string]visitor
}

func (l *limiter) allow(ip string, now time.Time) (bool, int) {
	l.mu.Lock()
	defer l.mu.Unlock()
	for key, entry := range l.visitors {
		if !now.Before(entry.reset) {
			delete(l.visitors, key)
		}
	}
	entry, exists := l.visitors[ip]
	if !exists {
		if len(l.visitors) >= 10000 {
			return false, 600
		}
		entry.reset = now.Add(rateWindow)
	}
	if entry.count >= rateLimit {
		return false, int(entry.reset.Sub(now).Seconds()) + 1
	}
	entry.count++
	l.visitors[ip] = entry
	return true, 0
}

type submission struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

type response struct {
	Message string            `json:"message"`
	Errors  map[string]string `json:"errors,omitempty"`
}

func reply(w http.ResponseWriter, status int, message string, errors map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(response{message, errors})
}

func contactHandler() http.Handler {
	l := &limiter{visitors: make(map[string]visitor)}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", "POST")
			reply(w, 405, "Please submit the form using POST.", nil)
			return
		}
		mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if err != nil || mediaType != "application/json" {
			reply(w, 415, "Please send the form as JSON.", nil)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 16*1024)
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		var input submission
		if err := decoder.Decode(&input); err != nil {
			reply(w, 400, "Invalid form data. Keep the request under 16 KB and use text fields.", nil)
			return
		}
		if decoder.Decode(&struct{}{}) != io.EOF {
			reply(w, 400, "Please send a single form submission.", nil)
			return
		}
		input.Name = strings.TrimSpace(input.Name)
		input.Email = strings.TrimSpace(input.Email)
		input.Message = strings.TrimSpace(input.Message)
		errors := make(map[string]string)
		if input.Name == "" {
			errors["name"] = "Please enter your name."
		}
		if input.Message == "" {
			errors["message"] = "Please write a message."
		}
		if input.Email == "" {
			errors["email"] = "Please enter your email."
		} else if address, err := mail.ParseAddress(input.Email); err != nil || address.Address != input.Email || !strings.Contains(strings.SplitN(input.Email, "@", 2)[1], ".") {
			errors["email"] = "Please enter your email address."
		}
		if len(errors) > 0 {
			reply(w, 422, "", errors)
			return
		}
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}
		if allowed, retry := l.allow(ip, time.Now()); !allowed {
			w.Header().Set("Retry-After", strconv.Itoa(retry))
			reply(w, 429, "Too many submissions.", nil)
			return
		}
		reply(w, 200, "Message Received", nil)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/api/contact", contactHandler())
	addr := os.Getenv("CONTACT_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	server := &http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 10 * time.Second, IdleTimeout: 60 * time.Second}
	log.Printf("Contact API listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}
