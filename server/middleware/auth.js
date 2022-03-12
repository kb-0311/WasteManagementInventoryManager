const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErros = require("./catchAsyncErros");
const jwt = require ("jsonwebtoken");
const User = require("../models/userModels");


exports.isAuthenticatedUser= catchAsyncErros(async (req, res , next)=> {
    const { token } = await req.cookies;

    if (!token) {
        return await next(new ErrorHandler("please login to access this resource" , 401));
    }

    const decodedData = jwt.verify(token , process.env.JWT_SECRET)

    req.user = await User.findById(decodedData.id) ;

    next()
    
})

// Admin roles 

exports.autherizeRoles = (...roles) => {

    return (req,res,next)=>{
        if (!roles.includes( req.user.role)) {
           return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource` , 403));
        }
        next();
    }

}