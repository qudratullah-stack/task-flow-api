import express from 'express'
const googleRouter = express.Router()
import { googleLogin , loginSuccess,googleCallback  } from '../Controllers/googleAuthController'
googleRouter.get('/google',googleLogin)
googleRouter.get('/google/callback',googleCallback, loginSuccess)
export default googleRouter;