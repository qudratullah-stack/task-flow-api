import express from "express";
import { protect } from "../MiddleWare/protectMiddleware"; 
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} from "../Controllers/workspaceControllers/notificationController";

const NotificationRouter = express.Router();
NotificationRouter.use(protect);

NotificationRouter.get("/get-notification", getMyNotifications);
NotificationRouter.patch("/mark-all-read", markAllAsRead);
NotificationRouter.patch("/:id/read", markAsRead);

export default NotificationRouter;