require("dotenv").config();
const express = require('express');
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const axios = require("axios");
const userModel = require('../models/userModel'); // Adjust the path to your user model

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Initialize passport
app.use(passport.initialize());
// Integrate passport with session auth
app.use(passport.session());

// Set up Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
async (request, accessToken, refreshToken, profile, done) => {
    try {
        let user = await userModel.findOne({ email: profile.email });
        if (!user) {
            user = await userModel.create({
                firstName: profile.given_name,
                lastName: profile.family_name,
                email: profile.email,
                // profilePicture: profile.picture,
                isVerified: profile.email_verified,
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

// Set up Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await userModel.findOne({ email });
        if (!user) {
            const names = profile.displayName.split(' ');
            user = await userModel.create({
                firstName: names[0],
                lastName: names[1] || '',
                email,
                // profilePicture: profile.photos[0].value,
                isVerified: true,
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));


// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});


// Set up LinkedIn strategy

const LINKEDIN_KEY = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new LinkedInStrategy(
        {
            clientID: LINKEDIN_KEY,
            clientSecret: LINKEDIN_SECRET,
            callbackURL: CALLBACK_URL,
            scope: ["email", "profile", "openid"],
        },
        async (accessToken, refreshToken, profile, done) => {
            process.nextTick(async () => {
                try {
                    const email = profile.emails[0].value;
                    let user = await userModel.findOne({ email });
                    if (!user) {
                        const names = profile.displayName.split(' ');
                        user = await userModel.create({
                            firstName: names[0],
                            lastName: names[1] || '',
                            email,
                            isVerified: true,
                        });
                    }
                    return done(null, profile);
                } catch (error) {
                    console.error('Error during LinkedIn authentication:', error);
                    return done(error, false);
                }
            });
        }
    )
);



// Set up Twitter strategy

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    includeEmail: true
},
async (token, tokenSecret, profile, done) => {
    try {
        // Twitter does not always provide an email, so handle this case
        const email = profile.emails[0].value;

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                firstName: profile.displayName.split(' ')[0] || '',
                lastName: profile.displayName.split(' ')[1] || '',
                email: email || '',
                // profilePicture: profile.photos[0].value,
                isVerified: profile.emails[0].value ? true : false,
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));




module.exports = passport;
