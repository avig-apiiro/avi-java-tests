package controllers;

import play.mvc.*;
import services.UserManager;

public class WorkController extends Controller {
    public Result index(String partial, String param2) {

        UserManager userManager = new UserManager();
        UserManager.User data = userManager.getUser(partial +  param2);
        return ok(data.toString());
    }
}
