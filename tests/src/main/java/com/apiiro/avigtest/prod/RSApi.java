package com.apiiro.avigtest.prod;

import org.apache.coyote.Response;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/feedback")

public class RSApi {
    @POST
    @Path("/submit")
    public Response sendFeedback(String bodyJSON, @Context HttpServletRequest request) throws JSONException{
        //Retrieve properties file
        //ServletUtil.initializeAppProperties(request.getServletContext());

        return new Response();
    }
}
