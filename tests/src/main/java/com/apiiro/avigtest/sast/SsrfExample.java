package com.apiiro.avigtest.sast;

import java.io.InputStream;
import java.net.URL;

/**
 * SAST risk: SSRF (Server-Side Request Forgery) - user-controlled URL fetched without validation.
 */
public class SsrfExample {

    public InputStream fetchUrl(String userSuppliedUrl) throws Exception {
        // SAST: SSRF - user-controlled URL used directly in server-side request
        URL url = new URL(userSuppliedUrl);
        return url.openStream();
    }
}
