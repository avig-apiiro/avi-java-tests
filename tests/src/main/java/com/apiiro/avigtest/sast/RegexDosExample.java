package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

/**
 * Semgrep: java.lang.security.audit.redos
 * User-controlled regex - ReDoS (Regular Expression Denial of Service).
 */
@RestController
public class RegexDosExample {

    // semgrep: ReDoS - user input compiled as regex pattern
    @GetMapping("/match")
    public boolean matchPattern(@RequestParam String pattern, @RequestParam String input) {
        Pattern compiled = Pattern.compile(pattern);
        return compiled.matcher(input).matches();
    }

    // semgrep: catastrophic backtracking pattern (evil regex)
    private static final Pattern EVIL_PATTERN = Pattern.compile("^(a+)+$");

    @GetMapping("/validate")
    public boolean validate(@RequestParam String input) {
        return EVIL_PATTERN.matcher(input).matches();
    }
}
