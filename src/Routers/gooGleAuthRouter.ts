import express from 'express'
const googleRouter = express.Router()
import { signupLimit } from '../MiddleWare/limitMiddle' 
import { googleLogin , loginSuccess,googleCallback  } from '../Controllers/googleAuthController'
googleRouter.get('/google',signupLimit,googleLogin)
googleRouter.get('/google/callback',googleCallback, loginSuccess)
export default googleRouter;