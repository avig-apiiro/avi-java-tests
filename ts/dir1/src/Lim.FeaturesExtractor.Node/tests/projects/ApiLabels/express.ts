import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/foo/base', function(req, res) {
    res.end();
});
app.get('/things', (req, res) => res.end());

const post = (...args: any[]) => {

};

app.route('/one/time/route')
    .post((req, res) => {
        console.log("");
    })
    .get((req, res) => {
        console.log("");
    })
    .delete((req, res) => {
        console.log("");
    });

post('/foo/base', function(req, res) {
    res.end();
});

app.listen(8093, function() {
});

const otherApp = {
    post(...args) {
        return null;
    },
    get(...args) {
        return null;
    },
    unrelatedMethod(...args) {
        return null;
    }
};

otherApp.post('/foo/base/:param1/{param2}/:param3?', (req, res) => {
});
otherApp.unrelatedMethod("with", "some args");
otherApp.get('/some/route', 'some string');

const client = {
    get: (...args) => null,
    post: (...args) => null
};

client.get("/some/path", (data => console.log(data)));

const UsersController = {
    listUsers: (req: express.Request, res: express.Response): void => {
        res.end();
    },
    createHandler(handler) {
        return handler;
    }
};


const namedHandlersApp: express.Express = express();
namedHandlersApp.get('/users/list', UsersController.listUsers);
namedHandlersApp.post('/unknown/handler', UsersController.createHandler("this is a string but the typechecker doesn't know"));
namedHandlersApp.delete('/not/an/api');

const routeApp = express();
let innerThing: Object;
routeApp.route('/app/with/route')
    .get((res, req) => {
        innerThing.get('/shouldnt/detect', ç);
        console.log('sababa');
    }).post((res, req) => {
        innerThing.post('/inner/post', innerThing);
});
