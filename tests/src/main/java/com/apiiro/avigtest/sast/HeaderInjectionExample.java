package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;

/**
 * Semgrep: java.lang.security.audit.response-splitting
 * User input written to HTTP response headers without sanitization.
 */
@RestController
public class HeaderInjectionExample {

    // semgrep: HTTP response splitting / header injection
    @GetMapping("/set-header")
    public void setHeader(@RequestParam String value, HttpServletResponse response) {
        // User-controlled value put in header - allows header injection
        response.setHeader("X-Custom-Header", value);
    }

    // semgrep: header injection via Location header
    @GetMapping("/set-location")
    public void setLocation(@RequestParam String location, HttpServletResponse response) {
        response.setHeader("Location", location);
        response.setStatus(302);
    }
}
