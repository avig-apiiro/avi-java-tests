package com.apiiro.avigtest.api;

import org.springframework.web.bind.annotation.*;

/**
 * API Security risk: Weak authentication - MD5 password hashing, no rate limiting.
 */
@RestController
@RequestMapping("/auth")
public class WeakAuthController {

    // SAST + API risk: MD5 used for password hashing (weak algorithm)
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(password.getBytes());
        String hashedPassword = new String(hash);

        // Hardcoded admin credentials check
        if (username.equals("admin") && hashedPassword.equals("5f4dcc3b5aa765d61d8327deb882cf99")) {
            return "admin-token-hardcoded-secret-12345";
        }
        return "unauthorized";
    }
}
