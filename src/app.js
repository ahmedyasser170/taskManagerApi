const express=require('express');
require('./db/mongoose');

const bodyParser = require('body-parser');

// import routers
const userRouter=require('./routers/user');
const taskRouter=require('./routers/task');

const app=express();

app.use(express.json());
app.use(userRouter);      //User Routes
app.use(taskRouter);      //Task Routes

module.exports = app;


