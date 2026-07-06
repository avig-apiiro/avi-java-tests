package com.apiiro.avigtest.sast;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Semgrep: java.spring.security.injection.taint.response-writer-xss
 * User input written directly to HTTP response - XSS vulnerability.
 */
@Controller
public class XssExample {

    // semgrep: XSS - user input written to response without encoding
    @GetMapping("/greet")
    public void greet(@RequestParam String name, HttpServletResponse response) throws IOException {
        PrintWriter out = response.getWriter();
        out.println("<html><body>Hello, " + name + "!</body></html>");
    }

    // semgrep: reflected XSS via @ResponseBody
    @GetMapping("/search")
    @ResponseBody
    public String search(@RequestParam String query) {
        return "<results>You searched for: " + query + "</results>";
    }
}
