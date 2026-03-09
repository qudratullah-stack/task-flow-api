import express from 'express'
const signupRoute = express.Router()
import { SignupController, } from '../Controllers/Signup'
import { signupLimit } from '../MiddleWare/limitMiddle'
import { verifyController } from '../Controllers/verifyController'
import { LoginController } from '../Controllers/login'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
signupRoute.post('/login',signupLimit,LoginController)
export default signupRoute