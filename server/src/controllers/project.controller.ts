import { Request, Response, NextFunction } from "express";
import Project from "../models/project.model";
import Task from "../models/task.model";
import User from "../models/user.model";

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description,assignedTo,assignedToTeam } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    const project = new Project({
      name,
      description,
      assignedTo: assignedTo
    });
    if (
      (req as any).user.role === "admin" &&
      assignedToTeam !== undefined
    ) {
      project.assignedToTeam = req.body.assignedToTeam;
    }
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      res.status(400).json({ message: "Assigned user not found." });
      return;
    }
    if (assignedUser && assignedUser.teamId !== assignedToTeam) {
      res.status(400).json({ message: "Assigned user must be in the assigned team." });
      return
    }
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function getAllProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let query;
    if ((req as any).user.role === "admin") {
      query = {};
    } else if ((req as any).user.role === "manager") {
      query = { assignedToTeam: (req as any).user.teamId };
    } else {
      query = { assignedTo: (req as any).user.id };
    }
    const projects = await Project.find(query);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      assignedTo: (req as any).user.id,
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description, assignedTo, assignedToTeam } = req.body;
    const update: any = {};
    if (name) update.name = name;
    if (description) update.description = description;
    if (assignedTo) update.assignedTo = assignedTo;
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      res.status(400).json({ message: "Assigned user not found." });
      return;
    }
    if (assignedUser && assignedUser.teamId !== assignedToTeam) {
      res.status(400).json({ message: "Assigned user must be in the assigned team." });
      return
    }
    if (
      (req as any).user.role === "admin" &&
      assignedToTeam !== undefined
    ) {
      update.assignedToTeam = assignedToTeam;
    }
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, assignedTo: (req as any).user.id },
      update,
      { new: true }
    );
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    if (
      (req as any).user.role === "admin" &&
      req.body.assignedToTeam !== undefined
    ) {
      project.assignedToTeam = req.body.assignedToTeam;
    }
    res.json({ message: "Project updated", project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = req.params.id;
    const taskCount = await Task.countDocuments({ project: projectId });
    if (taskCount > 0) {
      res.status(400).json({
        message:
          "Cannot delete project: there are tasks assigned to this project.",
      });
      return;
    }
    const project = await Project.findOneAndDelete({
      _id: projectId,
      owner: (req as any).user.id,
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}
