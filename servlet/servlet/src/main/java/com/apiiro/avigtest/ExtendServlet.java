package com.apiiro.avigtest;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

public class ExtendServlet extends BaseServlet {

    @Override
    protected String work(HttpServletRequest request) {
        return "Extended servlet";
    }
}
