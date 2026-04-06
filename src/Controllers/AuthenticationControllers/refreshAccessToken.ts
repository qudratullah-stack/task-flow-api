import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { signup } from '../../Models/signupSchema';
import asyncHandler from 'express-async-handler';

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.SaasRefreshToken;

    if (!incomingRefreshToken) {
        res.status(401);
        throw new Error("Unauthorized request: No refresh token found");
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN!) as any;
    const user = await signup.findById(decoded.id).select("+refreshToken");

    if (!user || incomingRefreshToken !== user.refreshToken) {
        res.status(403);
        throw new Error("Refresh token is expired or invalid");
    }

    const SaasAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    res.cookie("SaasAccessToken", SaasAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        expires: new Date(Date.now() + 15 * 60 * 1000)
    });

    res.status(200).json({ success: true, message: "Token refreshed" });
});