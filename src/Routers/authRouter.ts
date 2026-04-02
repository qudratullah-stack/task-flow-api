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
import { upload } from '../MiddleWare/uploadMiddleware'
import { uploadAvatar } from '../Controllers/imageUploadController'
import { updateMe } from '../Controllers/userUpdatController'
signupRoute.post('/signup',signupLimit,SignupController)
signupRoute.post('/verify',signupLimit,verifyController)
signupRoute.post('/login',loginLimit,LoginController)
signupRoute.post("/forgot-password",signupLimit, forgotPassword);
signupRoute.patch("/reset-password/:token", resetPassword);
signupRoute.get('/me',protect,getMe)
signupRoute.patch('/update-me',protect,updateMe)
signupRoute.patch("/update-avatar", protect, upload.single("avatar"), uploadAvatar);
export default signupRoute