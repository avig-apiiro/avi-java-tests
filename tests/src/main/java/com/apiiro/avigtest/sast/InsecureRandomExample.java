package com.apiiro.avigtest.sast;

import java.util.Random;

/**
 * Semgrep: java.lang.security.audit.crypto.insecure-random
 * java.util.Random used for security-sensitive token generation.
 */
public class InsecureRandomExample {

    private static final Random random = new Random();

    // semgrep: insecure random - java.util.Random used for session token
    public String generateSessionToken() {
        return Long.toHexString(random.nextLong());
    }

    // semgrep: insecure random - Math.random() used for password reset token
    public String generatePasswordResetToken() {
        return String.valueOf((int)(Math.random() * 1000000));
    }

    // semgrep: insecure random - used for CSRF token
    public int generateCsrfToken() {
        return random.nextInt(Integer.MAX_VALUE);
    }
}
