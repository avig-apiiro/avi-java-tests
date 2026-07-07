package com.apiiro.avigtest.dsa;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Callable;

public final class DsaShowcase {

    private static final Map<String, Callable<Boolean>> ALGORITHMS = build();

    public static void main(String[] args) {
        int passed = 0;
        for (Map.Entry<String, Callable<Boolean>> entry : ALGORITHMS.entrySet()) {
            try {
                boolean verified = entry.getValue().call();
                System.out.printf("%-28s %s%n", entry.getKey(), verified ? "OK" : "VERIFY FAILED");
                if (verified) {
                    passed++;
                }
            } catch (Exception e) {
                System.out.printf("%-28s ERROR: %s%n", entry.getKey(), e);
            }
        }
        System.out.printf("%n%d/%d algorithms verified%n", passed, ALGORITHMS.size());
    }

    private static Map<String, Callable<Boolean>> build() {
        Map<String, Callable<Boolean>> map = new LinkedHashMap<>();
        map.put("DSA (Java)", DsaJava::run);
        map.put("ECDSA (Java)", EcDsaJava::run);
        map.put("EdDSA (Java)", EdDsaJava::run);
        map.put("RSASSA-PSS (Java)", RsaPssJava::run);
        map.put("ECDSA (BouncyCastle)", EcDsaBouncyCastle::run);
        map.put("EdDSA (BouncyCastle)", EdDsaBouncyCastle::run);
        map.put("SM2 (BouncyCastle)", Sm2BouncyCastle::run);
        map.put("GOST 34.10-2012 (BC)", Gost3410BouncyCastle::run);
        map.put("ML-DSA (BouncyCastle)", MlDsaBouncyCastle::run);
        map.put("SLH-DSA (BouncyCastle)", SlhDsaBouncyCastle::run);
        map.put("Falcon (BouncyCastle)", FalconBouncyCastle::run);
        map.put("SPHINCS+ (BouncyCastle)", SphincsPlusBouncyCastle::run);
        map.put("Dilithium (BouncyCastle)", DilithiumBouncyCastle::run);
        map.put("XMSS (BouncyCastle)", XmssBouncyCastle::run);
        map.put("XMSS^MT (BouncyCastle)", XmssMtBouncyCastle::run);
        map.put("LMS (BouncyCastle)", LmsBouncyCastle::run);
        map.put("Picnic (BouncyCastle)", PicnicBouncyCastle::run);
        return map;
    }
}
