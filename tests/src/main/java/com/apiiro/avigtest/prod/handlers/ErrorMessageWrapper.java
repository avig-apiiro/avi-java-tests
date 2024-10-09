package com.apiiro.avigtest.prod.handlers;

public class ErrorMessageWrapper {
    String err;

    public ErrorMessageWrapper(String err) {
        this.err = err;
    }

    public String getErr() {
        return err;
    }

    public void setErr(String err) {
        this.err = err;
    }
}
