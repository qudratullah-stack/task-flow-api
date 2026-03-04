import type { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import bcrypt from 'bcrypt'
import { Resend } from "resend";
export const SignupController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const DuplicateEmail = await signup.findOne({ email })
    if (DuplicateEmail) {
      return res.status(400).json({ message: 'Email already Exists' })  }
    const code = Math.floor(100000 + Math.random() * 900000);
  const hashPassword = await bcrypt.hash(password, 10);
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const newuser = await signup.create({
      name,
      email,
      password: hashPassword,
      verificationCode: code,
      verified: false,
      verificationCodeExpires: expiryTime
    })
    const resend = new Resend(process.env.RESEND_API);
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Hello  this message is coming to SassWebsite",
      html: `<p>Your verification code is ${code}</p>`,
    });
    if (error) {
      return res.status(400).json({ message: 'Email Not sent ' })}
    res.status(200).json({ message: 'Your account is Create successfully Verification Code send to your email' })
    } catch (err) {
    res.status(500).json({ message: 'Your account is Not make' })}
}
export const verifyController = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body
    const user = await signup.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User Not Found' })
    }

    if (user.verificationCode !== Number(verificationCode)) {
      return res.status(400).json({ message: 'Invalid Code' })
    }
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Code Expired' })
    }
    user.verified = true
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    res.status(200).json({ message: 'Your account is make successfully make ' })
  } catch (err) {
    res.status(500).json({ message: 'Not Found Code' })
  }
}