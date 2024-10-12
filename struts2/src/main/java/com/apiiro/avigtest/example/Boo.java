package com.apiiro.avigtest.example;

import com.opensymphony.xwork2.ActionSupport;

public class Boo  extends ActionSupport {

int i = 7;
    public String execute() throws Exception {
        return SUCCESS;
    }
    public String goo() throws Exception {
        return SUCCESS;
    }

}
