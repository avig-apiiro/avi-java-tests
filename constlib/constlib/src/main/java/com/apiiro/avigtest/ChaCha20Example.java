package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.ChaCha20ParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public final class ChaCha20Example {
    private static final String ALGORITHM = "ChaCha20";
    private static final String TRANSFORMATION = "ChaCha20";
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        byte[] plaintext = "Hello ChaCha20.".getBytes(StandardCharsets.UTF_8);

        SecretKey generated = generateKey();
        roundTrip("KeyGenerator", generated, plaintext);

        byte[] raw = new byte[32];
        RNG.nextBytes(raw);
        SecretKey fromBytes = keyFromRawBytes(raw);
        roundTrip("SecretKeySpec(raw 32 bytes)", fromBytes, plaintext);
    }

    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
        keyGen.init(256, RNG);
        return keyGen.generateKey();
    }

    public static SecretKey keyFromRawBytes(byte[] rawKeyBytes) {
        return new SecretKeySpec(rawKeyBytes, ALGORITHM);
    }

    private static void roundTrip(String label, SecretKey key, byte[] plaintext) throws Exception {
        byte[] nonce = new byte[12];
        RNG.nextBytes(nonce);

        Cipher encrypt = Cipher.getInstance(TRANSFORMATION);
        encrypt.init(Cipher.ENCRYPT_MODE, key, new ChaCha20ParameterSpec(nonce, 1));
        byte[] ciphertext = encrypt.doFinal(plaintext);

        Cipher decrypt = Cipher.getInstance(TRANSFORMATION);
        decrypt.init(Cipher.DECRYPT_MODE, key, new ChaCha20ParameterSpec(nonce, 1));
        byte[] decrypted = decrypt.doFinal(ciphertext);

        System.out.println("== " + label + " ==");
        System.out.println("key(Base64): " + Base64.getEncoder().encodeToString(key.getEncoded()));
        System.out.println("ct(Base64):  " + Base64.getEncoder().encodeToString(ciphertext));
        System.out.println("pt:          " + new String(decrypted, StandardCharsets.UTF_8));
        System.out.println();
    }
}
