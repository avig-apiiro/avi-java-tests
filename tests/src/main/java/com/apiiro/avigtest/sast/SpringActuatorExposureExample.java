package com.apiiro.avigtest.sast;

import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Semgrep: java.spring.security.audit.spring-actuator-fully-exposed
 * Custom actuator endpoint exposing sensitive internal state without auth.
 */
@Component
@Endpoint(id = "internal-debug")
public class SpringActuatorExposureExample {

    // semgrep: sensitive actuator endpoint - exposes system internals without security
    @ReadOperation
    public Map<String, Object> debugInfo() {
        return Map.of(
            "javaVersion", System.getProperty("java.version"),
            "userHome", System.getProperty("user.home"),
            "dbPassword", System.getenv("DB_PASSWORD"),
            "awsKey", System.getenv("AWS_SECRET_ACCESS_KEY"),
            "classpath", System.getProperty("java.class.path"),
            "heapMemory", Runtime.getRuntime().totalMemory()
        );
    }
}
