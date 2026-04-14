import { Schema, model, Document } from "mongoose";
import { ITask, TaskStatus, TaskPriority } from "../Types/Task.Type"

// Document interface for Mongoose
export interface ITaskDocument extends Omit< ITask,"_id">, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.index({ user: 1, status: 1 });

const Task = model<ITaskDocument>("Task", taskSchema);

export default Task;