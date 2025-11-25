import models from "../models/index.js";
const { CartItem, Cart, Product } = models;

// List all cart items
export const listCartItems = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      include: [
        { model: Cart, as: "cart" },
        { model: Product, as: "product" },
      ],
    });
    res.json(items);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch cart items", error: error.message });
  }
};

// Add item to cart
export const addCartItem = async (req, res) => {
  try {
    const { cart_id, product_id, quantity } = req.body;
    const item = await CartItem.create({ cart_id, product_id, quantity });
    res.status(201).json(item);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to add item", error: error.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update item", error: error.message });
  }
};

// Remove item from cart
export const deleteCartItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    await item.destroy();
    res.json({ message: "Item removed successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to remove item", error: error.message });
  }
};
