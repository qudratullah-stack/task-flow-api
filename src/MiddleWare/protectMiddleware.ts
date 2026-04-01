import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { signup } from "../Models/signupSchema";

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.SaasAccessToken;

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, please login first");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        (req as any).user = await signup.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});