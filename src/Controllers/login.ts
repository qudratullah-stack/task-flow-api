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

  const user = await signup.findOne({ email }).select("+password +verified");

  if (!user) {
    res.status(401); 
    throw new Error("Invalid email or password");
  }

  if (!user.verified) {
    res.status(403); 
    throw new Error("Please verify your email before logging in");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  sendToken(user, 200, res);
});