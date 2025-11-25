// src/controllers/orderItems.js
import models from "../models/index.js";
const { OrderItem, Product, Order } = models;

// Add a new order item
export const addOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity } = req.body;

    if (!order_id || !product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch the product to get its price
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: Check if order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create order item with price_at_purchase from product
    const orderItem = await OrderItem.create({
      order_id,
      product_id,
      quantity,
      price_at_purchase: parseFloat(product.price),
    });

    res.status(201).json(orderItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add order item", error: error.message });
  }
};

// List all order items
export const listOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.findAll({
      include: [
        { model: Product, as: "product" },
        { model: Order, as: "order" },
      ],
    });
    res.json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order items", error: error.message });
  }
};

// Get a single order item by ID
export const getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id, {
      include: [
        { model: Product, as: "product" },
        { model: Order, as: "order" },
      ],
    });
    if (!item) return res.status(404).json({ message: "Order item not found" });
    res.json(item);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order item", error: error.message });
  }
};
// Inside orderItem.controller.js
export const updateOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Order item not found" });

    const { quantity } = req.body;
    if (quantity !== undefined) item.quantity = quantity;

    // Optionally update price_at_purchase if you want
    // const product = await Product.findByPk(item.product_id);
    // item.price_at_purchase = parseFloat(product.price);

    await item.save();
    res.json(item);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order item", error: error.message });
  }
};

// Delete an order item
export const deleteOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Order item not found" });

    await item.destroy();
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order item", error: error.message });
  }
};
