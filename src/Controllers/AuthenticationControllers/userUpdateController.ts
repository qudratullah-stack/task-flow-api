import { signup } from "../../Models/signupSchema";
import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';

/**
 * @desc    Update User Profile (Name & Email)
 * @route   PATCH /api/v1/auth/update-me
 * @access  Private
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    if (req.body.password) {
        res.status(400);
        throw new Error('This route is not for password updates. Please use /update-password');
    }

    const filteredBody: any = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;
    const currentUser = req.user as any
 if(!currentUser){
            res.status(401);
            throw new Error('Not authorized')
        }
    const updatedUser = await signup.findByIdAndUpdate(
       
       currentUser._id, 
        filteredBody, 
        {
            new: true,           
            runValidators: true, 
        }
    ).select("-password -googleId -refreshToken");

    if (!updatedUser) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
            user: updatedUser
        }
    });
});