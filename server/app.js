const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
//Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const errorMiddleware = require("./middleware/error");



// Using the routes
app.use("/api/v1"   ,   product);
app.use("/api/v1" , user);
//Middleware for error ,

app.use(errorMiddleware);


module.exports= app;
