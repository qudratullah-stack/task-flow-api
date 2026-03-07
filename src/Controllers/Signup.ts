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
  // 2. ویلیڈیشن (اگر ڈیٹا غلط ہے تو یہیں سے ایرر جائے گا)
  const validatedData = signupSchema.parse(req.body);
  const { name, email, password } = validatedData;

  // 3. ای میل کی موجودگی چیک کرنا (Optimization: select only id)
  const existingUser = await signup.findOne({ email }).select("_id");
  if (existingUser) {
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

  // 6. ای میل سروس (In Senior projects, this goes to a Background Queue)
  try {
    await resend.emails.send({
      from: "SaaS Platform <onboarding@yourdomain.com>",
      to: [email],
      subject: "Verify Your Account",
      html: `<strong>Your code: ${verificationCode}</strong>. Expires in 15 minutes.`,
    });
  } catch (emailError) {
    // اگر ای میل نہ جائے تو یوزر ڈیلیٹ کر دیں تاکہ ڈیٹا گندا نہ ہو (Atomic-like behavior)
    await signup.findByIdAndDelete(newUser._id);
    res.status(500);
    throw new Error("Failed to send verification email. Please try again.");
  }

  res.status(201).json({
    success: true,
    message: "Verification code sent to your email.",
  });
});