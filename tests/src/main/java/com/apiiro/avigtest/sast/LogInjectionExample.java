package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;

/**
 * Semgrep: java.lang.security.audit.log-injection
 *          java.spring.log4shell (JNDI injection via logging)
 * User input logged without sanitization - log injection / Log4Shell.
 */
@RestController
public class LogInjectionExample {

    private static final Logger logger = Logger.getLogger(LogInjectionExample.class.getName());

    // semgrep: log injection - user-controlled input written to log
    @GetMapping("/log")
    public String logAction(@RequestParam String action) {
        logger.info("User performed action: " + action);
        return "logged";
    }

    // semgrep: log4shell - JNDI lookup triggered via user-controlled input to logger
    @PostMapping("/process")
    public String process(@RequestHeader("X-Api-Version") String apiVersion) {
        logger.info("Processing request with API version: " + apiVersion);
        return "processed";
    }
}
