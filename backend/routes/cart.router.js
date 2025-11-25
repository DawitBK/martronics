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
