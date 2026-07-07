package com.apiiro.avigtest.dsa;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;

public final class Sm2BouncyCastle {

    private static final SecureRandom RNG = new SecureRandom();

    public static boolean run() throws Exception {
        Providers.register();

        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC", Providers.BC);
        generator.initialize(new ECGenParameterSpec("sm2p256v1"), RNG);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance("SM3withSM2", Providers.BC);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("SM3withSM2", Providers.BC);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
