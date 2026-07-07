package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;
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

public class DesedeExample {

    private static final String CIPHER_TRANSFORMATION = "DESede/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "DESede";
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        byte[] plaintext = "Hello DESede (3DES).".getBytes(StandardCharsets.UTF_8);

        SecretKey k1 = generateKeyWithKeyGenerator(168);
        roundTrip("KeyGenerator(168)", k1, plaintext);

        SecretKey k2 = generateKeyWithKeyGenerator(112);
        roundTrip("KeyGenerator(112)", k2, plaintext);

        byte[] raw24 = new byte[24];
        RNG.nextBytes(raw24);
        SecretKey k3 = keyFromRawBytes(raw24);
        roundTrip("SecretKeySpec(raw 24 bytes)", k3, plaintext);

        byte[] raw16 = new byte[16];
        RNG.nextBytes(raw16);
        SecretKey k4 = keyFromRawBytes(raw16);
        roundTrip("SecretKeySpec(raw 16 bytes -> 2-key expanded)", k4, plaintext);

        String b64 = Base64.getEncoder().encodeToString(k1.getEncoded());
        SecretKey k5 = keyFromBase64(b64);
        roundTrip("SecretKeySpec(from Base64)", k5, plaintext);

        SecretKey k6 = keyFromDesedeKeySpec(raw24);
        roundTrip("SecretKeyFactory + DESedeKeySpec", k6, plaintext);

        char[] password = "correct horse battery staple".toCharArray();
        byte[] salt = new byte[16];
        RNG.nextBytes(salt);
        SecretKey k7 = keyFromPasswordPbkdf2(password, salt, 120_000);
        roundTrip("PBKDF2-derived -> DESede key bytes", k7, plaintext);

        SecretKey k8 = storeAndLoadFromKeyStore(k1, "demo-alias", "changeit".toCharArray());
        roundTrip("KeyStore(JCEKS) store/load", k8, plaintext);
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

    public static SecretKey generateKeyWithKeyGenerator(int keySizeBits) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(KEY_ALGORITHM);
        keyGen.init(keySizeBits, RNG);
        return keyGen.generateKey();
    }

    public static SecretKey keyFromBase64(String base64KeyBytes) {
        byte[] keyBytes = Base64.getDecoder().decode(base64KeyBytes);
        return keyFromRawBytes(keyBytes);
    }

    public static SecretKey keyFromRawBytes(byte[] rawKeyBytes) {
        byte[] key24 = normalizeTo24Bytes(rawKeyBytes);
        applyOddParityPer8Bytes(key24);
        return new SecretKeySpec(key24, KEY_ALGORITHM);
    }

    public static SecretKey keyFromDesedeKeySpec(byte[] rawKeyBytes) throws Exception {
        byte[] key24 = normalizeTo24Bytes(rawKeyBytes);
        applyOddParityPer8Bytes(key24);
        SecretKeyFactory factory = SecretKeyFactory.getInstance(KEY_ALGORITHM);
        return factory.generateSecret(new DESedeKeySpec(key24));
    }

    public static SecretKey keyFromPasswordPbkdf2(char[] password, byte[] salt, int iterations) throws Exception {
        SecretKeyFactory kf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(password, salt, iterations, 24 * 8);
        byte[] key24 = kf.generateSecret(spec).getEncoded();
        applyOddParityPer8Bytes(key24);
        return new SecretKeySpec(key24, KEY_ALGORITHM);
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

    private static byte[] normalizeTo24Bytes(byte[] rawKeyBytes) {
        if (rawKeyBytes.length == 24) return rawKeyBytes.clone();
        if (rawKeyBytes.length == 16) {
            byte[] out = new byte[24];
            System.arraycopy(rawKeyBytes, 0, out, 0, 16);
            System.arraycopy(rawKeyBytes, 0, out, 16, 8);
            return out;
        }
        throw new IllegalArgumentException("DESede key must be 16 bytes (2-key) or 24 bytes (3-key). Got: " + rawKeyBytes.length);
    }

    private static void applyOddParityPer8Bytes(byte[] key24) {
        if (key24.length != 24) {
            throw new IllegalArgumentException("Expected 24 bytes, got: " + key24.length);
        }
        for (int block = 0; block < 3; block++) {
            int offset = block * 8;
            for (int i = 0; i < 8; i++) {
                int b = key24[offset + i] & 0xFF;
                int ones = Integer.bitCount(b);
                if ((ones & 1) == 0) {
                    key24[offset + i] ^= 0x01;
                }
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

