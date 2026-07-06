package com.apiiro.avigtest.dsa;

import org.bouncycastle.pqc.jcajce.spec.SPHINCSPlusParameterSpec;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;
import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;


public final class SphincsPlusBouncyCastle {

    private static final SecureRandom RNG = new SecureRandom();

    public static boolean run() throws Exception {
        Providers.register();

        KeyPairGenerator generator = KeyPairGenerator.getInstance("SPHINCSPlus", BouncyCastlePQCProvider.PROVIDER_NAME);
        generator.initialize(SPHINCSPlusParameterSpec.sha2_128s, RNG);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance("SPHINCSPlus", Providers.BCPQC);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("SPHINCSPlus", Providers.BCPQC);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
