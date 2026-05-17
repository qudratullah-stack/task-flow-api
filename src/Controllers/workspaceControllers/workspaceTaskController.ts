import { asyncHandler } from "../../MiddleWare/asyncHandler";
import { Task } from "../../Models/taskModel";
import { Workspace } from "../../Models/workSpace";
import { emitToWorkspace } from "../../services/socketService";
import { createNotification } from "../../services/notificationService"; 
import { NotificationType } from "../../Models/notificationModel"; 
import { GroupSchema } from "../Validations/task.validation";
import { Request, Response } from "express";

/**
 * @desc    Create a new task with strict validation, socket & DB Notification
 * @route   POST /api/v1/workspace/create-task
 * @access  Protected (Admin/Owner via checkPermission)
 */
export const createGroupTask = asyncHandler(async (req: Request, res: Response) => {
 
  const validatedData = GroupSchema.parse(req.body);
  const creatorId = (req.user as any)._id;

 

 
  const newTask = await Task.create({
    title: validatedData.title,
    description: validatedData.description,
    priority: validatedData.priority,
    dueDate: validatedData.dueDate,
    workspace: validatedData.workspaceId,
    assignee: validatedData.assigneeId, 
    createdBy: creatorId,               
    user: creatorId,                    
  });

 
  const result = await Task.findById(newTask._id)
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email avatar")
    .lean();

 
  const io = req.app.get("io");
  const workspaceIdString = validatedData.workspaceId.toString();
  
  emitToWorkspace(io, workspaceIdString, "TASK_CREATED", result);


  if (result.assignee && result.assignee._id.toString() !== creatorId.toString()) {
    await createNotification(io, {
      recipient: result.assignee._id.toString(),
      sender: creatorId,
      type: NotificationType.TASK_ASSIGNED,
      title: "New Task Assigned",
      message: `${(req.user as any).name} assigned you a new task: ${result.title}`,
      relatedId: result._id
    });
  }

 
  res.status(201).json({ success: true, data: result });
});

/**
 * @desc    Advanced Get Tasks with Filtering, Sorting, and Pagination (Security Protected)
 * @route   GET /api/v1/workspace/get-group-task/:workspaceId
 * @access  Protected (Member/Admin/Owner via workspaceAuth)
 */
export const getGroupAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    search, 
    sortBy = "createdAt", 
    order = "desc" 
  } = req.query;


  const query: any = { workspace: workspaceId };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.title = { $regex: search, $options: "i" }; 
  }

 
  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, totalTasks] = await Promise.all([
    Task.find(query)
      .populate("assignee", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ [sortBy as string]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(), 
    Task.countDocuments(query),
  ]);

 
  res.status(200).json({
    success: true,
    count: tasks.length,
    metadata: {
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / Number(limit)),
      hasNextPage: skip + Number(limit) < totalTasks,
    },
    data: tasks,
  });
});

/**
 * @desc    Delete a task with cleanup, socket & notification (Strict Permission)
 * @route   DELETE /api/v1/workspace/:workspaceId/tasks/:taskId
 * @access  Protected (Admin/Owner via workspaceAuth)
 */
export const deleteGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req.user as any)._id.toString(); 

 
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const workspaceId = task.workspace.toString();
  const taskTitle = task.title;
  const assigneeId = task.assignee?.toString();

 
  await task.deleteOne();
  const io = req.app.get("io");
  emitToWorkspace(io, workspaceId, "TASK_DELETED", { taskId });

 
  if (assigneeId && assigneeId !== userId) {
    await createNotification(io, {
      recipient: assigneeId,
      sender: userId,
      type: NotificationType.TASK_DELETED,
      title: "Task Deleted",
      message: `Task "${taskTitle}" has been removed from the workspace by ${(req.user as any).name}.`,
      relatedId: undefined 
    });
  }

  res.status(200).json({ success: true, message: "Task deleted successfully" });
});

/**
 * @desc    Update task with RBAC and smart notification
 * @route   PATCH /api/v1/workspace/:workspaceId/tasks/:taskId
 * @access  Protected (Dynamic Role Validation via workspaceAuth)
 */
export const updateGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const updates = req.body; 
  const userId = (req.user as any)._id.toString();
  const userRole = req.userRole; 

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const isCreator = task.createdBy.toString() === userId;
  const isAssignee = task.assignee?.toString() === userId; 

 
  if (userRole !== "admin" && userRole !== "owner") {
    if (isCreator || isAssignee) {
      const allowedFields = ["status"];
      const isTryingToChangeOtherFields = Object.keys(updates).some(
        (field) => !allowedFields.includes(field)
      );

      if (isTryingToChangeOtherFields) {
        res.status(403);
        throw new Error("Forbidden: Only Admin can edit task details. You can only update status.");
      }
    } else {
      res.status(403);
      throw new Error("Not authorized to update this task");
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("assignee", "name avatar");
  const io = req.app.get("io");
  const workspaceId = task.workspace.toString();
  
  emitToWorkspace(io, workspaceId, "TASK_UPDATED", updatedTask);

  if (updatedTask.assignee && updatedTask.assignee._id.toString() !== userId) {
    await createNotification(io, {
      recipient: updatedTask.assignee._id.toString(),
      sender: userId,
      type: NotificationType.TASK_UPDATED,
      title: "Task Update",
      message: `The status of task "${updatedTask.title}" has been updated.`,
      relatedId: updatedTask._id
    });
  }
  res.status(200).json({ success: true, data: updatedTask });
});