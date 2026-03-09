import jwt from "jsonwebtoken";
import { Response } from "express";

export const sendToken = (user: any, statusCode: number, res: Response) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict" as const,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken, 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};