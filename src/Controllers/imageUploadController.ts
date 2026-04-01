import { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    const updatedsignup = await signup.findByIdAndUpdate(
      (req as any).signup._id, 
      { avatar: imagePath },
      { new: true }
    ).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile image updated successfully",
      data: updatedsignup
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};