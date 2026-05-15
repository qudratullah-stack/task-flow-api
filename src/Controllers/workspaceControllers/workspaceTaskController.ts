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
 */
export const createGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = GroupSchema.parse(req.body);
  const creatorId = (req.user as any)._id;

  const workspace = await Workspace.findById(validatedData.workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error("Workspace not found");
  }

  const isMember = workspace.members.some(m => m.user.toString() === creatorId.toString());
  if (!isMember) {
    res.status(403);
    throw new Error("Access Denied: You are not a member of this workspace");
  }

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
 * @desc    Delete a task with cleanup and notification
 */
export const deleteGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req.user as any)._id; 

  const task = await Task.findById(taskId).populate("workspace");
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  const workspaceId = (task.workspace as any)._id.toString();
  const taskTitle = task.title;
  const assigneeId = task.assignee?.toString();

  await task.deleteOne();

  const io = req.app.get("io");
  
  emitToWorkspace(io, workspaceId, "TASK_DELETED", { taskId });

  if (assigneeId && assigneeId !== userId.toString()) {
    await createNotification(io, {
      recipient: assigneeId,
      sender: userId,
      type: NotificationType.TASK_DELETED,
      title: "Task Deleted",
      message: `Task "${taskTitle}" has been removed from the workspace.`,
      relatedId: undefined
    });
  }

  res.status(200).json({ success: true, message: "Deleted" });
});

/**
 * @desc    Update task with RBAC and smart notification
 */
export const updateGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const updates = req.body; 
  const userId = (req.user as any)._id;

  const task = await Task.findById(taskId).populate("workspace");
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  const workspace = task.workspace as any;
  const isOwner = workspace.owner.toString() === userId.toString();
  const isCreator = task.createdBy.toString() === userId.toString();
  const isAssignee = task.assignee.toString() === userId.toString(); 

  // RBAC Logic
  if (!isOwner && (isCreator || isAssignee)) {
    const allowedFields = ["status"];
    if (Object.keys(updates).some(field => !allowedFields.includes(field))) {
      res.status(403);
      throw new Error("Only Admin can edit task details. You can only update status.");
    }
  } else if (!isOwner && !isCreator && !isAssignee) {
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("assignee", "name avatar");

  const io = req.app.get("io");
  
  emitToWorkspace(io, workspace._id.toString(), "TASK_UPDATED", updatedTask);
  if (updatedTask.assignee && updatedTask.assignee._id.toString() !== userId.toString()) {
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