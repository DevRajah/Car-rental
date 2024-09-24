const { timeStamp } = require('console');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   
    email: {
        type: String, 
    },

    phoneNumber: {
        type: String, 
        default: "None"
    },
    
    password: {
        type: String, 
    }, 
    confirmPassword: {
        type: String, 
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
    },
    otpCode: {
        type: String,
        trim: true,
    },
    userInput: {
        type: String,
        trim: true,
    },
    
    facebook:{
        type: String
    },
    linkedin:{
        type: String
    },
    orders: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    profilePhoto: {
        url: {
            type: String
         },
        public_id:{
            type: String
        }
    }

}, {timeStamp: true});


const userModel = mongoose.model('User', userSchema);

module.exports = userModel;