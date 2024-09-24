const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const receiveMail = require("../utils/email");
const Message = require('../models/bugFormModel');
const { validateMessage } = require("../middlewares/validator");
const asyncHandler = require('express-async-handler');



// Endpoint for receiving messages from Users
const message = asyncHandler(async (req, res) => {
    const { error } = validateMessage(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    try {
        const { Account, selectAreason, writeMore, email } = req.body;

        // Upload image to Cloudinary if available
        if (!req.file) {
            return res.status(400).json({
                message: "No file was uploaded"
            });
        }

        // Path to the uploaded file
        const imageFilePath = path.resolve(req.file.path);

        // Check if the file exists before proceeding
        if (!fs.existsSync(imageFilePath)) {
            return res.status(400).json({
                message: "Uploaded file not found"
            });
        }

        // Upload the image to Cloudinary
        const cloudinaryUpload = await cloudinary.uploader.upload(imageFilePath, {
            folder: "BugFormImages"
        });

        // Save the message to the database
        const newMessage = new Message({
            Account,
            selectAreason,
            writeMore,
            email,
            image: {
                public_id: cloudinaryUpload.public_id,
                url: cloudinaryUpload.secure_url,
            },
        });
        await newMessage.save();

        // Send email notification to admin
        const adminEmail = 'big5ive2024@gmail.com';
        const title = 'Bug Form Submission';

        await receiveMail({
            email: adminEmail,
            subject: title,
            text: `Email from ${email}: \n\n Account: ${Account} \n Reason: ${selectAreason} \n\n ${writeMore}`,
            attachments: [
                {
                    filename: path.basename(imageFilePath), // Filename of the attachment
                    path: imageFilePath, // Path to the image file
                }
            ]
        });

        return res.status(200).json({
            message: 'Message sent successfully'
        });
    } catch (error) {
        return res.status(500).json({
            Error: 'Error sending message'
        });
    } finally {
        fs.unlinkSync(path.resolve(req.file.path));
    }
});

// Exporting the message handler
module.exports = { message };
