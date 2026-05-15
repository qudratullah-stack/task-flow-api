import { Request, Response } from "express";
import { asyncHandler } from "../../MiddleWare/asyncHandler";
import { Notification } from "../../Models/notificationModel";

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/v1/notifications
 */
export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50) 
    .populate("sender", "name avatar");

  const unreadCount = await Notification.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });

  res.status(200).json({
    success: true,
    unreadCount,
    data: notifications
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: (req.user as any)._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found or unauthorized");
  }

  res.status(200).json({ success: true, data: notification });
});

/**
 * @desc    Mark all as read (Facebook Style)
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { recipient: (req.user as any)._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: "All marked as read" });
});