export interface signupType   {
    name: string,
    email: string,
    password: string,
    role: string,
    verified: boolean,
    verificationCode?: string | null,
    verificationCodeExpires?: Date,
    createdAT?:Date
}