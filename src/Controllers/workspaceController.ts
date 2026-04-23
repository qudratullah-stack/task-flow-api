import { Request, Response, NextFunction } from "express";
import { Workspace, WorkspaceRole } from "../Models/workSpace";
import { asyncHandler } from "../MiddleWare/asyncHandler"; 
import { AppError } from "../utils/AppError"; 
import { signup as User } from "../Models/signupSchema"; 
import {io} from "../server"
import { emitToWorkspace } from "../services/socketService";
/**
 * @desc    Create a new workspace
 * @route   POST /api/v1/workspaces
 * @access  Private (Logged-in users)
 */
export const createWorkspace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;

  // 1. Validation check
  if (!name) {
    return next(new AppError("Please provide a workspace name", 400));
  }

  const newWorkspace = await Workspace.create({
    name,
    description,
    owner: (req as any).user._id,
    members: [
      {
        user: (req as any).user._id,
        role: WorkspaceRole.ADMIN, 
        joinedAt: new Date(),
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Workspace created successfully",
    data: newWorkspace,
  });
});




/**
 * @desc    Add a member to a workspace
 * @route   POST /api/v1/workspaces/add-member
 * @access  Private (Only Workspace Admin)
 */
export const addMemberToWorkspace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { workspaceId, userEmail, role } = req.body;

  if (!workspaceId || !userEmail) {
    return next(new AppError("Please provide workspace ID and user email", 400));
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  const requester = workspace.members.find(
    (m) => m.user.toString() === (req as any).user._id.toString()
  );

  if (!requester || requester.role !== WorkspaceRole.ADMIN) {
    return next(new AppError("Only workspace admins can add new members", 403));
  }

  const userToAdd = await User.findOne({ email: userEmail });
  if (!userToAdd) {
    return next(new AppError("User not found in our system. Please invite them to sign up first.", 404));
  }

  const isAlreadyMember = workspace.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );

  if (isAlreadyMember) {
    return next(new AppError("User is already a member of this workspace", 400));
  }

  workspace.members.push({
    user: userToAdd._id as any,
    role: role || WorkspaceRole.VIEWER, 
    joinedAt: new Date(),
  });

  await workspace.save();
  emitToWorkspace(io, workspaceId, "member_added", {
    workspaceId: workspaceId,
    message: `${userToAdd.name} has been added to the workspace `,
    newMember: {
        id: userToAdd._id,
        name: userToAdd.name,
        role: role || WorkspaceRole.VIEWER
    }
  });

  res.status(200).json({
    success: true,
    message: "Member added successfully to the workspace",
    data: workspace,
  });
});

/**
 * @desc    Get all workspaces where the current user is a member or owner
 * @route   GET /api/v1/workspaces
 * @access  Private
 */
export const getAllMyWorkspaces = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user._id;

  const workspaces = await Workspace.find({
    "members.user": userId
  }).sort("-createdAt"); 

  res.status(200).json({
    success: true,
    count: workspaces.length,
    data: workspaces,
  });
});

/**
 * @desc    Get Single Workspace Details (with members & stats)
 * @route   GET /api/v1/workspaces/:id
 * @access  Private
 */
export const getWorkspaceById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const workspace = await Workspace.findById(id).populate({
    path: "members.user",
    select: "name email avatar", 
  });

  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  const isMember = workspace.members.some(
    (m) => m.user._id.toString() === (req as any).user._id.toString()
  );

  if (!isMember) {
    return next(new AppError("You do not have access to this workspace", 403));
  }

  const stats = {
    activeTasks: 12, 
    totalMembers: workspace.members.length,
  };

  res.status(200).json({
    success: true,
    data: workspace,
    stats: stats
  });
});