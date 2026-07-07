package com.apiiro.avigtest.dsa;

import org.bouncycastle.pqc.jcajce.spec.XMSSParameterSpec;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;

public final class XmssBouncyCastle {

    private static final SecureRandom RNG = new SecureRandom();

    public static boolean run() throws Exception {
        Providers.register();

        KeyPairGenerator generator = KeyPairGenerator.getInstance("XMSS", Providers.BCPQC);
        generator.initialize(new XMSSParameterSpec(10, XMSSParameterSpec.SHA256), RNG);
        KeyPair pair = generator.generateKeyPair();

        byte[] message = "The quick brown fox".getBytes(StandardCharsets.UTF_8);

        Signature signer = Signature.getInstance("XMSS-SHA256", Providers.BCPQC);
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("XMSS-SHA256", Providers.BCPQC);
        verifier.initVerify(pair.getPublic());
        verifier.update(message);
        return verifier.verify(signature);
    }
}
