import rateLimit from "express-rate-limit";
export const signupLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: "Too Many Signup attempts, try again later"
})