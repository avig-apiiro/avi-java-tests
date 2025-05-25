package controllers;

import play.mvc.*;

public class WorkController extends Controller {
    public Result index(String partial) {
        return ok(views.html.index.render());
    }
}
