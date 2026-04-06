import jwt from "jsonwebtoken";
import { Response } from "express";
export const sendToken = async (user: any, statusCode: number, res: Response, isRedirect = false) => {
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
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true, 
        path: '/',
        secure: false,   
        sameSite: "lax" as const, 
    };

    res.cookie("SaasAccessToken", SaasAccessToken, { ...cookieOptions, expires: new Date(Date.now() + 15 * 60 * 1000) });
    res.cookie("SaasRefreshToken", SaasRefreshToken, cookieOptions);

    if (isRedirect) {
        return res.redirect("http://localhost:5173/dashboard");
    }

    res.status(statusCode).json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
};