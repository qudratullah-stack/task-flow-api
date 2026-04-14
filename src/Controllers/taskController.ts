import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Task from "../Models/taskModel";
import { TaskStatus, TaskPriority } from "../Types/Task.Type";

/**
 * @desc    Create a new task
 * @route   POST /api/v1/tasks
 * @access  Private (Authenticated users only)
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status: status || TaskStatus.TODO,
    priority: priority || TaskPriority.MEDIUM,
    dueDate,
    user: (req.user as any )?._id, 
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});