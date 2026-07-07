package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.Base64;

public final class DesExample {
    private static final String CIPHER_TRANSFORMATION = "DES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "DES";
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        byte[] plaintext = "Hello DES.".getBytes(StandardCharsets.UTF_8);

        SecretKey k1 = generateKeyWithKeyGenerator();
        roundTrip("KeyGenerator", k1, plaintext);

        byte[] raw8 = new byte[8];
        RNG.nextBytes(raw8);
        SecretKey k2 = keyFromRawBytes(raw8);
        roundTrip("SecretKeySpec(raw 8 bytes)", k2, plaintext);

        String b64 = Base64.getEncoder().encodeToString(k1.getEncoded());
        SecretKey k3 = keyFromBase64(b64);
        roundTrip("SecretKeySpec(from Base64)", k3, plaintext);

        SecretKey k4 = keyFromDesKeySpec(raw8);
        roundTrip("SecretKeyFactory + DESKeySpec", k4, plaintext);

        char[] password = "correct horse battery staple".toCharArray();
        byte[] salt = new byte[16];
        RNG.nextBytes(salt);
        SecretKey k5 = keyFromPasswordPbkdf2(password, salt, 120_000);
        roundTrip("PBKDF2-derived -> DES key bytes", k5, plaintext);

        SecretKey k6 = storeAndLoadFromKeyStore(k1, "demo-alias", "changeit".toCharArray());
        roundTrip("KeyStore(JCEKS) store/load", k6, plaintext);
    }

    private static void roundTrip(String label, SecretKey key, byte[] plaintext) throws Exception {
        EncryptedPayload enc = encrypt(key, plaintext);
        byte[] dec = decrypt(key, enc.iv, enc.ciphertext);
        boolean ok = Arrays.equals(plaintext, dec);

        System.out.println("== " + label + " ==");
        System.out.println("key(Base64): " + Base64.getEncoder().encodeToString(key.getEncoded()));
        System.out.println("iv(Base64):  " + Base64.getEncoder().encodeToString(enc.iv));
        System.out.println("ct(Base64):  " + Base64.getEncoder().encodeToString(enc.ciphertext));
        System.out.println("pt:          " + new String(dec, StandardCharsets.UTF_8));
        System.out.println("ok:          " + ok);
        System.out.println();
    }

    public static EncryptedPayload encrypt(SecretKey key, byte[] plaintext) throws Exception {
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        byte[] iv = new byte[cipher.getBlockSize()];
        RNG.nextBytes(iv);

        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
        byte[] ciphertext = cipher.doFinal(plaintext);
        return new EncryptedPayload(iv, ciphertext);
    }

    public static byte[] decrypt(SecretKey key, byte[] iv, byte[] ciphertext) throws Exception {
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        return cipher.doFinal(ciphertext);
    }

    public static SecretKey generateKeyWithKeyGenerator() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(KEY_ALGORITHM);
        keyGen.init(56, RNG);
        return keyGen.generateKey();
    }

    public static SecretKey keyFromBase64(String base64KeyBytes) {
        byte[] keyBytes = Base64.getDecoder().decode(base64KeyBytes);
        return keyFromRawBytes(keyBytes);
    }

    public static SecretKey keyFromRawBytes(byte[] rawKeyBytes) {
        byte[] key8 = normalizeTo8Bytes(rawKeyBytes);
        applyOddParityPerByte(key8);
        return new SecretKeySpec(key8, KEY_ALGORITHM);
    }

    public static SecretKey keyFromDesKeySpec(byte[] rawKeyBytes) throws Exception {
        byte[] key8 = normalizeTo8Bytes(rawKeyBytes);
        applyOddParityPerByte(key8);
        SecretKeyFactory factory = SecretKeyFactory.getInstance(KEY_ALGORITHM);
        return factory.generateSecret(new DESKeySpec(key8));
    }

    public static SecretKey keyFromPasswordPbkdf2(char[] password, byte[] salt, int iterations) throws Exception {
        SecretKeyFactory kf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(password, salt, iterations, 8 * 8);
        byte[] key8 = kf.generateSecret(spec).getEncoded();
        applyOddParityPerByte(key8);
        return new SecretKeySpec(key8, KEY_ALGORITHM);
    }

    public static SecretKey storeAndLoadFromKeyStore(SecretKey key, String alias, char[] keyStorePassword) throws Exception {
        KeyStore ks = KeyStore.getInstance("JCEKS");
        ks.load(null, keyStorePassword);

        KeyStore.ProtectionParameter prot = new KeyStore.PasswordProtection(keyStorePassword);
        ks.setEntry(alias, new KeyStore.SecretKeyEntry(key), prot);

        Key loaded = ks.getKey(alias, keyStorePassword);
        if (!(loaded instanceof SecretKey)) {
            throw new IllegalStateException("Loaded key is not a SecretKey");
        }
        return (SecretKey) loaded;
    }

    private static byte[] normalizeTo8Bytes(byte[] rawKeyBytes) {
        if (rawKeyBytes.length == 8) return rawKeyBytes.clone();
        throw new IllegalArgumentException("DES key must be 8 bytes. Got: " + rawKeyBytes.length);
    }

    private static void applyOddParityPerByte(byte[] key8) {
        if (key8.length != 8) {
            throw new IllegalArgumentException("Expected 8 bytes, got: " + key8.length);
        }
        for (int i = 0; i < key8.length; i++) {
            int b = key8[i] & 0xFF;
            int ones = Integer.bitCount(b);
            if ((ones & 1) == 0) {
                key8[i] ^= 0x01;
            }
        }
    }

    public static final class EncryptedPayload {
        public final byte[] iv;
        public final byte[] ciphertext;

        public EncryptedPayload(byte[] iv, byte[] ciphertext) {
            this.iv = iv;
            this.ciphertext = ciphertext;
        }
    }
}