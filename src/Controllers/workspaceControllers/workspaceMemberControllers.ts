
import { Request, Response, NextFunction } from "express";
import { Workspace, WorkspaceRole } from "../../Models/workSpace";
import { asyncHandler } from "../../MiddleWare/asyncHandler"; 
import { AppError } from "../../utils/AppError"; 
import { signup, signup as User } from "../../Models/signupSchema"; 
import {io} from "../../server"
import { emitToWorkspace } from "../../services/socketService";

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
    const populatedWorkspace = await Workspace.findById(workspaceId).populate({
    path: "members.user",
    select: "name email avatar",
  });
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
      data: populatedWorkspace,
    });
  });
  



export const removeMemberFromWorkspace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId, userIdToRemove } = req.body;
    const adminId = (req as any).user._id;
  
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return next(new AppError("Workspace not found", 404));
  
    const requester = workspace.members.find(m => m.user.toString() === adminId.toString());
    if (!requester || requester.role !== "admin") {
      return next(new AppError("Only admins can remove members", 403));
    }
  
    if (adminId.toString() === userIdToRemove.toString()) {
      return next(new AppError("You cannot remove yourself. Please delete workspace instead.", 400));
    }
  
    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userIdToRemove.toString()
    ) as any;
  
    await workspace.save();
  
    const updatedWorkspace = await Workspace.findById(workspaceId).populate("members.user", "name email avatar");
  
    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: updatedWorkspace
    });
  });


  /**
 * @route   PATCH /v1/tasks/update-role
 * @desc    Update a member's role in the workspace
 * @access  Private (Admin only)
 */
export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId, newRole } = req.body;
    const adminId = (req as any).user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error("Workspace not found");
    }
 
    if (workspace.owner.toString() !== adminId.toString()) {
        res.status(403);
        throw new Error("Only workspace owner can change member roles");
    }

    const memberIndex = workspace.members.findIndex(
        (m: any) => m.user.toString() === memberId.toString()
    );

    if (memberIndex === -1) {
        res.status(404);
        throw new Error("User is not a member of this workspace");
    }

    workspace.members[memberIndex].role = newRole;
    await workspace.save();
 
    const updatedWorkspace = await workspace.populate("members.user", "name email avatar");
    res.status(200).json({ success: true, data: updatedWorkspace });
});

/**
 * @route   DELETE /v1/tasks/leave-workspace
 * @desc    Allow a member to leave the workspace
 * @access  Private
 */
export const leaveWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.body;
    const userId = (req as any).user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error("Workspace not found");
    }

    if (workspace.owner.toString() === userId.toString()) {
        res.status(400);
        throw new Error("Owner cannot leave the workspace. Delete the workspace instead.");
    }

    workspace.members = workspace.members.filter(
        (m: any) => m.user.toString() !== userId.toString()
    );

    await workspace.save();
    res.status(200).json({ success: true, message: "You have left the workspace" });
});

/**
 * @route   GET /v1/tasks/member-profile/:userId
 * @desc    Get public profile of a workspace member
 * @access  Private
 */
export const getMemberProfile = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

   
    const userProfile = await signup.findById(userId)
        .select("name email avatar createdAt") 
        .lean(); 

    if (!userProfile) {
        res.status(404);
        throw new Error("User profile not found");
    }

    res.status(200).json({
        success: true,
        data: userProfile
    });
});





