package com.apiiro.avigtest.sast;

import javax.naming.InitialContext;
import org.springframework.web.bind.annotation.*;

/**
 * Semgrep: java.lang.security.audit.jndi-injection
 *          Log4Shell-style JNDI injection - user input used in JNDI lookup.
 */
@RestController
public class JndiInjectionExample {

    // semgrep: JNDI injection - user-controlled name passed to InitialContext.lookup
    @GetMapping("/lookup")
    public Object jndiLookup(@RequestParam String name) throws Exception {
        InitialContext ctx = new InitialContext();
        return ctx.lookup(name);
    }

    // semgrep: JNDI injection via datasource name
    @PostMapping("/connect")
    public String connect(@RequestParam String datasource) throws Exception {
        InitialContext ctx = new InitialContext();
        Object ds = ctx.lookup("java:comp/env/" + datasource);
        return "Connected to: " + ds.toString();
    }
}
