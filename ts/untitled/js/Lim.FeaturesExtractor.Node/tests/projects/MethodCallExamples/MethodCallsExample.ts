import express from 'express';

export function authorizedFor() {
    return (req, res) => res.end();
}

function handlePath() {
    console.log("handlePath");
}

function middleware1(){
    console.log("middleware1");
}

function registerPaths() {
    const app = express()
    app.get('/path1', authorizedFor(), handlePath)
}

function unknownConstructor(){
    return new SomeClass("name");
}
