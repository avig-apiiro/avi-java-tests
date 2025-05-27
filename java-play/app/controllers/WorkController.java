package controllers;

import play.mvc.*;
import services.UserManager;

public class WorkController extends Controller {
    public Result index(String partial) {

        UserManager userManager = new UserManager();
        UserManager.User data = userManager.getUser(partial);
        return ok(data.toString());
    }
}
