import mongoose, { Document, Schema,  } from "mongoose"; 

import { signupType } from "../Types/SignypTypes";
export interface newSignupTypes extends signupType, Document{}
export const SignupSchema = new Schema  <newSignupTypes> ({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: Number,
    },
    verificationCodeExpires:{
        type: Date
    }
    
},{timestamps: true})