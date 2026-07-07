package com.apiiro.avigtest.dsa;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;

public final class EdDsaJava {
    static String algorithm = "Ed25519";
    public static boolean run() throws Exception {
        return sign();
    }

    private static boolean sign() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance(algorithm);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance(algorithm);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance(algorithm);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
