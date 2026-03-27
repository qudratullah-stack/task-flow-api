import express from 'express'
const signupRoute = express.Router()
import { SignupController, } from '../Controllers/Signup'
import { signupLimit,loginLimit } from '../MiddleWare/limitMiddle'
import { verifyController } from '../Controllers/verifyController'
import { LoginController } from '../Controllers/login'
import { forgotPassword } from '../Controllers/forgotPasswordController'
import { resetPassword } from '../Controllers/resetPasswordController'
import { getMe } from '../Controllers/getMeController'
import { protect } from '../MiddleWare/protectMiddleware'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
signupRoute.post('/login',loginLimit,LoginController)
signupRoute.post("/forgotPassword",signupLimit, forgotPassword);
signupRoute.patch("/reset-password/:token", resetPassword);
signupRoute.get('/me',protect,getMe)
export default signupRoute