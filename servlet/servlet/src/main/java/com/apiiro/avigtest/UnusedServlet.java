package com.apiiro.avigtest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.data.*;
import javax.ws.rs.*;


public class UnusedServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().println("UNUSED22");
        response.setContentType("text/html");
        response.getWriter().close();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().println("UNUSED22");
        response.setContentType("text/html");
        response.getWriter().close();
    }

    @Path("/path")
    public void pathMethod(){

    }
}
