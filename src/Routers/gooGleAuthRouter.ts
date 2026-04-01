import express from 'express'
const googleRouter = express.Router()
import { signupLimit } from '../MiddleWare/limitMiddle' 
import { googleLogin , loginSuccess,googleCallback  } from '../Controllers/googleAuthController'
import { refreshAccessToken } from '../Controllers/refreshAccessToken'
import { logout } from '../Controllers/logoutController'

googleRouter.get('/google',googleLogin)
googleRouter.get('/google/callback',googleCallback, loginSuccess)
googleRouter.get('/refresh-token',refreshAccessToken)
googleRouter.post('/logout',logout)
export default googleRouter;