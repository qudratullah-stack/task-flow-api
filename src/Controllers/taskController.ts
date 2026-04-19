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
 * @desc    Get all tasks with Pagination, Filtering & Sorting
 * @route   GET /api/v1/tasks
 * @access  Private
 */
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const queryObj: any = { user: userId };
  
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.priority) queryObj.priority = req.query.priority;
  if (req.query.search) {
    queryObj.title = { $regex: req.query.search, $options: "i" }; 
  }

 
  const tasks = await Task.find(queryObj)
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  
  const totalTasks = await Task.countDocuments(queryObj);
  const totalPages = Math.ceil(totalTasks / limit);

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination: {
      totalTasks,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
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