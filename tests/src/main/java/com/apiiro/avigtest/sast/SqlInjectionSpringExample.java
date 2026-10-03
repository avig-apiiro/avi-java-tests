package com.apiiro.avigtest.sast;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

/**
 * Semgrep: java.spring.security.injection.taint.sql-injection
 * Spring JdbcTemplate used with string-concatenated SQL - SQL injection.
 */
@RestController
public class SqlInjectionSpringExample {

    private final JdbcTemplate jdbcTemplate;

    public SqlInjectionSpringExample(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // semgrep: SQL injection via JdbcTemplate.query with concatenated input
    @GetMapping("/users/search")
    public Object searchUsers(@RequestParam String name) {
        String sql = "SELECT * FROM users WHERE name LIKE '%" + name + "%'";
        return jdbcTemplate.queryForList(sql);
    }

    // semgrep: SQL injection via JdbcTemplate.execute
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable String id) {
        jdbcTemplate.execute("DELETE FROM users WHERE id = " + id);
    }

    // semgrep: SQL injection via JdbcTemplate.update
    @PostMapping("/users/update-role")
    public void updateRole(@RequestParam String userId, @RequestParam String role) {
        jdbcTemplate.update("UPDATE users SET role = '" + role + "' WHERE id = " + userId);
    }
}
