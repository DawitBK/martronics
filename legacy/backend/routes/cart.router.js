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
 *     summary: List all carts (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of carts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
 *   post:
 *     summary: Create a cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cart created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 * 
 * /cart/user/{userId}:
 *   get:
 *     summary: Get cart by user ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /cart/{id}:
 *   delete:
 *     summary: Delete a cart
 *     tags: [Cart]
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
 *         description: Cart deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
