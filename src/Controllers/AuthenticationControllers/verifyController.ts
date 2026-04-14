import { Request, Response } from "express";
import { signup } from "../../Models/signupSchema";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});
export const verifyController = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = verifySchema.parse(req.body);
  const user = await signup.findOne({ email }).select("+verificationCode +verificationCodeExpires");
  if (!user) {
    res.status(404);
    throw new Error("User not found with this email.");
  }
  if (user.verified) {
    res.status(400);
    throw new Error("This account is already verified. Please login.");
  }
  if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
    res.status(400);
    throw new Error("Verification code has expired. Please request a new one.");
  }
  const isMatch = await bcrypt.compare(code, user.verificationCode as string);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid verification code.");
  }
  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.createdAT = undefined
  await user.save();
  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
});