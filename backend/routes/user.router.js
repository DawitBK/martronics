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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/", createUser); // Register
router.post("/login", Login);
router.get("/", requireRole(["admin"]), listUsers);
router.put("/:id", requireAuth, updateUser);
router.post("/refresh", RefreshToken);

export default router;
