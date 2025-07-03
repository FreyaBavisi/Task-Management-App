import { Request, Response, NextFunction } from "express";
import Task from "../models/task.model";

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, description, project, status = "todo" } = req.body;
    if (!title || !project) {
      res.status(400).json({ message: "Title and project are required" });
      return;
    }
    const task = new Task({
      title,
      description,
      project,
      assignedTo: req.body.assignedTo,
      status,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function getAllTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;
    let tasks;
    if (user.role === "admin") {
      tasks = await Task.find();
    } else if (user.role === "manager") {
      const Project = require("../models/project.model").default;
      const projects = await Project.find(
        { assignedToTeam: user.teamId },
        { _id: 1 }
      );
      const projectIds = projects.map((p: any) => p._id);
      tasks = await Task.find({ project: { $in: projectIds } });
    } else {
      tasks = await Task.find({ assignedTo: user.id });
    }
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: (req as any).user.id,
    });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, description, project, status, assignedTo } = req.body;
    const user = (req as any).user;
    const update: any = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (project) update.project = project;
    if (status) update.status = status;
    if (assignedTo) update.assignedTo = assignedTo;

    let query: any = { _id: req.params.id };
    if (user.role === "employee") {
      query.assignedTo = user.id;
    }

    const task = await Task.findOneAndUpdate(query, update, { new: true });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ message: "Task updated", task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      assignedTo: (req as any).user.id,
    });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status } = req.body;

    if (!["todo", "in-progress", "completed"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return; 
    }

    const task = await Task.findOne({ _id: id, assignedTo: user.id });
    if (!task) {
      res
        .status(404)
        .json({ message: "Task not found or not assigned to you" });
      return;
    }
    if (user.role !== "employee") {
      res
        .status(403)
        .json({ message: "Only employees can update status here" });
      return; 
    }

    task.status = status;
    await task.save();
    res.json({ message: "Status updated", task });
  } catch (err) {
    next(err);
  }
}
