package com.apiiro.avigtest.sast;

import javax.net.ssl.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;

/**
 * Semgrep: java.lang.security.audit.ssl.disabled-hostname-verification
 *          java.lang.security.audit.ssl.disabled-cert-validation
 * SSL certificate and hostname verification disabled.
 */
public class TrustAllSslExample {

    // semgrep: disabled SSL certificate validation - trusts all certs
    public HttpURLConnection createInsecureConnection(String url) throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };

        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

        // semgrep: disabled hostname verification
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

        return (HttpURLConnection) new URL(url).openConnection();
    }
}
