import express, { Application } from "express";
import { createServer } from "http"; 
import { Server } from "socket.io"; 
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import signupRoute from "./Routers/authRouter";
import { DB } from "./Config/db";
import { notFound, errorHandler } from "./MiddleWare/errorMiddleware";
import cookieParser from 'cookie-parser'
import googleRouter from "./Routers/gooGleAuthRouter";
import TaskRouter from "./Routers/taskRouter";
import passport from 'passport';
import { setupSocketHandlers } from "./services/socketService";
const app: Application = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 3. Middlewares
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(passport.initialize());

// Routes
app.use("/api/v1/auth", signupRoute);
app.use('/api/v1/auth', googleRouter);
app.use("/api/v1/tasks", TaskRouter);
app.use('/uploads', express.static('public/uploads'));

// Error Handlers
app.use(notFound);
app.use(errorHandler);

setupSocketHandlers(io)

const server = httpServer.listen(PORT, () => {
    DB();
    console.log(`✅ Server & Socket running on port ${PORT}`);
});

// Global Handlers
process.on("unhandledRejection", (err: any) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    server.close(() => process.exit(1));
});

export { io };