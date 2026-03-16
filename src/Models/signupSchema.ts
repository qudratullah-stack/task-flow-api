import mongoose, { Document, Schema } from "mongoose"; 
import bcrypt from "bcrypt";
import { signupType } from "../Types/SignypTypes";
import { required } from "zod/v4/core/util.cjs";

export interface newSignupTypes extends signupType, Document {
   
    comparePassword(password: string): Promise<boolean>; 
}

const SignupSchema = new Schema<newSignupTypes>({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: function(this: any) {
            return !this.googleId; 
        },
        minlength: [8, "Password must be 8+ characters"],
        select: false 
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false,
        index: true
    },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    refreshToken:{
        type: String,
        select: false
    },
    loginAttempts:{
        type: Number,
        required: true,
        default: 0
    },
    lockUntil:{
        type: Date
    },
}, { 
    timestamps: true,
    versionKey: false 
});

SignupSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return 
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
   
});

SignupSchema.methods.comparePassword = async function (enteredPassword: string) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export const signup = mongoose.model<newSignupTypes>('SaasUser', SignupSchema);