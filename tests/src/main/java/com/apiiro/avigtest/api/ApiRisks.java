package com.apiiro.avigtest.api;

import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 * 10 API security risks — unauthenticated endpoints, sensitive data exposure,
 * broken access control, and insecure configurations.
 */
@RestController
public class ApiRisks {

    // API Risk 1: Unauthenticated endpoint returns all users with passwords
    @GetMapping("/api/admin/users")
    public List<Map<String, Object>> getAllUsers() {
        return List.of(
            Map.of("id", 1, "username", "admin", "password", "admin123", "role", "ADMIN"),
            Map.of("id", 2, "username", "user1", "password", "pass123",  "role", "USER")
        );
    }

    // API Risk 2: Unauthenticated endpoint exposes environment secrets
    @GetMapping("/api/debug/env")
    public Map<String, String> getEnvVars() {
        return Map.of(
            "DB_PASSWORD",         System.getenv("DB_PASSWORD"),
            "AWS_SECRET_KEY",      System.getenv("AWS_SECRET_ACCESS_KEY"),
            "JWT_SECRET",          System.getenv("JWT_SECRET"),
            "STRIPE_KEY",          System.getenv("STRIPE_SECRET_KEY")
        );
    }

    // API Risk 3: Mass assignment — all user fields bindable including role/isAdmin
    @PostMapping("/api/users/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> payload) {
        // No field whitelist — attacker can set role=ADMIN, isAdmin=true
        return payload;
    }

    // API Risk 4: IDOR — no ownership check, any user can access any account
    @GetMapping("/api/accounts/{id}")
    public Map<String, Object> getAccount(@PathVariable String id) {
        return Map.of("accountId", id, "balance", 50000, "creditCard", "4111-1111-1111-1111");
    }

    // API Risk 5: Unauthenticated DELETE — anyone can delete any resource
    @DeleteMapping("/api/admin/data/{resource}")
    public String deleteResource(@PathVariable String resource) {
        return "Deleted: " + resource;
    }

    // API Risk 6: Sensitive PII returned in plain API response without masking
    @GetMapping("/api/users/{id}/profile")
    public Map<String, Object> getUserProfile(@PathVariable String id) {
        return Map.of(
            "ssn",          "123-45-6789",
            "creditCard",   "4111111111111111",
            "cvv",          "123",
            "dateOfBirth",  "1990-01-01",
            "bankAccount",  "9876543210"
        );
    }

    // API Risk 7: Unauthenticated endpoint reveals internal system config
    @GetMapping("/api/internal/config")
    public Map<String, Object> getConfig() {
        return Map.of(
            "dbHost",       "prod-db.internal",
            "dbPort",       5432,
            "redisHost",    "redis.internal",
            "jwtSecret",    "super-secret-jwt-key",
            "adminToken",   "hardcoded-admin-token-abc123"
        );
    }

    // API Risk 8: No rate limiting — endpoint accepts unlimited login attempts (brute force)
    @PostMapping("/api/auth/login")
    public Map<String, Object> login(@RequestParam String username,
                                     @RequestParam String password) {
        // No rate limiting, no lockout, no CAPTCHA
        if ("admin".equals(username) && "password".equals(password)) {
            return Map.of("token", "hardcoded-admin-token-abc123", "role", "ADMIN");
        }
        return Map.of("error", "Invalid credentials");
    }

    // API Risk 9: Verbose error leaks stack trace and internal paths to client
    @GetMapping("/api/data/process")
    public String processData(@RequestParam String input, HttpServletResponse response) {
        try {
            int result = Integer.parseInt(input) / 0;
            return "Result: " + result;
        } catch (Exception e) {
            // Exposing full stack trace to client
            response.setStatus(500);
            return "Error: " + e.toString() + "\n" + java.util.Arrays.toString(e.getStackTrace());
        }
    }

    // API Risk 10: HTTP method override accepted — allows bypassing access controls
    @RequestMapping(value = "/api/users/{id}/promote", method = {RequestMethod.GET, RequestMethod.POST})
    public String promoteUser(@PathVariable String id,
                              HttpServletRequest request) {
        // Accepts GET for a state-changing action — vulnerable to CSRF
        // Also accepts X-HTTP-Method-Override header without validation
        String overrideMethod = request.getHeader("X-HTTP-Method-Override");
        return "User " + id + " promoted to admin via " + (overrideMethod != null ? overrideMethod : request.getMethod());
    }
}
