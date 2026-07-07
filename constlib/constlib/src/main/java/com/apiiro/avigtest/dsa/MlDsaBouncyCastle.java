package com.apiiro.avigtest.dsa;

import org.bouncycastle.jcajce.spec.MLDSAParameterSpec;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;

public final class MlDsaBouncyCastle {

    private static final SecureRandom RNG = new SecureRandom();

    public static boolean run() throws Exception {
        Providers.register();

        KeyPairGenerator generator = KeyPairGenerator.getInstance("ML-DSA", Providers.BC);
        generator.initialize(MLDSAParameterSpec.ml_dsa_65, RNG);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance("ML-DSA", Providers.BC);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("ML-DSA", Providers.BC);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
