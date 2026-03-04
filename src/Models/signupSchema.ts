import mongoose, { Document, Schema,  } from "mongoose"; 

import { signupType } from "../Types/SignypTypes";
export interface newSignupTypes extends signupType, Document{}
 const SignupSchema = new Schema  <newSignupTypes> ({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
         match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
export const  signup = mongoose.model('SaasAuth', SignupSchema)