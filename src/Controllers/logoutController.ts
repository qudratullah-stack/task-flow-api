import { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import asyncHandler from "express-async-handler";

export const logout = asyncHandler(async (req: Request, res: Response) => {
    
    res.cookie("SaasAccessToken", "", { 
        httpOnly: true, 
        secure: true, 
        sameSite: "none",
        expires: new Date(0) 
    });
    
    res.cookie("SaasRefreshToken", "", { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        expires: new Date(0) 
    });

    const userId = (req as any).user?._id;

    if (userId) {
        await signup.findByIdAndUpdate(userId, {
            $unset: { refreshToken: 1 } 
        });
    }

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});
