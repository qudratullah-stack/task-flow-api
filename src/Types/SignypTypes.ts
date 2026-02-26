export interface signupType   {
    name: string,
    email: string,
    password: string,
    verified: boolean,
    verificationCode?: number,
    verificationCodeExpires?: Date
}