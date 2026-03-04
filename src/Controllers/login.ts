import type { Request, Response } from "express";
import { signup } from "../Models/signupSchema";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
export const LoginController = async (req: Request, res:Response)=>{
    try{
        const {email, password} = req.body
        const UserEmail = await signup.findOne({email})
        if(!UserEmail){
            return res.status(400).json({message: 'Invalid Criditinals'})
        }
        const UserPassword = await bcrypt.compare(password, UserEmail?.password)
        if(!UserPassword){
            return res.status(400).json({message: 'Invalid Criditinals'})
        }
        const JWT_SECRET =  process.env.JWT_SECRET
        if(!JWT_SECRET){
            return res.status(401).json('Token Error')
        }
        const token = jwt.sign(
            {id: UserEmail._id, email: UserEmail.email, role: UserEmail.role},
            JWT_SECRET,
            {expiresIn: '7d'}
          )
          res.status(200).json({message: 'Login Successfully', token})
    }catch(err){
        res.status(500).json({message:'Network Error'})
    }
}