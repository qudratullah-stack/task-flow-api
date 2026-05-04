import { Router } from "express";
import { protect } from "../MiddleWare/protectMiddleware";
import { createGroupTask, getGroupAllTasks , deleteGroupTask, updateGroupTask} from "../Controllers/workspaceControllers/workspaceTaskController";
import { createWorkspace,getAllMyWorkspaces, getWorkspaceById } from "../Controllers/workspaceControllers/workspaceController";
const WorkspaceRouter = Router();



WorkspaceRouter.post("/create-workspaces", protect, createWorkspace);
WorkspaceRouter.get("/workspaces", protect, getAllMyWorkspaces);
WorkspaceRouter.get("/workspaces/:id", protect, getWorkspaceById);
WorkspaceRouter.post("/create-task", protect, createGroupTask);
WorkspaceRouter.get("/get-group-task/:workspaceId", protect,getGroupAllTasks);
WorkspaceRouter.delete("/delete-group-task/:taskId", protect, deleteGroupTask)
WorkspaceRouter.patch("/update-group-task/:taskId", protect, updateGroupTask);
export default WorkspaceRouter;