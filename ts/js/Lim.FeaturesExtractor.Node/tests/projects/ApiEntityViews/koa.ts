import Router from 'koa-router';
import Koa from 'tests/projects/TsProject/koa';

const app = new Koa();
const router: Router = new Router();
app.use(router.routes());

router.post('/foo/base', (ctx, next) => {
    console.log('');
});
router.get('/things', (ctx, next) => {
    console.log('');
});

const otherApp = {
    post(...args) {
        return null;
    },
    unrelatedMethod(...args) {
        return null;
    }
};

otherApp.unrelatedMethod("with", "some args");
