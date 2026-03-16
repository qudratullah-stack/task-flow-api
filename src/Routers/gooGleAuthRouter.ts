import express from 'express'
const googleRouter = express.Router()
import { signupLimit } from '../MiddleWare/limitMiddle' 
import { googleLogin , loginSuccess,googleCallback  } from '../Controllers/googleAuthController'
import { refreshAccessToken } from '../Controllers/refreshAccessToken'
import { logout } from '../Controllers/logoutController'
import { protect } from '../MiddleWare/protectMiddleware'
googleRouter.get('/google',signupLimit,googleLogin)
googleRouter.get('/google/callback',googleCallback, loginSuccess)
googleRouter.get('/refresh-token',refreshAccessToken)
googleRouter.get('/logout',protect,logout)
export default googleRouter;