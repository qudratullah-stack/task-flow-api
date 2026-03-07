import express from 'express'
const signupRoute = express.Router()
import { SignupController, } from '../Controllers/Signup'
import { signupLimit } from '../MiddleWare/limitMiddle'
signupRoute.post('/signup',signupLimit,SignupController)
export default signupRoute