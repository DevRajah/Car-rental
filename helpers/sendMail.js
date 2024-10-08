const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth:{
        user:process.env.USER,
        pass:process.env.PASS
    },

})

    
  
 // function to send email
 const sendEmail = async(mailOptions)=>{
    try{
        await transporter.sendMail(mailOptions)
    }catch(error){
        throw new Error('Failed to send email: ' + error.message);
    }
    // console.log('Email sent: ' + info.response);
}
module.exports=sendEmail