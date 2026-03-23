package com.apiiro.avigtest.sast;

import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import java.util.Hashtable;

/**
 * Semgrep: java.lang.security.audit.ldap-injection
 * User input concatenated into LDAP search filter without escaping.
 */
public class LdapInjectionExample {

    public void searchUser(String username) throws Exception {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.provider.url", "ldap://localhost:389");
        DirContext ctx = new InitialDirContext(env);

        // semgrep: ldap injection - username from user concatenated into filter
        String filter = "(uid=" + username + ")";
        SearchControls controls = new SearchControls();
        ctx.search("dc=example,dc=com", filter, controls);
    }
}
