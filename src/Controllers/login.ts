import { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendToken } from "./jwtController";
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});
export const LoginController = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await signup.findOne({ email }).select("+password +verified +loginAttempts +lockUntil");

    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
        res.status(403);
        throw new Error(`Account is locked. Try again after ${remainingTime} minutes`);
    }

    if (!user.verified) {
        res.status(403);
        throw new Error("Please verify your email before logging in");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!user.password && user.googleId){
        res.status(400)
        throw new Error('This account was created using Google. Please use "Login with Google".')
    } 

    if (!isMatch ) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); 
            await user.save({ validateBeforeSave: false });
            res.status(403);
            throw new Error("Too many failed attempts. Account locked for 15 minutes");
        }

        await user.save({ validateBeforeSave: false });
        res.status(401);
        throw new Error("Invalid email or password");
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
});