package com.apiiro.avigtest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public abstract class BaseServlet extends HttpServlet {
        @Override
        @Deprecated
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            response.getWriter().println(this.work(request));
            response.setContentType("text/html");
            response.getWriter().close();
        }

        @Override
        protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            response.getWriter().println(this.work(request));
            response.setContentType("text/html");
            response.getWriter().close();
        }

        abstract protected String work(HttpServletRequest request);

}


