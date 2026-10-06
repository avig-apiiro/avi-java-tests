package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.RC5ParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

// RC5 is provided by BouncyCastle rather than the built-in SunJCE provider. These calls
// illustrate the JCE API surface for RC5; running them requires a provider that supports RC5.
public final class Rc5Example {
    private static final String TRANSFORMATION = "RC5/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "RC5";
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        byte[] plaintext = "Hello RC5.".getBytes(StandardCharsets.UTF_8);

        SecretKey generated = generateKey();
        roundTrip("KeyGenerator", generated, plaintext);

        byte[] raw = new byte[16];
        RNG.nextBytes(raw);
        SecretKey fromBytes = keyFromRawBytes(raw);
        roundTrip("SecretKeySpec(raw 16 bytes)", fromBytes, plaintext);
    }

    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(KEY_ALGORITHM);
        keyGen.init(128, RNG);
        return keyGen.generateKey();
    }

    public static SecretKey keyFromRawBytes(byte[] rawKeyBytes) {
        return new SecretKeySpec(rawKeyBytes, KEY_ALGORITHM);
    }

    private static void roundTrip(String label, SecretKey key, byte[] plaintext) throws Exception {
        byte[] iv = new byte[8];
        RNG.nextBytes(iv);
        RC5ParameterSpec params = new RC5ParameterSpec(1, 12, 32, iv);

        Cipher encrypt = Cipher.getInstance(TRANSFORMATION);
        encrypt.init(Cipher.ENCRYPT_MODE, key, params);
        byte[] ciphertext = encrypt.doFinal(plaintext);

        Cipher decrypt = Cipher.getInstance(TRANSFORMATION);
        decrypt.init(Cipher.DECRYPT_MODE, key, params);
        byte[] decrypted = decrypt.doFinal(ciphertext);

        System.out.println("== " + label + " ==");
        System.out.println("ct(Base64): " + Base64.getEncoder().encodeToString(ciphertext));
        System.out.println("pt:         " + new String(decrypted, StandardCharsets.UTF_8));
        System.out.println();
    }
}
