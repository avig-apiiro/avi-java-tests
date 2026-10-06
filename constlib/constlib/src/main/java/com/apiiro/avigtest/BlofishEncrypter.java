package main.java.com.apiiro.avigtest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;

public class BlofishEncrypter {

    public static void run() throws Exception {
        String plaintext = "Hello, Blowfish!";

        // Generate a random Blowfish key (128 bits)
        KeyGenerator keyGen = KeyGenerator.getInstance("Blowfish");
        keyGen.init(128);
        SecretKey key = keyGen.generateKey();

        // Encrypt
        Cipher cipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] iv = cipher.getIV(); // save IV for decryption
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes("UTF-8"));

        System.out.println("IV:         " + Base64.getEncoder().encodeToString(iv));
        System.out.println("Ciphertext: " + Base64.getEncoder().encodeToString(ciphertext));

        // Decrypt
        Cipher decipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding");
        decipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        byte[] decrypted = decipher.doFinal(ciphertext);

        System.out.println("Decrypted:  " + new String(decrypted, "UTF-8"));
    }
}
