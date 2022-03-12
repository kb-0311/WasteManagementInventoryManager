const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require ("../middleware/catchAsyncErros.js") ;
const User = require("../models/userModels");
const Product = require("../models/productModel");
const sendToken = require("../utils/jwtToken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require ("crypto");
//Register a user

exports.registerUser = catchAsyncErrors( async (req , res ,next)=> {
    const {name , email , password} = req.body;

    const user = await User.create({
        name , 
        email ,
        password ,
         avatar : {
             public_id : "sample id 1" ,
             url : "sample url 1"
         }
    })

    sendToken(user , 200 , res);

})

// Login User

exports.loginUser = catchAsyncErrors( async (req , res , next) =>{


    const {email , password} = req.body;

    // Checking if user has given email and body both 

    if (!email || !password) {
        return next(new ErrorHandler("please enter email and password both" , 400))
    }
    const user = await User.findOne({email}).select("+password")

    if (!user) {
        return next(new ErrorHandler("invalid email or password 1 " , 401));
    }
    

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("invalid email or password 2" , 401));
    }

    sendToken(user , 201 , res);
    
})

// Log Out User

exports.logout = catchAsyncErrors ( async (req , res , next)=>{

    res.cookie("token" , null ,{
        expires : new Date (Date.now),
        httpOnly : true
    })

    res.status(200).json({
        success : true ,
        message : "Logged out"
    })
})

// Forgot password 

exports.forgotPassword = catchAsyncErrors(async (req , res , next)=>{
    
    const user = await User.findOne({email : req.body.email});
    if(!user) {
        return next(new ErrorHandler("user not found" , 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave : false});

    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}` ;

    const message = `your password reset token : - \n\n ${resetPasswordURL} \n\n if you had not requested this email then please ignore this`;

    try {

        await sendEmail({
            email : user.email ,
            subject : `resetting password` ,
            message : message
        });

        res.status(200).json({
            success : true ,
            message : `email sent to ${user.email}`,
        })

    } catch (error) {
        user.resetPasswordToken = undefined ;
        user.resetPasswordExpire = undefined ;
        await user.save({validateBeforeSave : false});
        return next(new ErrorHandler(error.message , 500))
    }

})

// Reset Password

exports.resetPassword = catchAsyncErrors(async (req , res , next)=>{

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");


    const user = await User.findOne({
        resetPasswordToken : resetPasswordToken ,
         resetPasswordExpire : {$gt : Date.now()}
    }) 

    if (!user) {
        return next(new ErrorHandler("reset password token is invalid " , 401));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("password and current password do not match" , 400));

    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined  ;
    user.resetPasswordExpire = undefined ;

    await user.save();

    sendToken(user , 200 , res) ;

})

// Get User Details

exports.getUserDetails = catchAsyncErrors( async (req , res , next) =>{

    const user = await User.findById(req.user.id);

    
        res.status(200).json({
            success : true ,
            
            user
        })
})

// update user password

exports.updatePassword = catchAsyncErrors( async (req , res , next) =>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Old password is incorrect" , 401));
    }    

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match" , 401));

    }

    user.password = req.body.newPassword;

    await user.save();
    sendToken(user , 200 , res)
})

// update user profile

exports.updateProfile = catchAsyncErrors( async (req , res , next) =>{

    const newUserData = {
        name :req.body.name ,
        email : req.body.email ,
        
    }

    //Cloudinary avatar baadme
    const user = await User.findByIdAndUpdate(req.user.id , newUserData , {
        new : true ,
        runValidators : true ,
        useFindandModify : false 
    });


    res.status(200).json({
        success : true ,
        message : "profile updated succesfully" ,
        user
    })
})

// Get all users (admin)

exports.getAllUsers = catchAsyncErrors( async (req , res , next) =>{

    const allUsers = await User.find();
    const userCount = await User.countDocuments();

    res.status(200).json({
        success : true ,
        userCount ,
        allUsers
    })
})

// Get a single user (admin)

exports.getSingleUser = catchAsyncErrors( async (req , res , next) =>{

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User does not exist " , 404));
    }



    res.status(200).json({
        success : true ,
        user
    })
})

// update a single user role as an admin

exports.updateUser = catchAsyncErrors( async (req , res , next) =>{

    const newUserData = {
        name :req.body.name ,
        email : req.body.email ,
        role : req.body.role
        
    }

    
    const user = await User.findByIdAndUpdate(req.params.id , newUserData , {
        new : true ,
        runValidators : true ,
        useFindandModify : false 
    });


    res.status(200).json({
        success : true ,
        message : "profile updated succesfully" ,
        user
    })
})

// delete a single user as an admin

exports.deleteUser = catchAsyncErrors( async (req , res , next) =>{

    

    
    const user = await User.findByIdAndUpdate(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User does not exist " , 404));
    }

    await user.remove();

    res.status(200).json({
        success : true ,
        message : "user deleted succesfully" ,
        
    })
})


