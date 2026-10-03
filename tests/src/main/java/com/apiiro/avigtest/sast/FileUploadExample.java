package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

/**
 * Semgrep: java.lang.security.audit.file-upload
 * File upload without validation of content type or filename - allows zip slip and malicious uploads.
 */
@RestController
public class FileUploadExample {

    private static final String UPLOAD_DIR = "/var/app/uploads/";

    // semgrep: unrestricted file upload - no file type validation
    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) throws IOException {
        // No content type validation, no filename sanitization
        String filename = file.getOriginalFilename();
        File dest = new File(UPLOAD_DIR + filename);
        file.transferTo(dest);
        return "Uploaded: " + filename;
    }

    // semgrep: zip slip - extracting archive to path from user-controlled filename
    @PostMapping("/extract")
    public String extract(@RequestParam("file") MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        // Path traversal via zip slip - filename like ../../etc/cron.d/backdoor
        File destination = new File(UPLOAD_DIR + originalName);
        file.transferTo(destination);
        return "Extracted to: " + destination.getAbsolutePath();
    }
}
