import { asyncHandler } from "../../MiddleWare/asyncHandler";
import { Task } from "../../Models/taskModel";
import { Workspace } from "../../Models/workSpace";
import { GroupSchema } from "../Validations/task.validation";
import { Request, Response } from "express";

/**
 * @desc    Create a new task with strict validation
 * @access  Private
 */
export const createGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = GroupSchema.parse(req.body);
  const creatorId = (req.user as any)._id;

  const isMember = await Workspace.exists({
    _id: validatedData.workspaceId,
    "members.user": creatorId,
  });

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

 
res.status(201).json({
  success: true,
  message: "Task created successfully",
  data: result, 
});
});

/**
 * @desc    Advanced Get Tasks with Filtering, Sorting, and Pagination
 * @route   GET /api/v1/workspace/workspace/:workspaceId?page=1&limit=10&status=todo&priority=high&search=fix
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


export const deleteGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req.user as any)._id; 

 
  const task = await Task.findById(taskId).populate("workspace");

  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

 
  const workspace = task.workspace as any;
  const isOwner = workspace.owner.toString() === userId.toString();
  const isCreator = task.createdBy.toString() === userId.toString();

 
  if (!isOwner && !isCreator) {
    return res.status(403).json({ 
      success: false, 
      message: "Security Alert: You are not authorized to delete this task" 
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully by authorized user",
  });
});



export const updateGroupTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const updates = req.body; 
  const userId = (req.user as any)._id;

  const task = await Task.findById(taskId).populate("workspace");
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  const workspace = task.workspace as any;
  const isOwner = workspace.owner.toString() === userId.toString();
  const isCreator = task.createdBy.toString() === userId.toString();
  const isAssignee = task.assignee.toString() === userId.toString(); 

  
  
  
  if (isOwner) {
   
  } 
 
  else if (isCreator || isAssignee) {
    const allowedFields = ["status"];
    const attemptToChangeFields = Object.keys(updates);
    const isViolating = attemptToChangeFields.some(field => !allowedFields.includes(field));

    if (isViolating) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Admin can edit task details. You can only update status."
      });
    }
  } 
 
  else {
    return res.status(403).json({ 
      success: false, 
      message: "Security Alert: Not authorized to update this task" 
    });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("assignee", "name avatar");

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: updatedTask,
  });
});