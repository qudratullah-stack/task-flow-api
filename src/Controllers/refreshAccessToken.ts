import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { signup } from '../Models/signupSchema';
import { sendToken } from './jwtController';
import asyncHandler from 'express-async-handler';

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.SaasRefreshToken;

    if (!incomingRefreshToken) {
        res.status(401);
        throw new Error("Unauthorized request: No refresh token found");
    }
    const decoded = jwt.verify(
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN!
    ) as any;

    const user = await signup.findById(decoded.id).select("+refreshToken");

    if (!user) {
        res.status(401);
        throw new Error("Invalid Refresh Token: User not found");
    }
    if (incomingRefreshToken !== user.refreshToken) {
        user.refreshToken = undefined; 
        await user.save({ validateBeforeSave: false });
        
        res.status(403);
        throw new Error("Refresh token is expired or used. Please login again.");
    }

    sendToken(user, 200, res);
});