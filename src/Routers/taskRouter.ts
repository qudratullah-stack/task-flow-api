import { Router } from "express";
import { createTask ,getAllTasks} from "../Controllers/taskController";
import { protect } from "../MiddleWare/protectMiddleware";
import { validate } from "../MiddleWare/validateMiddleware";
import { createTaskSchema } from "../Controllers/Validations/task.validation";

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
TaskRouter.get("/getalltasks", protect, getAllTasks);

export default TaskRouter;