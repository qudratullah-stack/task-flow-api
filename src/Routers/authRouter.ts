import express from 'express'
const signupRoute = express.Router()
import { SignupController, } from '../Controllers/Signup'
import { signupLimit,loginLimit } from '../MiddleWare/limitMiddle'
import { verifyController } from '../Controllers/verifyController'
import { LoginController } from '../Controllers/login'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
signupRoute.post('/login',loginLimit,LoginController)
export default signupRoute