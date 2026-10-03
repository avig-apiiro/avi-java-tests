package com.apiiro.avigtest.api;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API Security risk: Admin endpoints exposed without authentication or authorization checks.
 */
@RestController
@RequestMapping("/admin")
public class UnauthenticatedAdminController {

    // API risk: sensitive admin endpoint with no authentication
    @GetMapping("/users")
    public List<Map<String, String>> getAllUsers() {
        return List.of(
            Map.of("username", "admin", "password", "admin123", "role", "ADMIN"),
            Map.of("username", "user1", "password", "pass123", "role", "USER")
        );
    }

    // API risk: delete all data endpoint with no auth check
    @DeleteMapping("/data/purge")
    public String purgeAllData() {
        return "All data purged";
    }

    // API risk: returns raw database connection info
    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of(
            "db_host", "prod-db.internal",
            "db_user", "root",
            "db_password", "SuperSecret123!",
            "aws_access_key", "AKIAIOSFODNN7EXAMPLE",
            "aws_secret_key", "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
        );
    }
}
