package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Query().Get("path")
		if path == "" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Missing path parameter"))
			return
		}

		file, err := os.Open(path)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(fmt.Sprintf("File not found: %s", path)))
			return
		}

		defer file.Close()

		fileInfo, err := file.Stat()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Error reading file information"))
			return
		}

		if fileInfo.IsDir() {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf("Invalid path: %s", path)))
			return
		}

		data := make([]byte, fileInfo.Size())
		_, err = file.Read(data)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Error reading file contents"))
			return
		}

		w.Write(data)
	})

	http.ListenAndServe(":8080", nil)
}
