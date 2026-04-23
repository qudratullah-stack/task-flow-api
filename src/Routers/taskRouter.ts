import { Router } from "express";
import { createTask ,getAllTasks,updateTask,deleteTask} from "../Controllers/taskController";
import { protect } from "../MiddleWare/protectMiddleware";
import { validate } from "../MiddleWare/validateMiddleware";
import { createTaskSchema } from "../Controllers/Validations/task.validation";
import { createWorkspace,addMemberToWorkspace,getAllMyWorkspaces } from "../Controllers/workspaceController";

const TaskRouter = Router();

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
TaskRouter.post(
  "/createtask", 
  protect,                  
  validate(createTaskSchema), 
  createTask                 
);
TaskRouter.get("/", protect, getAllTasks);
TaskRouter.route("/update/:id").patch(protect, updateTask);
TaskRouter.route("/delete/:id").delete(protect, deleteTask);
/**
 * @route   POST /api/v1/workspaces
 * @desc    new workspace for creating a group of tasks
 * @access  Private
 */
TaskRouter.post("/create-workspaces", protect, createWorkspace);

TaskRouter.post("/add-member", protect, addMemberToWorkspace);
TaskRouter.get("/workspaces", protect, getAllMyWorkspaces);
export default TaskRouter;