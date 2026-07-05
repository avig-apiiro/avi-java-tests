package main.java.com.apiiro.avigtest;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.X509EncodedKeySpec;

public final class EcExample {
    private static final SecureRandom RNG = new SecureRandom();

    public static void main(String[] args) throws Exception {
        KeyPair p256 = generateNamedCurve();
        System.out.println("secp256r1 -> " + p256.getPublic().getAlgorithm());



        KeyPair byBits = generateByKeySize();
        System.out.println("EC(256) -> " + byBits.getPublic().getAlgorithm());

        PublicKey restored = restorePublicKey(p256.getPublic().getEncoded());
        System.out.println("restored -> " + restored.getAlgorithm());
    }

    public static KeyPair generateNamedCurve() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"), RNG);
        return generator.generateKeyPair();
    }

    public static KeyPair generateByKeySize() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(256, RNG);
        return generator.generateKeyPair();
    }

    public static PublicKey restorePublicKey(byte[] x509Bytes) throws Exception {
        KeyFactory keyFactory = KeyFactory.getInstance("EC");
        return keyFactory.generatePublic(new X509EncodedKeySpec(x509Bytes));
    }
}
