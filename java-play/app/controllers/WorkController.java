package controllers;

import play.mvc.*;
import services.UserManager;

public class WorkController extends Controller {
    public Result index(String partial) {

        UserManager userManager = new UserManager();
        userManager.getUser(partial);
        return ok(views.html.index.render());
    }
}
