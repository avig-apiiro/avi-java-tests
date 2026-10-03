package com.apiiro.avigtest.api;

import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URL;
import java.sql.DriverManager;
import java.util.List;
import java.util.Map;

/**
 * 10 additional API security risks covering broken auth, injection via API,
 * insecure direct object reference, and security misconfiguration.
 */
@RestController
@RequestMapping("/v2")
public class MoreApiRisks {

    // API Risk 1: JWT accepted without signature verification — "none" algorithm attack
    @PostMapping("/auth/verify-token")
    public Map<String, Object> verifyToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String[] parts = token.split("\\.");
        // Decodes payload without verifying the signature — accepts any token including "alg:none"
        String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
        return Map.of("verified", true, "payload", payload);
    }

    // API Risk 2: Unauthenticated password reset — no token validation
    @PostMapping("/auth/reset-password")
    public String resetPassword(@RequestParam String username,
                                @RequestParam String newPassword) {
        // No authentication, no token, no rate limiting — anyone can reset anyone's password
        return "Password for " + username + " reset to: " + newPassword;
    }

    // API Risk 3: GraphQL introspection enabled in production — exposes full schema
    @GetMapping("/graphql/schema")
    public String graphqlSchema() {
        return "{ __schema { types { name fields { name type { name } } } } }";
    }

    // API Risk 4: API key passed in URL query parameter — logged in access logs
    @GetMapping("/data/export")
    public List<String> exportData(@RequestParam String api_key,
                                   @RequestParam String table) {
        // api_key in URL is logged by proxies, CDNs, and browsers
        if ("hardcoded-internal-api-key-123".equals(api_key)) {
            return List.of("row1", "row2", "row3");
        }
        return List.of();
    }

    // API Risk 5: Missing Content-Type validation — accepts arbitrary content types
    @PostMapping(value = "/upload/process", consumes = "*/*")
    public String processUpload(HttpServletRequest request) throws Exception {
        // Accepts any content-type including application/x-java-serialized-object
        byte[] body = request.getInputStream().readAllBytes();
        return "Processed " + body.length + " bytes of type: " + request.getContentType();
    }

    // API Risk 6: CORS misconfiguration — wildcard origin with credentials
    @GetMapping("/user/sensitive-data")
    public Map<String, String> getSensitiveData(HttpServletResponse response) {
        // Wildcard CORS with credentials — allows any origin to read sensitive data
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        return Map.of("ssn", "123-45-6789", "token", "secret-token-abc123");
    }

    // API Risk 7: SQL injection through API path parameter
    @GetMapping("/reports/{reportName}")
    public Object getReport(@PathVariable String reportName) throws Exception {
        var conn = DriverManager.getConnection("jdbc:h2:mem:testdb");
        // Path param injected directly into SQL
        var rs = conn.createStatement().executeQuery(
            "SELECT * FROM reports WHERE name = '" + reportName + "'"
        );
        return "Executed for: " + reportName;
    }

    // API Risk 8: SSRF via webhook URL registration — no allowlist
    @PostMapping("/webhooks/register")
    public String registerWebhook(@RequestParam String callbackUrl,
                                  @RequestParam String event) throws Exception {
        // User-controlled URL — can target internal services (e.g. http://169.254.169.254/latest/meta-data/)
        URL url = new URL(callbackUrl);
        url.openConnection().connect();
        return "Webhook registered for " + event + " -> " + callbackUrl;
    }

    // API Risk 9: Business logic bypass — negative price accepted without validation
    @PostMapping("/orders/create")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> order) {
        // No server-side validation of price or quantity — negative values accepted
        double price    = Double.parseDouble(order.get("price").toString());
        int    quantity = Integer.parseInt(order.get("quantity").toString());
        double total    = price * quantity;
        return Map.of("orderId", "ORD-001", "total", total, "status", "confirmed");
    }

    // API Risk 10: Broken function-level authorization — regular user can access admin actions
    @PostMapping("/users/{id}/grant-admin")
    public String grantAdmin(@PathVariable String id,
                             @RequestHeader(value = "X-User-Role", defaultValue = "user") String role) {
        // Role check based on user-supplied header — trivially bypassed
        if ("admin".equalsIgnoreCase(role) || "true".equalsIgnoreCase(role)) {
            return "User " + id + " granted admin role";
        }
        return "Access denied";
    }
}
