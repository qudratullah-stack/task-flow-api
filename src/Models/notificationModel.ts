import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  WORKSPACE_INVITE = "WORKSPACE_INVITE",
  SYSTEM_ALERT = "SYSTEM_ALERT"
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; 
  sender: mongoose.Types.ObjectId;    
  type: NotificationType;            
  title: string;                      
  message: string;                   
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;                    
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "SaasUser", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "SaasUser", required: true },
    type: { 
      type: String, 
      enum: Object.values(NotificationType), 
      default: NotificationType.SYSTEM_ALERT 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
import "../Models/signupSchema"
export const Notification = mongoose.model<INotification>("Notification", notificationSchema);