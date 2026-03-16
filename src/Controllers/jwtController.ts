import jwt from "jsonwebtoken";
import { Response } from "express";

export const sendToken = async (user: any, statusCode: number, res: Response) => {
    const SaasAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );
    const SaasRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN!,
        { expiresIn: "7d" }
    );
    user.refreshToken = SaasRefreshToken;
    await user.save({ validateBeforeSave: false})
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    };
    res.cookie("SaasRefreshToken", SaasRefreshToken, cookieOptions);
    res.status(statusCode).json({
        success: true,
        SaasAccessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};