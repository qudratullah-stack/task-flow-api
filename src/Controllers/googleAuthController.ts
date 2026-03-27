import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { sendToken } from './jwtController';
import { signup } from '../Models/signupSchema';
import asyncHandler from 'express-async-handler'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "http://localhost:8000/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

export const googleLogin = passport.authenticate('google', { 
    scope: ['profile', 'email'] 
});

export const googleCallback = passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
});

export const loginSuccess = asyncHandler(async (req: Request, res: Response) => {
    const googleuser = req.user as any;
    const email = googleuser.emails[0].value;

    let user = await signup.findOne({ email });

    if (!user) {
        user = await signup.create({
            name: googleuser.displayName,
            email: email,
            googleId: googleuser.id,
            verified: true,
            role: "user"
        });
    }
    sendToken(user, 200, res, true);
});