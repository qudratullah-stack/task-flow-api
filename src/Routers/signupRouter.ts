import express from 'express'
const signupRoute = express.Router()
import { SignupController, verifyController } from '../Controllers/Signup'
signupRoute.post('/signup',SignupController)
signupRoute.post('/verification',verifyController)
export default signupRoute