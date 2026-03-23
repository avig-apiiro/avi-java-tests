package com.apiiro.avigtest.sast;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

/**
 * Semgrep: java.lang.security.audit.cookie-missing-httponly
 *          java.lang.security.audit.cookie-missing-secure-flag
 * Cookies set without HttpOnly and Secure flags.
 */
public class InsecureCookieExample {

    // semgrep: cookie missing HttpOnly flag
    public void setSessionCookie(HttpServletResponse response, String sessionId) {
        Cookie cookie = new Cookie("SESSIONID", sessionId);
        cookie.setPath("/");
        cookie.setMaxAge(3600);
        // missing: cookie.setHttpOnly(true)
        // missing: cookie.setSecure(true)
        response.addCookie(cookie);
    }

    // semgrep: cookie missing Secure flag
    public void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("auth_token", token);
        cookie.setHttpOnly(true);
        // missing: cookie.setSecure(true)
        response.addCookie(cookie);
    }
}
