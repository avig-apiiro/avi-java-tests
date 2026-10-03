package com.apiiro.avigtest.sast;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.naming.InitialContext;
import javax.net.ssl.*;
import javax.script.ScriptEngineManager;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.*;
import java.net.URL;
import java.security.MessageDigest;
import java.security.cert.X509Certificate;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Random;
import java.util.logging.Logger;

/**
 * 20 Semgrep Managed Ruleset findings covering Critical / High / Medium / Low severities.
 * Triggers POLICY-107 (Low), POLICY-108 (Medium), POLICY-195 (High), POLICY-255 (Critical).
 */
@RestController
@RequestMapping("/risks")
public class ManagedSemgrepRisks {

    private static final Logger log = Logger.getLogger(ManagedSemgrepRisks.class.getName());
    private JdbcTemplate jdbcTemplate;

    // ─────────────────────────────────────────────────────────
    // CRITICAL
    // ─────────────────────────────────────────────────────────

    // 1. SQL Injection (taint) — java.spring.security.injection.taint.sql-injection [CRITICAL]
    @GetMapping("/sqli")
    public Object sqlInjection(@RequestParam String username) {
        return jdbcTemplate.queryForList("SELECT * FROM users WHERE username = '" + username + "'");
    }

    // 2. Command Injection via Runtime.exec — java.lang.security.audit.command-injection [CRITICAL]
    @GetMapping("/cmdi")
    public String commandInjection(@RequestParam String host) throws Exception {
        Process p = Runtime.getRuntime().exec("ping -c 1 " + host);
        return new String(p.getInputStream().readAllBytes());
    }

    // 3. Command Injection via ProcessBuilder — java.lang.security.audit.command-injection-process-builder [CRITICAL]
    @PostMapping("/exec")
    public String processBuilderInjection(@RequestParam String cmd) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("/bin/sh", "-c", cmd);
        return "exit: " + pb.start().waitFor();
    }

    // 4. JNDI Injection — java.lang.security.audit.jndi-injection [CRITICAL]
    @GetMapping("/jndi")
    public Object jndiInjection(@RequestParam String name) throws Exception {
        return new InitialContext().lookup(name);
    }

    // 5. Script Engine Injection (RCE) — java.lang.security.audit.script-engine-injection [CRITICAL]
    @PostMapping("/eval")
    public Object scriptInjection(@RequestParam String script) throws Exception {
        return new ScriptEngineManager().getEngineByName("JavaScript").eval(script);
    }

    // 6. Insecure Deserialization — java.lang.security.audit.object-deserialization [CRITICAL]
    @PostMapping("/deserialize")
    public Object deserialize(@RequestBody byte[] data) throws Exception {
        return new ObjectInputStream(new ByteArrayInputStream(data)).readObject();
    }

    // 7. SSRF — java.lang.security.audit.ssrf [CRITICAL]
    @GetMapping("/fetch")
    public String ssrf(@RequestParam String url) throws Exception {
        return new String(new URL(url).openStream().readAllBytes());
    }

    // ─────────────────────────────────────────────────────────
    // HIGH
    // ─────────────────────────────────────────────────────────

    // 8. Path Traversal — java.lang.security.audit.path-traversal [HIGH]
    @GetMapping("/file")
    public String pathTraversal(@RequestParam String filename) throws Exception {
        return new String(new FileInputStream("/var/app/" + filename).readAllBytes());
    }

    // 9. XXE — java.lang.security.audit.xxe [HIGH]
    @PostMapping("/xml")
    public String xxe(@RequestBody InputStream body) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.newDocumentBuilder().parse(body);
        return "parsed";
    }

    // 10. LDAP Injection — java.lang.security.audit.ldap-injection [HIGH]
    @GetMapping("/ldap")
    public String ldapInjection(@RequestParam String user) throws Exception {
        new InitialContext().search("dc=example,dc=com", "(uid=" + user + ")", null);
        return "searched";
    }

    // 11. XPath Injection — java.lang.security.audit.xpath-injection [HIGH]
    @GetMapping("/xpath")
    public Object xpathInjection(@RequestParam String user, @RequestParam String pass) throws Exception {
        String expr = "//user[name='" + user + "' and password='" + pass + "']";
        return XPathFactory.newInstance().newXPath().evaluate(expr, (Object) null, XPathConstants.NODESET);
    }

    // 12. Disabled SSL Certificate Validation — java.lang.security.audit.ssl.disabled-cert-validation [HIGH]
    @GetMapping("/ssl")
    public String disabledSslValidation(@RequestParam String url) throws Exception {
        TrustManager[] trustAll = { new X509TrustManager() {
            public void checkClientTrusted(X509Certificate[] c, String a) {}
            public void checkServerTrusted(X509Certificate[] c, String a) {}
            public X509Certificate[] getAcceptedIssuers() { return null; }
        }};
        SSLContext ctx = SSLContext.getInstance("TLS");
        ctx.init(null, trustAll, null);
        HttpsURLConnection.setDefaultSSLSocketFactory(ctx.getSocketFactory());
        HttpsURLConnection.setDefaultHostnameVerifier((h, s) -> true);
        return new String(new URL(url).openStream().readAllBytes());
    }

    // 13. Unsafe Reflection — java.lang.security.audit.unsafe-reflection [HIGH]
    @GetMapping("/reflect")
    public Object unsafeReflection(@RequestParam String className) throws Exception {
        return Class.forName(className).getDeclaredConstructor().newInstance();
    }

    // ─────────────────────────────────────────────────────────
    // MEDIUM
    // ─────────────────────────────────────────────────────────

    // 14. Weak Hash MD5 — java.lang.security.audit.crypto.weak-hash [MEDIUM]
    public byte[] weakHashMd5(String password) throws Exception {
        return MessageDigest.getInstance("MD5").digest(password.getBytes());
    }

    // 15. Weak Cipher DES — java.lang.security.audit.crypto.weak-cipher [MEDIUM]
    public byte[] weakCipherDes(String data) throws Exception {
        SecretKey key = KeyGenerator.getInstance("DES").generateKey();
        Cipher cipher = Cipher.getInstance("DES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data.getBytes());
    }

    // 16. AES/ECB Mode — java.lang.security.audit.crypto.ecb-cipher [MEDIUM]
    public byte[] aesEcb(String data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data.getBytes());
    }

    // 17. Insecure Random for token — java.lang.security.audit.crypto.insecure-random [MEDIUM]
    public String generateToken() {
        return Long.toHexString(new Random().nextLong());
    }

    // 18. Cookie Missing HttpOnly — java.lang.security.audit.cookie-missing-httponly [MEDIUM]
    @GetMapping("/cookie")
    public void insecureCookie(HttpServletResponse response, @RequestParam String sessionId) {
        Cookie cookie = new Cookie("JSESSIONID", sessionId);
        cookie.setPath("/");
        // missing setHttpOnly(true) and setSecure(true)
        response.addCookie(cookie);
    }

    // ─────────────────────────────────────────────────────────
    // LOW
    // ─────────────────────────────────────────────────────────

    // 19. Hardcoded static IV — java.lang.security.audit.crypto.iv-static [LOW]
    private static final byte[] STATIC_IV = {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};
    public byte[] hardcodedIv(String data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(STATIC_IV));
        return cipher.doFinal(data.getBytes());
    }

    // 20. Log Injection — java.lang.security.audit.log-injection [LOW]
    @GetMapping("/log")
    public String logInjection(@RequestParam String userInput) {
        log.info("User action: " + userInput);
        return "logged";
    }
}
