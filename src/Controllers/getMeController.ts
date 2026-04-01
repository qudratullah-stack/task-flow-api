import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler'
export const getMe = asyncHandler(async (req: Request, res: Response) => {

    const user = (req as any ).user

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});