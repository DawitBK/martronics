import { Router } from "express";
import {
  listCarts,
  getCartByUser,
  createCart,
  deleteCart,
} from "../controllers/cart.controller.js";
import {
  listCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cartItem.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: List all carts
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: List of carts
 *   post:
 *     summary: Create a cart
 *     tags: [Cart]
 *     responses:
 *       201:
 *         description: Cart created
 */

/**
 * @swagger
 * /cart/user/{userId}:
 *   get:
 *     summary: Get cart by user ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's cart
 */

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Delete a cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart deleted
 */

// Cart routes
router.get("/", listCarts);
router.get("/user/:userId", getCartByUser);
router.post("/", createCart);
router.delete("/:id", deleteCart);

// CartItem routes
router.get("/items", listCartItems);
router.post("/items", addCartItem);
router.put("/items/:id", updateCartItem);
router.delete("/items/:id", deleteCartItem);

export default router;
