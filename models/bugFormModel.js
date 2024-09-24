// Message schema definition using Mongoose
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    Account: {
        type: String,
        enum: ["Finding", "Products/Suppliers", "Messenger", "Order", "Checkout", "Return and Refund", "Others", "Logistics"] 
    },
    SelectAreason: {
        type: String,
        enum: ["Verification code expired", "Didn't receive verification code", "Number of SMS verification codes sent has exceeded the daily limit", "Unable to change email address", "Password retrieval failed", "Unable to login the current account", "Account registration failed", "Others"]
    },
    writeMore: { 
        type: String, 
      },
    email:{
        type: String,
        required: true
    },
    image: {
        url: {
            type: String
         },
        public_id:{
            type: String
        }
    }
}, {timestamps: true});

// Create a Message model based on the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;