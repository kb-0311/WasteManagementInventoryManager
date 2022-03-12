const app = require ("./app");

const dotenv = require("dotenv");

const connectDatabase = require ("./config/database");

// config 
dotenv.config({path : "server/config/config.env"});

//connecting the database

connectDatabase();


const server = app.listen(process.env.PORT , () =>{

    console.log(`server started on port ${process.env.PORT}`);

})
// Uncaught Exception 
process.on("uncaughtException" , (err)=> {
    console.log(err.message);
    console.log("server shutting down" );
    server.close(()=>{
        process.exit(1);
    });
})

// Unhandled Promise errors
process.on("unhandledRejection" , (err)=> {
    console.log(err.message);
    console.log("server shutting down" );
    server.close(()=>{
        process.exit(1);
    });
})