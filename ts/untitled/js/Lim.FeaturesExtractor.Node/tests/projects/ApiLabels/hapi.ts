var plugin1 = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/getgetget',
        config: {
            handler: function (request, reply) {
                reply('Hi from plugin 1');
            },
            description: 'plugin1',
            tags: ['api']
        }
    });
    next();
};
plugin1.attributes = { name: 'plugin1' };



var plugin2 = function (server, options, next) {
    server.route({
        method: 'POST',
        path: '/postpostpost',
        config: {
            handler: function (request, reply) {
                reply('Hi from plugin 2');
            },
            description: 'plugin2',
            tags: ['api']
        }
    });
    next();
};