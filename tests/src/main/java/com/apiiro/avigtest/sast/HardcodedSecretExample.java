package com.apiiro.avigtest.sast;

/**
 * SAST test: Hardcoded secret / API key.
 */
public class HardcodedSecretExample {

    // SAST: Hardcoded API key / secret
    private static final String API_KEY = "sk-1234567890abcdef1234567890abcdef";

    public String getApiKey() {
        return API_KEY;
    }
}
