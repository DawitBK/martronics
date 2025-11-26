// import { Router } from "express";
// import {
//   createUser,
//   listUsers,
//   Login,
//   updateUser,
//   RefreshToken,
// } from "../controllers/user.controller.js";
// import { requireAuth, requireRole } from "../middleware/auth.js";
// const router = Router();

// router.post("/", createUser);
// router.post("/login", Login);
// router.get("/", requireRole(["admin", "manager"]), listUsers);
// router.post("/refresh", RefreshToken);
// router.put("/:id", requireAuth, updateUser);

// export default router;
// routes/user.router.js
import { Router } from "express";
import {
  createUser,
  listUsers,
  Login,
  updateUser,
  RefreshToken,
} from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

// User routes

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]

export default router;
