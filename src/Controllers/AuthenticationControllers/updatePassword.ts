import asyncHandler from "express-async-handler";
import { signup } from "../../Models/signupSchema";

// @desc    Change Password for logged-in user
// @route   POST /api/v1/user/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // 1. فیلڈز چیک کریں
    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error("Please provide both current and new password");
    }

    // 2. یوزر تلاش کریں (req.user._id مڈل ویئر سے آئے گا)
    const user = await signup.findById(req.user._id).select("+password");

    // 3. پرانا پاسورڈ میچ کریں
    const isMatch = await signup.comparePassword(oldPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
    }

    // 4. نیا پاسورڈ سیٹ کریں (ہمارا ماڈل اسے خود ہیش کر دے گا)
    signup.password = newPassword;
    await signup.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully!",
    });
});