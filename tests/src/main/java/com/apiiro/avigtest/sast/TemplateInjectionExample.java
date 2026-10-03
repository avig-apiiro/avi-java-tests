package com.apiiro.avigtest.sast;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Semgrep: java.spring.security.injection.taint.server-side-template-injection
 * User-controlled input used directly as Spring view name - SSTI.
 */
@Controller
public class TemplateInjectionExample {

    // semgrep: SSTI - user input returned as view name, allows template injection
    @GetMapping("/view")
    public String renderView(@RequestParam String viewName) {
        return viewName;
    }

    // semgrep: SSTI - fragment from user input
    @GetMapping("/page")
    public String renderPage(@RequestParam String page) {
        return "templates/" + page;
    }
}
