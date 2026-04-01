import multer from "multer";
import path from "path";
import { type Request } from "express";
const storage = multer.diskStorage({
  destination: (req:Request, file, cb) => {
    cb(null, "public/uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });