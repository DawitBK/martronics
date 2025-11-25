import { Router } from "express";
import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductImage,
  getProductImages,
} from "../controllers/product.controller.js";

import { requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

// Product CRUD

/**
 * @swagger
 * /product:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 */
/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.get("/", listProducts); // List all products
router.get("/:id", getProductById); // Get product details
router.post("/", requireRole(["admin", "manager"]), createProduct); // Create product
router.put("/:id", requireRole(["admin", "manager"]), updateProduct); // Update product
router.delete("/:id", requireRole(["admin", "manager"]), deleteProduct); // Delete product

// Product Images
router.post("/:id/images", requireRole(["admin", "manager"]), addProductImage); // Add image to product
router.get("/:id/images", getProductImages); // List product images

export default router;
