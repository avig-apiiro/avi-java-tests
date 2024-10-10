package com.apiiro.avigtest.example;

import com.opensymphony.xwork2.ActionSupport;

public class Boo  extends ActionSupport {

int i = 5;
    public String execute() throws Exception {
        return SUCCESS;
    }
    public String goo() throws Exception {
        return SUCCESS;
    }

}
