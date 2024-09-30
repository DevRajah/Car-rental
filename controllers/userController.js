const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const {
  validateUser,
  validateUserLogin,
  validateResetPassword,
  validateUserPersonalProfile,
} = require("../middlewares/validator");
const sendEmail = require("../utils/email");
const { generateDynamicEmail } = require("../utils/emailText");
const { resetFunc } = require("../utils/forgot");
const resetHTML = require("../utils/resetSuccessful");
const verifiedHTML = require("../utils/verified");
const resetSuccessfulHTML = require("../utils/resetSuccessful");
require("dotenv").config();
const cloudinary = require("../middlewares/cloudinary");

//Function to register a new user
const signUp = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(500).json({
        message: error.details[0].message,
      });
    } else {
      const toTitleCase = (inputText) => {
        return inputText
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      };
      const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email.trim().toLowerCase(),
        password: req.body.password.trim(),
        confirmPassword: req.body.confirmPassword.trim(),
        phoneNumber: req.body.phoneNumber,
      };
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      } = req.body;

      const emailExists = await userModel.findOne({
        email: userData.email.toLowerCase(),
      });
      if (emailExists) {
        return res.status(200).json({
          message: "Email already exists!",
        });
      }

      const salt = bcrypt.genSaltSync(12);
      const hashpassword = bcrypt.hashSync(userData.password, salt);
      const user = new userModel({
        email: userData.email.toLowerCase(),
        password: hashpassword,
        firstName: toTitleCase(userData.firstName),
        lastName: toTitleCase(userData.lastName),
        phoneNumber: userData.phoneNumber,
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const token = jwt.sign(
        {
          company: user.company,
          email: user.email,
        },
        process.env.SECRET,
        { expiresIn: "300s" }
      );
      user.token = token;
      const subject = "VERIFY YOUR EMAIL";

      const generateOTP = () => {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const otp = generateOTP();

      user.otpCode = otp;
      const name = `${user.firstName} ${user.lastName}`;
      const html = generateDynamicEmail(name, otp);
      sendEmail({
        email: user.email,
        html,
        subject,
      });
      await user.save();

      const maskedEmail = (email) => {
        const newEmail = email.split("@");
        const firstThree = newEmail[0].slice(0, 3);
        const asterisk = newEmail[0].slice(3).length;
        const asteriskNew = "*".repeat(asterisk);
        const theTLD = "@" + newEmail[1];

        return `${firstThree}${asteriskNew}${theTLD}`;
      };

      return res.status(200).json({
        message:
          "User profile created successfully!, Please check your email to verify your account",
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
          id: user._id,
          token: user.token,
          maskedEmail: maskedEmail(user.email),
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to verify a new user with an OTP
const verify = async (req, res) => {
  try {
    const userId = req.params.userId;
    //const token = req.params.token;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = user.token;
    const { userInput } = req.body;

    //Check if the otp is still valid
    jwt.verify(token, process.env.SECRET);
    if (user && userInput === user.otpCode) {
      // Update the user if verification is successful
      await userModel.findByIdAndUpdate(
        userId,
        { isVerified: true },
        { new: true }
      );
      return res.send(verifiedHTML(req));
    } else {
      return res.status(400).json({
        message: "Incorrect OTP, Please check your email for the code",
      });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: "OTP has expired, please request a new OTP",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error: " + error.message,
      });
    }
  }
};

// Function to resend the OTP incase the user didn't get the OTP
const resendOTP = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const generateOTP = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const subject = "RE-VERIFY YOUR EMAIL";
    const otp = generateOTP();

    user.otpCode = otp;
    const html = generateDynamicEmail(user.firstName, otp);
    sendEmail({
      email: user.email,
      html,
      subject,
    });
    const token = jwt.sign(
      {
        firstName: user.firstName,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "300s" }
    );
    user.token = token;
    await user.save();

    return res.status(200).json({
      message: "Please check your email for the new OTP",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to login user with their Email
const login = async(req, res)=>{
  try {
      //get data from the request body
      const {email, password}= req.body
      //chech if user email is already exist
      const user = await userModel.findOne({email: email.toLowerCase()})
      if (!user) {
          return res.status(404).json({
              error: "This email does not exist"
          })
      }

      //check if user is verified to login
      if (user.isVerified === false) {
          return res.status(404).json({
              error: `Hello ${user.firstName}, you are not verified yet. Please verify to login`
          })
      }

      //check for user password
      const checkPassword = bcrypt.compareSync(password, user.password)
      if (!checkPassword) {
          return res.status(404).json({
              error: "Password incorrect"
          })
      } 
      
      //generate token 
      const token = jwt.sign({
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
      }, process.env.SECRET, {expiresIn: "2d"}) 

       // Save the token to the database
       user.token = token;
       await user.save();

       

      //Throw success message
      res.status(200).json({
          message: "Login Successful",
          data: user,
          token
      })

  } catch (error) {
      res.status(500).json({
          error: error.message
      })
  }
}

//Function to login user with their Phone Number
const loginWithPhoneNumber = async (req, res) => {
  try {
    //Get the data from the request body
    const data = {
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
    };
    //check if the user info provided exists in the database
    const user = await userModel.findOne({
      phoneNumber: data.phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid login details",
      });
    }
    const checkPassword = bcrypt.compareSync(data.password, user.password);
    if (!checkPassword) {
      return res.status(404).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
      },
      process.env.SECRET,
      { expiresIn: "1day" }
    );

    const maskedEmail = (email) => {
      const newEmail = email.split("@");
      const firstThree = newEmail[0].slice(0, 3);
      const asterisk = newEmail[0].slice(3).length;
      const asteriskNew = "*".repeat(asterisk);
      const theTLD = "@" + newEmail[1];

      return `${firstThree}${asteriskNew}${theTLD}`;
    };

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      id: user._id,
      maskedEmail: maskedEmail(user.email),
    };
    user.token = token;
    await user.save();
    if (user.isVerified === true) {
      return res.status(200).json({
        message: `Welcome to 5 Square, ${user.firstName}`,
        data: userData,
        token: token,
      });
    } else {
      return res.status(400).json({
        message:
          "Sorry, your account is not verified yet. Please check your mail ",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error " + error.message,
    });
  }
};

//Function to help users reset their password
const forgotPassword = async (req, res) => {
  try {
    const checkUser = await userModel.findOne({ email: req.body.email });
    if (!checkUser) {
      return res.status(404).json("Email doesn't exist");
    }

    const generateOTP = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const subject = " Kindly reset your password";
    const otp = generateOTP();

    checkUser.otpCode = otp;
    const name = `${checkUser.firstName} ${checkUser.lastName}`;
    const html = resetFunc(name, otp);

    sendEmail({
      email: checkUser.email,
      subject: subject,
      html: html,
    });
    const token = jwt.sign(
      {
        userId: checkUser.userId,
        email: checkUser.email,
      },
      process.env.SECRET,
      { expiresIn: "300s" }
    );
    checkUser.token = token;
    await checkUser.save();

    return res.status(200).json({
      message: "kindly check your email for an OTP to reset your password",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

// Function to reset the user password
const resetPassword = async (req, res) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Extract userId from request parameters and passwords from request body
    const userId = req.params.userId;
    const { password, confirmPassword } = req.body;

    // Check if password or confirmPassword are empty
    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Password cannot be empty",
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Find the user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If the user already has a password, check if the new password is the same as the old password
    if (user.password && bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({
        message: "Can't use previous password!",
      });
    }

    // Generate a salt and hash the new password
    const salt = bcrypt.genSaltSync(12);
    const hashPassword = bcrypt.hashSync(password, salt);

    // Update the user's password with the new hashed password
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { password: hashPassword },
      { new: true }
    );

    // Send a successful reset response
    return res.send(resetSuccessfulHTML(req));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

const updatePersonalProfile = async (req, res) => {
  try {
    // Validate the user profile data
    const { error } = validateUserPersonalProfile(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Extract user ID from request parameters
    const userId = req.params.userId;

    // Find the user profile by ID
    const profile = await userModel.findById(userId);
    if (!profile) {
      return res.status(404).json({
        message: "The user's information was not found",
      });
    }

    // Prepare updated profile data
    const profileData = {
      firstName: req.body.firstName || profile.firstName,
      lastName: req.body.allergies || profile.lastName,

    };

    // Update the user profile
    const newProfile = await userModel.updateOne({ _id: userId }, profileData, {
      new: true,
    });
    if (!newProfile) {
      return res.status(404).json({
        message: "Failed to update the user's information",
      });
    }

    // Respond with success message and updated profile data
    return res.status(200).json({
      message: "Your profile has been updated successfully",
      data: newProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error" + error.message,
    });
  }
};


// Function to upload a user photo
const uploadLogoToCloudinary = async (profilePhoto, user) => {
  try {
    if (user.profilePhoto && user.profilePhoto.public_id) {
      return await cloudinary.uploader.upload(profilePhoto, {
        public_id: user.profilePhoto.public_id,
        overwrite: true,
      });
    } else {
      return await cloudinary.uploader.upload(profilePhoto, {
        public_id: `user_photo_${user._id}_${Date.now()}`,
        folder: "Profile-Images",
      });
    }
  } catch (error) {
    throw new Error("Error uploading photo to Cloudinary: " + error.message);
  }
};

//Endpoint to upload a user profile photo
const uploaAPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Upload image to Cloudinary if available
    if (!req.file) {
      return res.status(400).json({
        message: "No file was uploaded",
      });
    }

    // Path to the uploaded file
    const imageFilePath = path.resolve(req.file.path);

    // Check if the file exists before proceeding
    if (!fs.existsSync(imageFilePath)) {
      return res.status(400).json({
        message: "Uploaded image not found",
      });
    }

    // Upload the image to Cloudinary
    let fileUploader;
    try {
      fileUploader = await uploadLogoToCloudinary(imageFilePath, user);
      await fs.promises.unlink(imageFilePath);
    } catch (uploadError) {
      return res
        .status(500)
        .json({
          message: "Error uploading profile photo " + uploadError.message,
        });
    }

    if (fileUploader) {
      const newProfilePhoto = {
        public_id: fileUploader.public_id,
        url: fileUploader.secure_url,
      };

      const uploadedPhoto = await userModel.findByIdAndUpdate(
        userId,
        { profilePhoto: newProfilePhoto },
        { new: true }
      );
      if (!uploadedPhoto) {
        return res.status(400).json({
          message: "Unable to upload user photo!",
        });
      }

      return res.status(200).json({
        message: "Photo successfully uploaded!",
        profilePhoto: uploadedPhoto.profilePhoto,
      });
    } else {
      return res.status(500).json({ message: "Failed to upload logo image" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  } finally {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(path.resolve(req.file.path));
    }
  }
};

//Function to signOut a user
const signOut = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newUser = await userModel.findById(userId);
    if (!newUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    newUser.token = null;
    await newUser.save();
    return res.status(201).json({
      message: `user has been signed out successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = {
  signUp,
  verify,
  resendOTP,
  login,
  loginWithPhoneNumber,
  forgotPassword,
  resetPassword,
  updatePersonalProfile,
  uploaAPhoto,
  signOut,
};
