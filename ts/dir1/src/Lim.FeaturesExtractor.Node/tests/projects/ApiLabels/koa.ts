import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Koa from 'tests/projects/TsProject/koa';

const app = new Koa();
app.use(bodyParser());

const router: Router = new Router();

router.url('test', []);

router.post('/foo/base', (ctx, next) => {
    console.log('');
});
router.get('/things', (ctx, next) => {
    console.log('');
});

const post = (...args: any[]) => {
};

router
    .get('/', (ctx, next) => {
        console.log('');
    })
    .post('/', (ctx, next) => {
        console.log('');
    })
    .delete('/', (ctx, next) => {
        console.log('');
    });

post('/foo/base', function(req, res) {
    res.end();
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

const client = {
    get: (...args) => null,
    post: (...args) => null
};

client.get("/some/path", (data => console.log(data)));

const UsersController = {
    listUsers: (ctx: Koa.Context): void => {
        ctx.res.end();
    },
    createHandler(handler) {
        return handler;
    }
};

function someMiddleware(ctx, next) {}

router.get('/metrics', someMiddleware);

const namedHandlersApp: Router = new Router();
namedHandlersApp.get('/users/list', UsersController.listUsers);
namedHandlersApp.post('/unknown/handler', UsersController.createHandler("this is a string but the typechecker doesn't know"));

app.use(router.routes());

app.listen(3000);
