package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * Semgrep: java.lang.security.audit.command-injection-process-builder
 * User input passed to ProcessBuilder without sanitization.
 */
@RestController
public class ProcessBuilderInjectionExample {

    // semgrep: command injection via ProcessBuilder with user-controlled args
    @GetMapping("/exec")
    public String executeCommand(@RequestParam String host) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("nslookup", host);
        pb.redirectErrorStream(true);
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        return output.toString();
    }

    // semgrep: command injection via shell=true equivalent (passing to /bin/sh)
    @PostMapping("/run")
    public String runScript(@RequestParam String script) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("/bin/sh", "-c", script);
        Process process = pb.start();
        return "Exit code: " + process.waitFor();
    }
}
