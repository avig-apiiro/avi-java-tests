package com.apiiro.avigtest.sast;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * SAST risk: Path traversal - user input used to build file path without sanitization.
 */
public class PathTraversalExample {

    private static final String BASE_DIR = "/var/app/files/";

    public byte[] readFile(String filename) throws IOException {
        // SAST: Path traversal - filename from user input not sanitized
        File file = new File(BASE_DIR + filename);
        FileInputStream fis = new FileInputStream(file);
        return fis.readAllBytes();
    }
}
