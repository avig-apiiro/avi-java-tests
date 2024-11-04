import express from 'express';
import {authorizedFor} from "./MethodDeclaration";

function middleware1(){
    console.log("middleware_1");
}
function middleware2(){
    console.log("middleware_2");
}

const app = express()
app.get('/path1', authorizedFor(), handlePath);
app.post('/path2', [middleware1, middleware2, () => {}], handlePath);
