const mongoose = require("mongoose");
const validators = require ("validator") ;
const bcrypt = require ("bcryptjs") ;
const jwt = require ("jsonwebtoken");
const crypto = require ("crypto");

const userSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : [true , "Please enter valid  name"] ,
        maxLength : [30 , "name cannot exceed more than 30 characters"] ,
        minLength : [4 , "name cannot be less than 4 characters"]

    } ,
    email : {
        type : String , 
        required : [true , "Please enter valid  email"] ,
        unique : true , 
        validate : [validators.isEmail , "please enter a valid email"]
    } ,
    password : {
        type : String ,
        required : [true , "Please enter valid password"] ,
        minLength : [8, "name cannot be less than 8 characters"],
        select : false
    } ,
    avatar : {
        public_id : {
            type : String , 
            required : true
        } , 
        url : {
            type : String , 
            required : true
        }
    } ,
    role : {
        type :String ,
        default : "user" ,


    } ,
    resetPasswordToken : String ,
    resetPasswordExpire : Date ,

})

userSchema.pre("save" , async function (next) {
    if(this.isModified("password")) {
        this.password=await bcrypt.hash(this.password , 10);
    } else {
        next();
    }
})

//JWT Token 

userSchema.methods.getJWTToken = function() {
    return jwt.sign( {id : this._id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRE ,
    })
}

//comparing the password

userSchema.methods.comparePassword = async function (enterPassword) {

    return await bcrypt.compare(enterPassword , this.password)

}

//Password reset token 
userSchema.methods.getResetPasswordToken = function () {
    //Generating token

    const resetToken = crypto.randomBytes(20).toString("hex");
    const tokenCrypto = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Hashing and adding to userScehma
    this.resetPasswordToken = tokenCrypto;

    this.resetPasswordExpire = Date.now + 15*60*1000 ;

    return resetToken;

}





module.exports = mongoose.model("User" , userSchema);