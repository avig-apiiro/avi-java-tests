package com.apiiro.avigtest.secrets;

/**
 * 10 hardcoded secret risks — detected by Apiiro Secrets scanning and Semgrep.
 */
public class HardcodedSecrets {

    // Secret 1: AWS Access Key + Secret
    private static final String AWS_ACCESS_KEY_ID     = "AKIAIOSFODNN7EXAMPLEKEY";
    private static final String AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY1";

    // Secret 2: Database password — loaded from environment variable (Apiiro remediation applied)
    private static final String DB_PASSWORD = System.getenv("DB_PASSWORD");

    // Secret 3: Hardcoded database URL with credentials embedded
    private static final String DB_URL = "jdbc:postgresql://prod-db.internal:5432/appdb?user=admin&password=ProdDbPass123!";

    // Secret 4: Hardcoded JWT signing secret
    private static final String JWT_SECRET = "my-super-secret-jwt-signing-key-do-not-share";

    // Secret 5: Hardcoded SendGrid API key
    private static final String SENDGRID_API_KEY = "SG.EXAMPLE_SENDGRID_KEY_1234567890abcdefghij";

    // Secret 6: Hardcoded messaging service credentials
    private static final String MESSAGING_ACCOUNT_ID = "MSG_ACCOUNT_EXAMPLE_DO_NOT_USE_1234";
    private static final String MESSAGING_AUTH_TOKEN  = "msg_auth_token_example_do_not_use_99";

    // Secret 7: Hardcoded RSA private key
    private static final String RSA_PRIVATE_KEY =
        "-----BEGIN RSA PRIVATE KEY-----\n" +
        "MIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHAA==\n" +
        "-----END RSA PRIVATE KEY-----";

    // Secret 8: Hardcoded OAuth client secret
    private static final String OAUTH_CLIENT_ID     = "my-oauth-client-id-12345";
    private static final String OAUTH_CLIENT_SECRET = "oauth-client-secret-abcdefghij-999";

    // Secret 9: Hardcoded encryption key (AES-256)
    private static final String ENCRYPTION_KEY = "AES256EncryptionKeyHardcoded1234";

    // Secret 10: Hardcoded SMTP password
    private static final String SMTP_HOST     = "smtp.gmail.com";
    private static final String SMTP_USERNAME = "app-notifications@company.com";
    private static final String SMTP_PASSWORD = "Gmail@ppP@ssword999!";

    public String getDbUrl()           { return DB_URL; }
    public String getJwtSecret()       { return JWT_SECRET; }
    public String getSmtpPassword()    { return SMTP_PASSWORD; }
    public String getEncryptionKey()   { return ENCRYPTION_KEY; }
}
