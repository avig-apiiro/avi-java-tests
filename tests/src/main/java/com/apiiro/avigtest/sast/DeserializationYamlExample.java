package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;
import org.yaml.snakeyaml.Yaml;

/**
 * Semgrep: java.snakeyaml.security.audit.snakeyaml-unsafe-deserialization
 * SnakeYAML used to deserialize untrusted input - RCE via YAML deserialization.
 */
@RestController
public class DeserializationYamlExample {

    // semgrep: SnakeYAML unsafe deserialization - user-controlled YAML parsed
    @PostMapping("/parse-yaml")
    public Object parseYaml(@RequestBody String yamlContent) {
        Yaml yaml = new Yaml();
        return yaml.load(yamlContent);
    }

    // semgrep: SnakeYAML loadAll from user input
    @PostMapping("/parse-all")
    public Object parseAllYaml(@RequestBody String yamlContent) {
        Yaml yaml = new Yaml();
        return yaml.loadAll(yamlContent);
    }
}
