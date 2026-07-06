package com.apiiro.avigtest.sast;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Semgrep: java.lang.security.audit.crypto.weak-hash / weak-cipher
 * Multiple weak cryptographic algorithm usages.
 */
public class WeakCryptoExample {

    // semgrep: weak hash - MD5 used for security-sensitive operation
    public byte[] hashPasswordMd5(String password) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        return md.digest(password.getBytes());
    }

    // semgrep: weak hash - SHA1 used
    public byte[] hashPasswordSha1(String password) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        return md.digest(password.getBytes());
    }

    // semgrep: weak cipher - DES used
    public byte[] encryptDES(String data) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("DES");
        SecretKey key = keyGen.generateKey();
        Cipher cipher = Cipher.getInstance("DES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data.getBytes());
    }

    // semgrep: weak cipher - AES/ECB mode (no IV, deterministic)
    public byte[] encryptAesEcb(String data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data.getBytes());
    }

    // semgrep: RC4 (broken stream cipher)
    public byte[] encryptRC4(String data) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("RC4");
        SecretKey key = keyGen.generateKey();
        Cipher cipher = Cipher.getInstance("RC4");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data.getBytes());
    }
}
