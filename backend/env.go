package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func loadEnvironment(filename string) error {
	// Hosting environment variables take precedence; a local file is optional.
	if err := godotenv.Load(filename); err != nil && !os.IsNotExist(err) {
		// Parser errors can include file contents, so never log the underlying error.
		return fmt.Errorf("could not load %s: check file permissions and KEY=value formatting", filename)
	}
	return nil
}
