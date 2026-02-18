package main.java.com.apiiro.avigtest;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.*;

public class RsaExample {

    private KeyPair pair;

    private RsaExample(KeyPair pair) {
        this.pair = pair;
    }

    public static RsaExample Create() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048, new SecureRandom());
        KeyPair pair = generator.generateKeyPair();
        return new RsaExample(pair);
    }

    public static RsaExample CreateFromSeed(BigInteger modulus, BigInteger publicExponent) throws NoSuchAlgorithmException, InvalidKeySpecException {
        KeyFactory kf = KeyFactory.getInstance("RSA");

// From modulus + exponent
        RSAPublicKeySpec pubSpec = new RSAPublicKeySpec(modulus, publicExponent);
        PublicKey pub = kf.generatePublic(pubSpec);
        RSAPrivateKeySpec privSpec = new RSAPrivateKeySpec(modulus, publicExponent);
        PrivateKey privateKey = kf.generatePrivate(privSpec);
        return new RsaExample(new KeyPair(pub, privateKey));
    }

    public static PublicKey CreateFromCertificate(InputStream inputStream) throws CertificateException {
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        X509Certificate cert = (X509Certificate) cf.generateCertificate(inputStream);
        return cert.getPublicKey();
    }

    public static RsaExample CreateFromEncodedBytes(byte[] encodedBytes) throws NoSuchAlgorithmException, InvalidKeySpecException {
        KeyFactory kf = KeyFactory.getInstance("RSA");

// From PKCS#8 encoded bytes (e.g. read from a .der file)
        PKCS8EncodedKeySpec privSpec = new PKCS8EncodedKeySpec(encodedBytes);
        PublicKey pub = kf.generatePublic(privSpec);
        PrivateKey priv = kf.generatePrivate(privSpec);

        return new RsaExample(new KeyPair(pub, priv));
    }
    public static RsaExample CreateFromx509(byte[] encodedBytes) throws NoSuchAlgorithmException, InvalidKeySpecException {
        KeyFactory kf = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec x509Spec = new X509EncodedKeySpec(encodedBytes);
        return new RsaExample(new KeyPair(kf.generatePublic(x509Spec), kf.generatePrivate(x509Spec)));
    }

    public static void test() throws Exception {
        RsaExample encryption = RsaExample.Create();
        String message = "To Be or not To Be";

        //Let's sign our message
        byte[] signature = encryption.sign(message);
        encryption.validate(message, signature);

        byte[] encrypted = encryption.encrypt(message);

        //Now decrypt it

        String decipheredMessage = encryption.decrypt(encrypted);

        System.out.println(decipheredMessage);
    }

    public byte[] sign(String message) throws NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        Signature privateSignature = Signature.getInstance("SHA256withRSA");
        privateSignature.initSign(pair.getPrivate());
        privateSignature.update(message.getBytes(StandardCharsets.UTF_8));
        byte[] signature = privateSignature.sign();
        return signature;
    }

    public boolean validate(String message, byte[] signature) throws NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        Signature publicSignature = Signature.getInstance("SHA256withRSA");
        publicSignature.initVerify(pair.getPublic());
        publicSignature.update(message.getBytes(StandardCharsets.UTF_8));
        return publicSignature.verify(signature);
    }

    public byte[] encrypt(String message) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        Cipher encryptCipher = Cipher.getInstance("RSA");
        encryptCipher.init(Cipher.ENCRYPT_MODE, pair.getPublic());

        return encryptCipher.doFinal(message.getBytes());

    }

    public String decrypt(byte[] encrypted) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        Cipher decriptCipher = Cipher.getInstance("RSA");
        decriptCipher.init(Cipher.DECRYPT_MODE, pair.getPrivate());
        return new String(decriptCipher.doFinal(encrypted), StandardCharsets.UTF_8);
    }


}