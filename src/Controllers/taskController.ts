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


/**
 * @desc    Get all tasks for the logged-in user
 * @route   GET /api/v1/tasks
 * @access  Private
 */
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const tasks = await Task.find({ user: userId }).sort("-createdAt");

 
  res.status(200).json({
    success: true,
    count: tasks.length, 
    data: tasks,
  });
});

/**
 * @desc    Update a task
 * @route   PATCH /api/v1/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  let task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (task.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error("User not authorized to update this task");
  }

  task = await Task.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (task.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error("User not authorized to delete this task");
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: "Task removed successfully",
    data: {} 
  });
});