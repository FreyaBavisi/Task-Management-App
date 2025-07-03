import { Router } from "express";
import userRouter from "./user-router";
import projectRouter from "./project-router";
import taskRouter from "./task-router";

const v1Router = Router();

v1Router.use("/users", userRouter);
v1Router.use("/projects", projectRouter);
v1Router.use("/tasks", taskRouter);

export default v1Router;
