package com.apiiro.avigtest.sast;

import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;

/**
 * SAST test: SQL injection - concatenating user input into query.
 */
public class SqlInjectionExample {

    public ResultSet findUserByUsername(Connection conn, String username) throws Exception {
        // SAST: SQL injection - user input concatenated into query
        String query = "SELECT * FROM users WHERE username = '" + username + "'";
        Statement stmt = conn.createStatement();
        return stmt.executeQuery(query);
    }
}
