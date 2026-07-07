package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class CryptoUtils {
    private static final SecureRandom random = new SecureRandom();

    public static SecretKey CreateAes256() throws NoSuchAlgorithmException {

        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256);
        return keyGen.generateKey();
    }
    public static class Result {
        public byte[] iv;
        public String cipherText;
    }


    public static  String TRANSFORMATION_AES_MODE_CBC = "AES/CBC/PKCS5Padding";

    //format is alorithm/mode/padding
//    Algorithms
//    Algorithm	Description
//    AES	Advanced Encryption Standard (128/192/256-bit keys)
//    DES	Data Encryption Standard (56-bit key, insecure)
//    DESede	Triple DES (168-bit key)
//    RSA	RSA asymmetric encryption
//    Blowfish	Blowfish symmetric cipher
//    RC2	RC2 symmetric cipher
//    RC4 (or ARCFOUR)	Stream cipher (insecure)
//    ChaCha20	ChaCha20 stream cipher (Java 11+)
//    ChaCha20-Poly1305	Authenticated encryption (Java 11+)
    public static Result encrypt(
        String transformation, // e.g. "AES/GCM/NoPadding"
        SecretKey key,
        byte[] plaintext
    ) throws Exception {

        Cipher cipher = Cipher.getInstance(transformation);

        byte[] iv = new byte[12]; // 12 bytes recommended for GCM
        random.nextBytes(iv);

        if (transformation.contains("GCM")) {
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        } else {
            IvParameterSpec spec = new IvParameterSpec(iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        }

        byte[] encrypted = cipher.doFinal(plaintext);

        Result result = new Result();
        result.iv = iv;
        result.cipherText = Base64.getEncoder().encodeToString(encrypted);
        return result;
    }



}
