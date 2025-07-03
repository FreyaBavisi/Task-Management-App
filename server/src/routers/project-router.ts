import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { requireRole } from "../middleware/role";

const projectRouter = Router();

projectRouter.post("/", authenticateJWT, requireRole('admin','manager'), createProject);
projectRouter.get("/", authenticateJWT, getAllProjects);
projectRouter.get("/:id", authenticateJWT, getProjectById);
projectRouter.put("/:id", authenticateJWT, requireRole('admin','manager'), updateProject);
projectRouter.delete("/:id", authenticateJWT,  requireRole('admin','manager'),deleteProject);

export default projectRouter;
