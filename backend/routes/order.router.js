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


// OrderItem routes
router.post("/items", addOrderItem);
router.put("/items/:id", updateOrderItem);
router.delete("/items/:id", deleteOrderItem);

export default router;
