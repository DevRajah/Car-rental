const express = require('express');

const router = express.Router();

const { signUp,
    verify,
    resendOTP,
    loginWithEmail,
    loginWithPhoneNumber,
    forgotPassword,
    resetPassword,
    allStates,
    updatePersonalProfile,
    uploaAPhoto,
    signOut,
   } = require('../controllers/userController');
const { message } = require('../controllers/bugFormController');
const privacy = require('../controllers/privacyPolicy');
const { upload } = require('../middlewares/multer');
const { authenticate, Admin, } = require('../middlewares/authentication');

//endpoint to register a new user
router.post('/signup', signUp);

//endpoint to login with email
router.post("/loginE", loginWithEmail);

//endpoint to login with phone number
router.post("/loginP", loginWithPhoneNumber);

//endpoint to verify a registered user
router.post('/verify/:userId', verify);

//endpoint to resend new OTP to the user email address
router.get('/resend-otp/:userId', resendOTP);

//endpoint to reset user Password
router.post('/reset-user/:userId', resetPassword);

//endpoint for forgot password
router.post("/forgot", forgotPassword);

//endpoint to sign out a user
router.post("/signout/:userId", authenticate, signOut);

//endpoint to get all states in Nigeria
router.get("/allstates", allStates);

//endpoint to submit bug form
router.post('/bugform', upload.single('image'), message);

//endpoint to upload a profile photo
router.put('/profilephoto', upload.single('profilePhoto'), authenticate, uploaAPhoto);

//endpoint to the privacy policy page
router.get('/privacypolicy', privacy)



module.exports = router;