import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler";
import { Workspace } from "../Models/workSpace";
export const PERMISSIONS = {
  CREATE_TASK: "CREATE_TASK",
  UPDATE_TASK_ALL: "UPDATE_TASK_ALL", 
  UPDATE_TASK_STATUS: "UPDATE_TASK_STATUS", 
  DELETE_TASK: "DELETE_TASK",
  MANAGE_MEMBERS: "MANAGE_MEMBERS", 
  UPDATE_ROLE: "UPDATE_ROLE", 
} as const;

type PermissionType = keyof typeof PERMISSIONS;


const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  owner: [
    "CREATE_TASK", "UPDATE_TASK_ALL", "UPDATE_TASK_STATUS", 
    "DELETE_TASK", "MANAGE_MEMBERS", "UPDATE_ROLE"
  ],
  admin: [
    "CREATE_TASK", "UPDATE_TASK_ALL", "UPDATE_TASK_STATUS", 
    "DELETE_TASK", "MANAGE_MEMBERS"
  ],
  member: [
    "CREATE_TASK", "UPDATE_TASK_STATUS" 
  ],
  viewer: [] 
};

declare global {
  namespace Express {
    interface Request {
      workspace: any;
      userRole: string;
    }
  }
}

export const checkPermission = (requiredPermission: PermissionType) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)._id.toString();
    
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      res.status(400);
      throw new Error("Validation Error: Workspace ID is required for authorization");
    }

    const workspace = await Workspace.findById(workspaceId)
      .select("owner members")
      .lean();

    if (!workspace) {
      res.status(404);
      throw new Error("Authorization Failed: Workspace not found");
    }

    let userRole = "";

    if (workspace.owner.toString() === userId) {
      userRole = "owner";
    } else {
      const memberObj = workspace.members.find(
        (m: any) => m.user.toString() === userId
      );
      
      if (!memberObj) {
        res.status(403);
        throw new Error("Access Denied: You are not a member of this workspace");
      }
      
      userRole = memberObj.role || "member"; 
    }

    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    const hasPermission = userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      res.status(403);
      throw new Error(`Forbidden: You do not have permission to perform this action (${requiredPermission})`);
    }

    req.workspace = workspace;
    req.userRole = userRole;

    next();
  });
};