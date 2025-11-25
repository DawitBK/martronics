import { Router } from "express";
import {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { requireRole } from "../middleware/auth.js";

const router = Router();

// Category CRUD
router.get("/", listCategories); // List all categories
router.get("/:id", getCategoryById); // Get single category
router.post("/", requireRole(["admin", "manager"]), createCategory); // Create category
router.put("/:id", requireRole(["admin", "manager"]), updateCategory); // Update category
router.delete("/:id", requireRole(["admin", "manager"]), deleteCategory); // Delete category

export default router;
