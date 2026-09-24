package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"
)

type emailSender struct {
	apiKey, from, to string
	endpoint         string
	client           *http.Client
}

func emailSenderFromEnv() (*emailSender, error) {
	s := &emailSender{
		apiKey:   strings.TrimSpace(os.Getenv("RESEND_API_KEY")),
		from:     strings.TrimSpace(os.Getenv("CONTACT_FROM_EMAIL")),
		to:       strings.TrimSpace(os.Getenv("CONTACT_TO_EMAIL")),
		endpoint: "https://api.resend.com/emails",
		client:   &http.Client{Timeout: 8 * time.Second},
	}
	if s.apiKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is required")
	}
	for _, setting := range []struct{ name, value string }{
		{"CONTACT_FROM_EMAIL", s.from}, {"CONTACT_TO_EMAIL", s.to},
	} {
		if _, err := mail.ParseAddress(setting.value); err != nil {
			return nil, fmt.Errorf("%s must contain a valid email address", setting.name)
		}
	}
	return s, nil
}

func (s *emailSender) send(ctx context.Context, input submission) error {
	payload, err := json.Marshal(struct {
		From    string   `json:"from"`
		To      []string `json:"to"`
		Subject string   `json:"subject"`
		Text    string   `json:"text"`
	}{s.from, []string{s.to}, "New message from your portfolio",
		fmt.Sprintf("Name: %s\nEmail: %s\n\n%s", input.Name, input.Email, input.Message)})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.endpoint, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	res, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("email provider request failed: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		// Do not log provider response bodies: they may contain personal data.
		return fmt.Errorf("email provider returned HTTP %d", res.StatusCode)
	}
	var result struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(io.LimitReader(res.Body, 4096)).Decode(&result); err != nil || result.ID == "" {
		return fmt.Errorf("email provider returned no message ID")
	}
	return nil
}
