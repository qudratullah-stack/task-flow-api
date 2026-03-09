import express from 'express'
const signupRoute = express.Router()
import { SignupController, } from '../Controllers/Signup'
import { signupLimit } from '../MiddleWare/limitMiddle'
import { verifyController } from '../Controllers/verifyController'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
export default signupRoute