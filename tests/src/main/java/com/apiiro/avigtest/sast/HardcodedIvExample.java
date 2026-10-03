package com.apiiro.avigtest.sast;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

/**
 * Semgrep: java.lang.security.audit.crypto.iv-static
 *          java.lang.security.audit.crypto.hardcoded-key
 * Hardcoded IV and encryption key used with AES.
 */
public class HardcodedIvExample {

    // semgrep: hardcoded IV - static byte array used as AES IV
    private static final byte[] HARDCODED_IV = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};

    // semgrep: hardcoded key bytes
    private static final byte[] HARDCODED_KEY = "ThisIsASecretKey".getBytes();

    public byte[] encrypt(String data, SecretKey key) throws Exception {
        IvParameterSpec iv = new IvParameterSpec(HARDCODED_IV);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        // semgrep: hardcoded IV used in cipher init
        cipher.init(Cipher.ENCRYPT_MODE, key, iv);
        return cipher.doFinal(data.getBytes());
    }
}
