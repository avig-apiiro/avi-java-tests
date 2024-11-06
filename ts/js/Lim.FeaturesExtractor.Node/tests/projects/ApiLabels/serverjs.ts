const server = require('server');
const { get, post , del } = server.router;

let foo = (a, b): any => {};


server([
    foo('/', ctx => '0'),
    get('/get1', ctx => '1'),
    get('/get2', ctx => '2'),
    del('/', ctx => '3'),
    post('/post/1', ctx => '4'),
    post('/post/2', ctx => '5'),
    get('')
]);