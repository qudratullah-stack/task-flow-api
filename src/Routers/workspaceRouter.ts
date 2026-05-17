import { Router } from "express";
import { protect } from "../MiddleWare/protectMiddleware";
import { createGroupTask, getGroupAllTasks , deleteGroupTask, updateGroupTask} from "../Controllers/workspaceControllers/workspaceTaskController";
import { createWorkspace,getAllMyWorkspaces, getWorkspaceById } from "../Controllers/workspaceControllers/workspaceController";
import { checkPermission } from "../MiddleWare/workspaceAuth";
const WorkspaceRouter = Router();



WorkspaceRouter.post("/create-workspaces", protect, createWorkspace);
WorkspaceRouter.get("/workspaces", protect, getAllMyWorkspaces);
WorkspaceRouter.get("/workspaces/:id", protect, getWorkspaceById);
WorkspaceRouter.post(
    "/create-task", 
    protect, 
    checkPermission("CREATE_TASK"), 
    createGroupTask
  );
  WorkspaceRouter.get(
    "/get-group-task/:workspaceId", 
    protect,
    checkPermission("UPDATE_TASK_STATUS"), 
    getGroupAllTasks
  );
  WorkspaceRouter.delete(
    "/:workspaceId/tasks/:taskId", 
    protect, 
    checkPermission("DELETE_TASK"),
    deleteGroupTask
  );
  WorkspaceRouter.patch(
    "/:workspaceId/tasks/:taskId", 
    protect, 
    checkPermission("UPDATE_TASK_STATUS"), 
    updateGroupTask
  );
export default WorkspaceRouter;