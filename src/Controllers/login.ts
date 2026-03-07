// import type { Request, Response } from "express";
// import { signup } from "../Models/signupSchema";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// export const LoginController = async (req: Request, res:Response)=>{
//     try{
//         const {email, password} = req.body
//         const User = await signup.findOne({email})
//         if(!User){
//             return res.status(400).json({message: 'Invalid Credetinals'})
//         }
//         const UserPassword = await bcrypt.compare(password, User?.password)
//         if(!UserPassword){
//             return res.status(400).json({message: 'Invalid Credetinals'})
//         }
//         const JWT_SECRET =  process.env.JWT_SECRET
//         const REFRESH_TOKEN = process.env.REFRESH_TOKEN
//         const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRES
//         const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES
//         if(!JWT_SECRET || !REFRESH_TOKEN || !accessTokenExpire || !REFRESH_TOKEN_EXPIRES){
//             return res.status(500).json('Server Configration error')
//         }
//         const accessToken = jwt.sign(
//             {id: User._id, email: User.email, role: User.role},
//             JWT_SECRET,
//             {expiresIn: accessTokenExpire}
//           )
          
//            const refreshToken = jwt.sign(
//             {id: User._id, email: User.email, role: User.role},
//             REFRESH_TOKEN,
//             {expiresIn: REFRESH_TOKEN_EXPIRES}
//           )
//           res.status(200).json({message: 'Login Successfully', refreshToken,accessToken})
//     }catch(err){
//         res.status(500).json({message:'Network Error'})
//     }
// }