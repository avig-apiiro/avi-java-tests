package com.apiiro.avigtest.sast;

import org.springframework.web.bind.annotation.*;

/**
 * Semgrep: java.spring.security.audit.spring-unvalidated-redirect
 *          Mass assignment - binding all request params to model
 */
@RestController
@RequestMapping("/users")
public class SpringMassAssignmentExample {

    public static class UserModel {
        public String username;
        public String email;
        public String role;           // should not be user-settable
        public boolean isAdmin;       // should not be user-settable
        public String passwordHash;   // should never be user-settable
    }

    // semgrep: mass assignment - all fields bound from request, including role/isAdmin
    @PostMapping("/update")
    public UserModel updateUser(@RequestBody UserModel user) {
        // No field filtering - attacker can set role=ADMIN or isAdmin=true
        return user;
    }

    // semgrep: @RequestMapping with GET allows CSRF-sensitive state change
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.GET)
    public String deleteUser(@PathVariable String id) {
        return "deleted user " + id;
    }
}
