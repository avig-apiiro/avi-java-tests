package com.apiiro.avigtest.prod.api;

import javax.annotation.security.PermitAll;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.wink.json4j.*;

import com.ibm.security.appscan.altoromutual.util.OperationsUtil;
import com.ibm.security.appscan.altoromutual.util.ServletUtil;
import com.ibm.security.appscan.altoromutual.model.Feedback;
@Path("/feedback")
public class SimpleApi extends AltoroAPI{

    @POST
    @PermitAll
    @Path("/submit")
    public Response sendFeedback(String bodyJSON, @Context HttpServletRequest request) throws JSONException {
        //Retrieve properties file
        //ServletUtil.initializeAppProperties(request.getServletContext());
        return new Response();
    }
}
