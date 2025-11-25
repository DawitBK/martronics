// import { Router } from "express";
// import {
//   listOrders,
//   getOrderById,
//   createOrder,
// } from "../controllers/order.controller.js";
// import {
//   addOrderItem,
//   updateOrderItem,
//   deleteOrderItem,
// } from "../controllers/orderItem.controller.js";

// const router = Router();

// // Order routes
// router.get("/", listOrders);
// router.get("/:id", getOrderById);
// router.post("/", createOrder);

// // OrderItem routes
// router.post("/items", addOrderItem);
// router.put("/items/:id", updateOrderItem);
// router.delete("/items/:id", deleteOrderItem);

// export default router;
// src/routes/order.router.js
import { Router } from "express";
import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
import {
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "../controllers/orderItem.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API
 */

// Order routes

/**
 * @swagger
 * /order:
 *   get:
 *     summary: List all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 */
/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted
 */
router.get("/", listOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

// OrderItem routes
router.post("/items", addOrderItem);
router.put("/items/:id", updateOrderItem);
router.delete("/items/:id", deleteOrderItem);

export default router;
