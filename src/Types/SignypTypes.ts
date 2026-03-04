export interface signupType   {
    name: string,
    email: string,
    password: string,
    role: string,
    verified: boolean,
    verificationCode?: number | null,
    verificationCodeExpires?: Date
}