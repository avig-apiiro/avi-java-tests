package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

/**
 * Semgrep: java.lang.security.audit.script-engine-injection
 * User input evaluated by JavaScript engine - RCE risk.
 */
@RestController
public class ScriptEngineInjectionExample {

    // semgrep: script injection - user input evaluated by Nashorn/Rhino JS engine
    @PostMapping("/evaluate")
    public Object evaluate(@RequestParam String expression) throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("JavaScript");
        return engine.eval(expression);
    }

    // semgrep: Groovy script injection
    @PostMapping("/run-groovy")
    public Object runGroovy(@RequestParam String script) throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("groovy");
        return engine.eval(script);
    }
}
