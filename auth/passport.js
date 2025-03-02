import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FabookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import userModel from "../models/userModel.js";
import { asyncHandler } from "../utils/error.js";




passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/v1/users/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await userModel.findOne({ googleId: profile.id });

                if (!user) {
                    // Check if the email already exists before creating a new user
                    const existingUser = await userModel.findOne({ email: profile.emails[0].value });

                    if (existingUser) {
                        // Link Google ID to existing user
                        existingUser.googleId = profile.id;
                        await existingUser.save();
                        return done(null, existingUser);
                    }

                    // Create a new user only if email doesn't exist
                    user = await userModel.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        thumbnail: profile.photos[0].value
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: "http://localhost:5000/api/v1/users/auth/twitter/callback",
            includeEmail: true, // Ensure email is included
        },
        async (token, tokenSecret, profile, done) => {
            try {
                let user = await userModel.findOne({ twitterId: profile.id });

                if (!user) {
                    // Check if the email already exists before creating a new user
                    const email = profile.emails ? profile.emails[0].value : null;

                    if (email) {
                        const existingUser = await userModel.findOne({ email });

                        if (existingUser) {
                            // Link Twitter ID to existing user
                            existingUser.twitterId = profile.id;
                            await existingUser.save();
                            return done(null, existingUser);
                        }
                    }

                    // Create a new user only if email doesn't exist
                    user = await userModel.create({
                        twitterId: profile.id,
                        displayName: profile.displayName,
                        email: email, // Might be null if Twitter doesn't provide email
                        thumbnail: profile.photos ? profile.photos[0].value : null,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


export default passport;

