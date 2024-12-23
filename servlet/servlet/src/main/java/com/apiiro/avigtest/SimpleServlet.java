package com.apiiro.avigtest;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

public class SimpleServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().println("Hello  World");
        response.setContentType("text/html");
        response.getWriter().close();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
