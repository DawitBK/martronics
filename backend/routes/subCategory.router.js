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

/**
 * @swagger
 * tags:
 *   name: SubCategories
 *   description: SubCategory management
 */

/**
 * @swagger
 * /subcategory:
 *   get:
 *     summary: List all subcategories
 *     tags: [SubCategories]
 *     responses:
 *       200:
 *         description: List of subcategories
 *   post:
 *     summary: Create a new subcategory
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: SubCategory created
 */

/**
 * @swagger
 * /subcategory/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SubCategory details
 *   put:
 *     summary: Update a subcategory
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: SubCategory updated
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SubCategory deleted
 */


// SubCategory CRUD
router.get("/", listSubCategories); // List all subcategories
router.get("/:id", getSubCategoryById); // Get single subcategory
router.post("/", requireRole(["admin", "manager"]), createSubCategory); // Create subcategory
router.put("/:id", requireRole(["admin", "manager"]), updateSubCategory); // Update subcategory
router.delete("/:id", requireRole(["admin", "manager"]), deleteSubCategory); // Delete subcategory

export default router;
