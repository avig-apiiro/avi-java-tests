package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public final class ChaCha20Poly1305Example {
    private static final String KEY_ALGORITHM = "ChaCha20";
    private static final String TRANSFORMATION = "ChaCha20-Poly1305";
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        byte[] plaintext = "Hello ChaCha20-Poly1305.".getBytes(StandardCharsets.UTF_8);
        byte[] associatedData = "header".getBytes(StandardCharsets.UTF_8);

        SecretKey key = generateKey();
        byte[] nonce = new byte[12];
        RNG.nextBytes(nonce);

        Cipher encrypt = Cipher.getInstance(TRANSFORMATION);
        encrypt.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(nonce));
        encrypt.updateAAD(associatedData);
        byte[] ciphertext = encrypt.doFinal(plaintext);

        Cipher decrypt = Cipher.getInstance(TRANSFORMATION);
        decrypt.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(nonce));
        decrypt.updateAAD(associatedData);
        byte[] decrypted = decrypt.doFinal(ciphertext);

        System.out.println("key(Base64): " + Base64.getEncoder().encodeToString(key.getEncoded()));
        System.out.println("ct(Base64):  " + Base64.getEncoder().encodeToString(ciphertext));
        System.out.println("pt:          " + new String(decrypted, StandardCharsets.UTF_8));
    }

    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(KEY_ALGORITHM);
        keyGen.init(256, RNG);
        return keyGen.generateKey();
    }

    public static SecretKey keyFromRawBytes(byte[] rawKeyBytes) {
        return new SecretKeySpec(rawKeyBytes, KEY_ALGORITHM);
    }
}
