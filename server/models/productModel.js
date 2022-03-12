const mongoose= require("mongoose");

const productSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : [true , "Please enter valid product name"]
    } ,
    description : {
        type : String , 
        required : [true , "Please enter valid product description"]
    } ,
    price : {
        type : Number , 
        required : [true , "Please enter valid product price"] ,
        maxLength : [8, "Price cannot be more than"]
    } ,
    ratings : {
        type: Number , 
        default : 0 ,
    } ,
    images : [{
        public_id : {
            type : String , 
            required : true
        } , 
        url : {
            type : String , 
            required : true
        }
    }] ,
    category : {
        type : String ,
        required : [true , "Please Enter Product Category"]
    } ,
    Stock : {
        type : Number , 
        required : [true , "Please enter the stock"] ,
        maxLength : [4 , "stocks cannot exceed 9999" ],
        minLength : [1 , "stocks can only be positive numbers"] ,
        default : 1 ,

    } ,
    numOfReviews : {
        type : Number ,
        default : 0 
    } ,
    reviews : [{
        user : {
            type:mongoose.Schema.ObjectId ,
            ref : "User",
            required : true ,
        } ,
        name : {
            type : String ,
            required : true 
        } ,
        rating : {
            type : Number ,
            required : true 
            
        } ,
        comment : {
            type : String , 
            required : true 
        }

    }] ,
    user : {
        type:mongoose.Schema.ObjectId ,
        ref : "User",
        required : true ,
    } ,
    createdAt : { 
        type : Date ,
        default : Date.now

    }
    




})

module.exports = mongoose.model("Product" , productSchema);