import express from 'express'
const signupRoute = express.Router()
import { SignupController } from '../Controllers/AuthenticationControllers/Signup'
import { signupLimit,loginLimit } from '../MiddleWare/limitMiddle'
import { verifyController } from '../Controllers/AuthenticationControllers/verifyController'
import { LoginController } from '../Controllers/AuthenticationControllers/login'
import { forgotPassword } from '../Controllers/AuthenticationControllers/forgotPasswordController'
import { resetPassword } from '../Controllers/AuthenticationControllers/resetPasswordController'
import { getMe } from '../Controllers/AuthenticationControllers/getMeController'
import { protect } from '../MiddleWare/protectMiddleware'
import { upload } from '../MiddleWare/uploadMiddleware'
import { uploadAvatar } from '../Controllers/AuthenticationControllers/imageUploadController'
import { updateMe } from '../Controllers/AuthenticationControllers/userUpdatController'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
signupRoute.post('/login',loginLimit,LoginController)
signupRoute.post("/forgot-password",signupLimit, forgotPassword);
signupRoute.patch("/reset-password/:token", resetPassword);
signupRoute.get('/me',protect,getMe)
signupRoute.patch('/update-me',protect,updateMe)
signupRoute.patch("/update-avatar", protect, upload.single("avatar"), uploadAvatar);
export default signupRoute