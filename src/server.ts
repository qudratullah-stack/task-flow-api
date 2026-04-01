
import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import signupRoute from "./Routers/authRouter";
import { DB } from "./Config/db";
import { notFound } from "./MiddleWare/errorMiddleware";
import cookieParser from 'cookie-parser'
import { errorHandler } from "./MiddleWare/errorMiddleware";
import googleRouter from "./Routers/gooGleAuthRouter";
import passport from 'passport';
const app: Application = express();
const PORT = process.env.PORT || 5000
app.use(cookieParser())
app.use(helmet()); 
app.use(cors({
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(passport.initialize());
app.use("/api/v1/auth", signupRoute); 
app.use('/api/v1/auth',googleRouter)
app.use(notFound); 
app.use(errorHandler); 

const server = app.listen(PORT, () => {
    DB();
    console.log(`Server is running on port ${PORT}`);
});


process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    server.close(() => process.exit(1));
});

