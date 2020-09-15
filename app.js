const path = require('path');
const express = require('express');
// const app = express();
var app = express();

const bodyParser = require('body-parser');
const port = 8000;
const http = require('http');
// const socketio = require('socket.io');
var userRouter = require('./routes/user.routes.js');

console.log("hello");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use('/user', userRouter);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
