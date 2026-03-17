import type { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import { sendToken } from "./jwtController";
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {

    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token as string)
        .digest("hex");

    const user = await signup.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() } 
    });

    if (!user) {
        res.status(400);
        throw new Error("Token is invalid or has expired");
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined; 
    user.passwordResetExpires = undefined;

    await user.save();
    sendToken(user, 200, res);
});