import express from 'express'
const signupRoute = express.Router()
import { SignupController } from '../Controllers/Signup'
signupRoute.post('/signup',SignupController)
export default signupRoute