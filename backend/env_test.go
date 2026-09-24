package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoadEnvironment(t *testing.T) {
	const key = "CONTACT_TEST_ENV_VALUE"
	t.Setenv(key, "")
	if err := os.Unsetenv(key); err != nil {
		t.Fatal(err)
	}
	file := filepath.Join(t.TempDir(), ".env")
	if err := loadEnvironment(file); err != nil {
		t.Fatalf("missing optional file: %v", err)
	}
	if err := os.WriteFile(file, []byte(key+"='Portfolio <contact@example.com>'\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := loadEnvironment(file); err != nil {
		t.Fatal(err)
	}
	if os.Getenv(key) != "Portfolio <contact@example.com>" {
		t.Fatal("quoted local value was not loaded")
	}
	t.Setenv(key, "hosting-value")
	if err := loadEnvironment(file); err != nil {
		t.Fatal(err)
	}
	if os.Getenv(key) != "hosting-value" {
		t.Fatal("hosting value was overwritten")
	}
}

func TestMalformedEnvironmentDoesNotExposeSecrets(t *testing.T) {
	file := filepath.Join(t.TempDir(), ".env")
	if err := os.WriteFile(file, []byte("!private-secret=value\n"), 0600); err != nil {
		t.Fatal(err)
	}
	err := loadEnvironment(file)
	if err == nil || strings.Contains(err.Error(), "private-secret") {
		t.Fatal("expected a sanitized configuration error")
	}
}
