import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { signup } from "../Models/signupSchema";

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } 
    else if (req.cookies.SaasAccessToken) { 
        token = req.cookies.SaasAccessToken;
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token found");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        (req as any).user = await signup.findById(decoded.id).select("-password");

        if (!(req as any).user) {
            res.status(401);
            throw new Error("User not found");
        }

        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});