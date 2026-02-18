package main.java.com.apiiro.avigtest;

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;



public class CryptoPasswordBased {

    public static class EncryptedValue{
        public byte[] iv;
        public byte[] ciphertext;

        public EncryptedValue(byte[] iv, byte[] ciphertext) {
            this.iv = iv;
            this.ciphertext = ciphertext;
        }
    }

    private SecretKey secretKey;
    byte[] salt;

    public CryptoPasswordBased(String password) throws NoSuchAlgorithmException, InvalidKeySpecException {
        salt = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);
        // Derive a secret key from the password using PBKDF2
        String PASSWORD_SIGNATURE_ALGORITHM = "PBKDF2WithHmacSHA256";
        String PASSWORD_SIGNATURE_AND_ENCRYPTION_ALGO = "PBEWithHmacSHA256AndAES_256";
        SecretKeyFactory factory = SecretKeyFactory.getInstance(PASSWORD_SIGNATURE_ALGORITHM);
        SecretKeyFactory.getInstance("PBEWithHmacSHA256AndAES_256");
        PBEKeySpec keySpec = new PBEKeySpec(
            password.toCharArray(),
            salt,
            65536,    // iteration count
            256       // key length in bits
        );
        SecretKey tmp = factory.generateSecret(keySpec);
        secretKey = new SecretKeySpec(tmp.getEncoded(), "AES");
    }

    public EncryptedValue encrypt(String plaintext) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, IllegalBlockSizeException, BadPaddingException {


        // Encrypt
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] iv = cipher.getIV();
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes("UTF-8"));

        System.out.println("Salt:       " + Base64.getEncoder().encodeToString(salt));
        System.out.println("IV:         " + Base64.getEncoder().encodeToString(iv));
        System.out.println("Ciphertext: " + Base64.getEncoder().encodeToString(ciphertext));
        return new EncryptedValue(iv, ciphertext);
    }
     public String decrypt(byte[] ciphertext, byte[] iv) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException {
        Cipher decryptCipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv); // 128-bit auth tag
        decryptCipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);
        byte[] decrypted = decryptCipher.doFinal(ciphertext);

        System.out.println("Decrypted:  " + new String(decrypted, "UTF-8"));
        return new String(decrypted, "UTF-8");

    }
}
