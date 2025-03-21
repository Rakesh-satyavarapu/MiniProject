let mongoose = require('mongoose')

let userSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:[true,'enter first name'],
        minlength:3
    },
    lastname:{
        type:String,
        required:[true,'enter last name']
    },
    username:{
        type:String,
        required:[true,'enter user name'],
        unique:true
    },
    email:{
        type:String,
        required:true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address',
        ],
        unique:true
    },
    password:{
        type:String,
        required:[true,"enter password"]
    },
    verifyOtp:{type:String,default:''},
    verifyOtpExpiresAt:{type:Number,default:0},
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'Mailpost'}]//reference is name of table or document
},{timestamps:true})

let user = mongoose.model('user',userSchema)
module.exports = user