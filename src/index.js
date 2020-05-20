const app=require('./app');
const port= process.env.PORT;

// App Port 
app.listen(port,()=>{
    console.log('server is up on port '+port);
});


