import { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import { Resend } from "resend";
import { z } from "zod"; 
import asyncHandler from "express-async-handler"; 
import crypto from 'crypto'
import bcrypt from 'bcrypt'
const signupSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const resend = new Resend(process.env.RESEND_API);

export const SignupController = asyncHandler(async (req: Request, res: Response) => {
 
  const validatedData = signupSchema.parse(req.body);
  const { name, email, password } = validatedData;

  const duplicateUser = await signup.findOne({ email }).select("_id");
  if (duplicateUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  
  const verificationCode = crypto.randomInt(100000,999999).toString()
  const hashVerificationCode = await bcrypt.hash(verificationCode, 10)
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000); 

  
  const newUser = await signup.create({
    name,
    email,
    password,
    verificationCode: hashVerificationCode,
    verified: false,
    verificationCodeExpires: expiryTime,
  });


const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>", 
  to: [email],
  subject: "Verify Your Account",
  html: `<strong>Your code: ${verificationCode}</strong>. Expires in 15 minutes.`,
});


if (error) {
  
  await signup.findByIdAndDelete(newUser._id);
  res.status(500);
  throw new Error(`Email failed: ${error.message}`);
}

  res.status(201).json({
    success: true,
    message: "Verification code sent to your email.",
  });
});