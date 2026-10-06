package com.apiiro.avigtest.dsa;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;

import java.security.Security;

public final class Providers {

    public static final String BC = BouncyCastleProvider.PROVIDER_NAME;
    public static final String BCPQC = BouncyCastlePQCProvider.PROVIDER_NAME;

    private Providers() {
    }

    public static void register() {
        if (Security.getProvider(BC) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        if (Security.getProvider(BCPQC) == null) {
            Security.addProvider(new BouncyCastlePQCProvider());
        }
    }
}
