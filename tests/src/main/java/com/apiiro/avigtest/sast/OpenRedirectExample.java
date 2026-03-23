package com.apiiro.avigtest.sast;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Semgrep: java.spring.security.injection.taint.open-redirect
 * User-controlled URL used in redirect without validation.
 */
@Controller
public class OpenRedirectExample {

    // semgrep: open redirect - redirectUrl from user input not validated
    @GetMapping("/redirect")
    public void redirect(@RequestParam String redirectUrl, HttpServletResponse response) throws IOException {
        response.sendRedirect(redirectUrl);
    }

    // semgrep: open redirect via Spring return
    @GetMapping("/login-redirect")
    public String loginRedirect(@RequestParam String next) {
        return "redirect:" + next;
    }
}
