import express from 'express';

const app = express();

app.post('/foo/base', function(req, res) {
    res.end();
});

const otherApp = {
    post(...args) {
        return null;
    },
    unrelatedMethod(...args) {
        return null;
    }
};

otherApp.post('/foo/base/:param1/{param2}/:param3?', (req, res) => {
});
otherApp.unrelatedMethod("with", "some args");
