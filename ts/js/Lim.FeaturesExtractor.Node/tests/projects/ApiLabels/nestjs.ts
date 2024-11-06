import {Controller, Get, Post} from '@nestjs/common';

export class NotController {
    @Post()
    notControllerPost(body) {
        return 'This is not an api method';
    }
}

@Controller()
export class ControllerWithEmptyRoute {

    @Get()
    apiMethodWithoutRoute(body) {
        return 'This is an api method with an empty route';
    }

    @Post("green")
    apiMethodWithRoute(body) {
        return 'This is an api method with a route';
    }
}

@Controller("blue")
export class ControllerWithRoute {

    @Get()
    apiMethodWithoutRoute(body) {
        return 'This is an api method with an empty route';
    }

    @Post("yellow")
    apiMethodWithRoute(body) {
        return 'This is an api method with a route';
    }
}
