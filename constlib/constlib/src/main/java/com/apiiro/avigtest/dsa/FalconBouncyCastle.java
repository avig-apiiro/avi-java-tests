package com.apiiro.avigtest.dsa;

import org.bouncycastle.pqc.jcajce.spec.FalconParameterSpec;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;

public final class FalconBouncyCastle {

    private static final SecureRandom RNG = new SecureRandom();

    public static boolean run() throws Exception {
        Providers.register();

        KeyPairGenerator generator = KeyPairGenerator.getInstance("Falcon", Providers.BCPQC);
        generator.initialize(FalconParameterSpec.falcon_512, RNG);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance("Falcon", Providers.BCPQC);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("Falcon", Providers.BCPQC);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
