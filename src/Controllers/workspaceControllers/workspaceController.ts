import { Request, Response, NextFunction } from "express";
import { Workspace, WorkspaceRole } from "../../Models/workSpace";
import { asyncHandler } from "../../MiddleWare/asyncHandler"; 
import { AppError } from "../../utils/AppError"; 

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

  if (!workspace) return next(new AppError("Workspace not found", 404));
  const isMember = workspace.members.some(
    (m: any) => m.user._id.toString() === (req as any).user._id.toString()
  );

  if (!isMember) return next(new AppError("Access denied", 403));

  res.status(200).json({
    success: true,
    data: workspace, 
    stats: { activeTasks: 12, totalMembers: workspace.members.length }
  });
});

