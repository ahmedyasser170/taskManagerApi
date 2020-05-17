const express=require('express');
require('./src/db/mongoose');

const bodyParser = require('body-parser');

// import routers
const userRouter=require('./src/routers/user');
const taskRouter=require('./src/routers/task');

const app=express();
const port= process.env.PORT;


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());


//User Routes
app.use(userRouter);

//Task Routes
app.use(taskRouter);

// App Port
app.listen(port,()=>{
    console.log('server is up on port '+port);
});


