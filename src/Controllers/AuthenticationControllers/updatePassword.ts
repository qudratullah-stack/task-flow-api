import asyncHandler from "express-async-handler";
import {  Response } from "express";
import { signup } from "../../Models/signupSchema";

// @desc    Change Password for logged-in user
// @route   POST /api/v1/user/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: any, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error("Please provide both current and new password");
    }

    const user = await signup.findById(req.user?._id).select("+password");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(oldPassword);
    
    if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully!",
    });
});