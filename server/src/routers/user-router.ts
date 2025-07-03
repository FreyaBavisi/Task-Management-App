import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import {
  signup,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { requireRole } from "../middleware/role";

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get(
  "/",
  authenticateJWT,
  requireRole("admin", "manager"),
  getAllUsers
);
userRouter.get("/:id", authenticateJWT, getUserById);
userRouter.put("/:id", authenticateJWT, requireRole("admin"), updateUser);
userRouter.delete(
  "/:id",
  authenticateJWT,
  requireRole("admin", "manager"),
  deleteUser
);

export default userRouter;
