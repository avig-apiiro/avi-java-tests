package com.apiiro.avigtest.sast;

/**
 * Secrets risk: Multiple hardcoded credentials and API keys.
 */
public class SecretsConfig {

    // Hardcoded AWS credentials
    public static final String AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
    public static final String AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

    // Hardcoded database password
    public static final String DB_PASSWORD = "SuperSecretDbPassword123!";

    // Hardcoded private key (RSA)
    public static final String PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\n" +
        "MIIEowIBAAKCAQEA2a2rwplBQLzHPZe5RJr9xAMNVMJZ+dRMPT8SL8lRGHtXFJPy\n" +
        "-----END RSA PRIVATE KEY-----";

    // Hardcoded Stripe secret key (test)
    public static final String STRIPE_SECRET_KEY = "sk_test_EXAMPLE_DO_NOT_USE_1234567890";

    // Hardcoded GitHub token (test)
    public static final String GITHUB_TOKEN = "github_pat_EXAMPLE_DO_NOT_USE_1234567890";
}
