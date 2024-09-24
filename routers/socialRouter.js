const express = require('express');
const router = express.Router();
const passport = require("../helpers/socialLogin");
const axios = require("axios");
const userModel = require('../models/userModel'); // Adjust the path to your user model


// Endpoint to initiate Google login
router.get('/googlelogIn', (req, res) => {
    return res.redirect("https://fivesquare-api.onrender.com/auth/google");
});

router.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure"
}));

router.get("/auth/google/success", (req, res) => {
    if (req.user) {
        const username = req.user.email;
        req.session.user = { username };
        return res.redirect('https://fivesquares.onrender.com'); // Redirect to the homepage
    } else {
        return res.redirect("/auth/google/failure");
    }
});

router.get("/auth/google/failure", (req, res) => {
    return res.status(401).json("Authentication failed");
});





// Endpoint to initiate Facebook login
router.get('/facebooklogIn', (req, res) => {
    return res.redirect("http://localhost:4455/auth/facebook");
});

// Facebook login route
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// Facebook callback route
router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
    successRedirect: "/auth/facebook/success",
    failureRedirect: "/auth/facebook/failure" 
}));

router.get("/auth/facebook/success", (req, res) => { 
    if (req.user) {
        const username = req.user.email;
        req.session.user = { username };
        return res.redirect('/'); // Redirect to the homepage
    } else {
        return res.redirect("/auth/facebook/failure");
    }
});

router.get("/auth/facebook/failure", (req, res) => {
    return res.status(401).json("Authentication failed");
});





// Endpoint to initiate LinkedIn login
router.get('/linkedinlogIn', (req, res) => {
    return res.redirect('/auth/linkedin');
});

// LinkedIn login route
const LINKEDIN_KEY = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL;

router.get("/auth/linkedin",
    passport.authenticate("linkedin", { state: "SOMESTATE" })
);

router.get("/auth/linkedin/callback", async (req, res) => {
    try {
        const code = req.query.code;
        let access_token;

        // Access Token Retrieval
        const access_token_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${CALLBACK_URL}&client_id=${LINKEDIN_KEY}&client_secret=${LINKEDIN_SECRET}`;
        const res_token = await axios
            .post(access_token_url)
            .then((res) => {
                access_token = res.data.access_token;
            })
            .catch((err) => {
                console.log(err);
            });

        // Fetching User Data
        const user_info_url = `https://api.linkedin.com/v2/userinfo`;
        let user_info;
        if (access_token) {
            const res_user_info = await axios
                .get(user_info_url, {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                })
                .then((response) => {
                    user_info = response.data;
                })
                .catch((err) => {
                    console.log("ERROR: ", err);
                });
        } else {
            console.log("Access token not found");
        }

        // Step 4: Storing User Data (Database Operation)
        if (user_info) {
            req.session.user = user_info;
            user_info = user_info;

            const LinkedinID = user_info.sub;
            const name = user_info.name;
            const email = user_info.email;
            const picture = user_info.picture
                ? user_info.picture
                : "https://t3.ftcdn.net/jpg/03/64/62/36/360_F_364623623_ERzQYfO4HHHyawYkJ16tREsizLyvcaeg.jpg";

            // code to store user information to database

        } else {
            user_info = req.session.user;
        }


        // Redirecting User After Successful Authentication
        return res.redirect('/auth/linkedin/success');

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error" +error.message,
        });
    }
});

router.get("/auth/linkedin/success", async (req, res) => {
    if (req.session.user) {
        const email = req.session.user.email;
                    let user = await userModel.findOne({ email });
                    if (!user) {
                        const details = req.session.user;
                        user = await userModel.create({
                            firstName: details.given_name,
                            lastName: details.family_name || '',
                            email,
                            isVerified: details.email_verified,
                        });
                    }
        const username = req.session.user.email;
        req.session.user = { username };
        return res.redirect('https://fivesquares.onrender.com'); // Redirect to the homepage
    } else {
        return res.redirect("/auth/linkedin/failure");
    }
});

router.get("/auth/linkedin/failure", (req, res) => {
    return res.status(401).json("Authentication failed");
});



// Endpoint to initiate Twitter login
router.get('/twitterlogIn', (req, res) => {
    return res.redirect("/auth/twitter");
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/auth/twitter/success',
    failureRedirect: '/auth/twitter/failure'
}));

router.get('/auth/twitter/success', (req, res) => {
    if (req.user) {
        const username = req.user.twitterId;
        req.session.user = { username };
        return res.redirect('https://fivesquares.onrender.com'); // Redirect to the homepage
    } else {
        return res.redirect('/auth/twitter/failure');
    }
});

router.get('/auth/twitter/failure', (req, res) => {
    return res.status(401).json('Authentication failed');
});



module.exports = router;