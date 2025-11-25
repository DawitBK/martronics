import { Router } from "express";
import {
  listSubCategories,
  createSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";

import { requireRole } from "../middleware/auth.js";

const router = Router();

// SubCategory CRUD
router.get("/", listSubCategories); // List all subcategories
router.get("/:id", getSubCategoryById); // Get single subcategory
router.post("/", requireRole(["admin", "manager"]), createSubCategory); // Create subcategory
router.put("/:id", requireRole(["admin", "manager"]), updateSubCategory); // Update subcategory
router.delete("/:id", requireRole(["admin", "manager"]), deleteSubCategory); // Delete subcategory

export default router;
