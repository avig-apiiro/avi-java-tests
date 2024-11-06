import {Body, Controller, Delete, Get, Param, Post, Put} from "ts/untitled/src/Lim.FeaturesExtractor.Node/tests/projects/ApiEntityViews/routing-controllers";


@Controller("/basepath")
export class UserControllerWithPath {

    @Get("/users")
    getAll() {
        return "This action returns all users";
    }


    @Post("/userscreate")
    post(@Body() user: any) {
        return "Saving user...";
    }

}


@Controller()
export class UserControllerWithoutPath {

    @Delete("/usersdelete")
    delete() {
        return "This action deletes all users";
    }


}
