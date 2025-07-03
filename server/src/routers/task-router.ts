import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from "../controllers/task.controller";
import { requireRole } from "../middleware/role";

const taskRouter = Router();

taskRouter.post("/", authenticateJWT,requireRole('admin','manager'), createTask);
taskRouter.get("/", authenticateJWT, getAllTasks);
taskRouter.get("/:id", authenticateJWT, getTaskById);
taskRouter.put("/:id", authenticateJWT, requireRole('admin','manager'),updateTask);
taskRouter.delete("/:id", authenticateJWT,requireRole('admin','manager'), deleteTask);
taskRouter.patch(
    '/:id/status',
    authenticateJWT,
    updateTaskStatus
  );

export default taskRouter;
