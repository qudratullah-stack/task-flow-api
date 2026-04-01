import type { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import asyncHandler from 'express-async-handler'
import { Resend } from "resend"; 
const resend = new Resend(process.env.RESEND_API)
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
   
    const { email } = req.body;
    const user = await signup.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("No user found with this email address.");
    }

    const resetToken = (user as any).createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
    const emailHtml = `
        <h1>Forgot your password?</h1>
        <p>Please click the link below to reset your password. This link is valid for 10 minutes only.</p>
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't forget your password, please ignore this email!</p>
    `;

    try {
           await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email, 
            subject: 'Your Password Reset Link (Valid for 10 min)',
            html: emailHtml,})
      

        res.status(200).json({
            status: "success",
            message: "Token sent to email! (Check console if using testing mode)"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error("There was an error sending the email. Try again later.");
    }
});