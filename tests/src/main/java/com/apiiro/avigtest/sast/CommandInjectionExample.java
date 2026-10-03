package com.apiiro.avigtest.sast;

import java.io.IOException;

/**
 * SAST test: Command injection - user input passed to Runtime.exec.
 */
public class CommandInjectionExample {

    public void runCommand(String userInput) throws IOException {
        // SAST: Command injection - user input passed to exec without validation
        Runtime.getRuntime().exec("ping -c 3 " + userInput);
    }
}
