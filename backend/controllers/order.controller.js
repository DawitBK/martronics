// import models from "../models/index.js";
// const { Order, OrderItem, Product, User, Payment, sequelize } = models;

// export const createOrder = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { user_id, items } = req.body;

//     // Validate required fields
//     if (!user_id) {
//       await t.rollback();
//       return res.status(400).json({ message: "user_id is required" });
//     }

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       await t.rollback();
//       return res.status(400).json({ message: "Items cannot be empty" });
//     }

//     // Extract product IDs
//     const productIds = items.map((i) => Number(i.product_id));

//     // Fetch existing products
//     const products = await Product.findAll({
//       where: { id: productIds },
//     });

//     // Check for missing products
//     if (products.length !== productIds.length) {
//       await t.rollback();
//       return res.status(400).json({
//         message: "One or more products do not exist",
//       });
//     }

//     // Create order
//     let total_amount = 0;

//     const order = await Order.create(
//       {
//         user_id,
//         total_amount: 0,
//         status: "pending",
//       },
//       { transaction: t }
//     );

//     // Create order items
//     for (const item of items) {
//       const product = products.find((p) => p.id === Number(item.product_id));

//       const price_at_purchase = Number(product.price);

//       await OrderItem.create(
//         {
//           order_id: order.id,
//           product_id: product.id,
//           quantity: item.quantity,
//           price_at_purchase,
//         },
//         { transaction: t }
//       );

//       total_amount += price_at_purchase * item.quantity;
//     }

//     // Update total amount
//     await order.update({ total_amount }, { transaction: t });

//     // Commit transaction
//     await t.commit();

//     // Return created order
//     const responseOrder = await Order.findByPk(order.id, {
//       include: [
//         {
//           model: OrderItem,
//           as: "orderItems",
//           include: { model: Product, as: "product" },
//         },
//         { model: User, as: "user" },
//       ],
//     });

//     res.status(201).json(responseOrder);
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({
//       message: "Failed to create order",
//       error: error.message,
//     });
//   }
// };

// export const listOrders = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       include: [
//         { model: User, as: "user" },
//         {
//           model: OrderItem,
//           as: "orderItems",
//           include: { model: Product, as: "product" },
//         },
//         { model: Payment, as: "payments" },
//       ],
//     });
//     res.json(orders);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to fetch orders", error: error.message });
//   }
// };

// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findByPk(req.params.id, {
//       include: [
//         { model: User, as: "user" },
//         {
//           model: OrderItem,
//           as: "orderItems",
//           include: { model: Product, as: "product" },
//         },
//         { model: Payment, as: "payments" },
//       ],
//     });
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to fetch order", error: error.message });
//   }
// };

// // -------- Order Items Endpoints --------

// export const addOrderItem = async (req, res) => {
//   try {
//     const { order_id, product_id, quantity } = req.body;

//     // Fetch product to get price
//     const product = await Product.findByPk(product_id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const price_at_purchase = parseFloat(product.price);

//     const item = await OrderItem.create({
//       order_id,
//       product_id,
//       quantity,
//       price_at_purchase,
//     });

//     res.status(201).json(item);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to add order item", error: error.message });
//   }
// };

// export const updateOrderItem = async (req, res) => {
//   try {
//     const item = await OrderItem.findByPk(req.params.id);
//     if (!item) return res.status(404).json({ message: "Order item not found" });

//     // If product_id changes, update price_at_purchase
//     if (req.body.product_id) {
//       const product = await Product.findByPk(req.body.product_id);
//       if (!product)
//         return res.status(404).json({ message: "Product not found" });
//       req.body.price_at_purchase = parseFloat(product.price);
//     }

//     await item.update(req.body);
//     res.json(item);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to update order item", error: error.message });
//   }
// };

// export const deleteOrderItem = async (req, res) => {
//   try {
//     const item = await OrderItem.findByPk(req.params.id);
//     if (!item) return res.status(404).json({ message: "Order item not found" });

//     await item.destroy();
//     res.json({ message: "Order item deleted successfully" });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to delete order item", error: error.message });
//   }
// };
// order.controller.js
import models from "../models/index.js";
const { Order, OrderItem, Product, User, Payment, sequelize } = models;

/**
 * Creates a new order along with its items in a transaction.
 */
export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { user_id, items } = req.body;

    // Validate required fields
    if (!user_id) {
      await t.rollback();
      return res.status(400).json({ message: "user_id is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Items cannot be empty" });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Extract product IDs and fetch products to validate and get prices
    const productIds = items.map((i) => Number(i.product_id));
    const products = await Product.findAll({
      where: { id: productIds },
    });

    // Check for missing products
    if (products.length !== productIds.length) {
      await t.rollback();
      return res.status(400).json({
        message: "One or more products do not exist",
      });
    }

    // Create the Order
    const order = await Order.create(
      {
        user_id,
        total_amount: 0, // Temporarily set to 0, will be updated
        status: "pending",
      },
      { transaction: t }
    );

    // Create Order Items and calculate total amount
    let total_amount = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const product = products.find((p) => p.id === Number(item.product_id));
      const qty = Number(item.quantity);

      // Check available stock
      if (product.stock < qty) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      const price_at_purchase = Number(product.price);

      orderItemsToCreate.push({
        order_id: order.id,
        product_id: product.id,
        quantity: qty,
        price_at_purchase,
      });

      // reduce stock
      await product.update({ stock: product.stock - qty }, { transaction: t });

      total_amount += price_at_purchase * qty;
    }

    await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

    // Update the total amount on the Order
    await order.update({ total_amount }, { transaction: t });

    // Commit transaction
    await t.commit();

    // Return created order with associations
    const responseOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: { model: Product, as: "product" },
        },
        { model: User, as: "user" },
      ],
    });

    res.status(201).json(responseOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/**
 * Retrieves a list of all orders.
 */
export const listOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: "user" },
        {
          model: OrderItem,
          as: "orderItems",
          include: { model: Product, as: "product" },
        },
        { model: Payment, as: "payments" },
      ],
    });
    res.json(orders);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * Retrieves a single order by ID.
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: "user" },
        {
          model: OrderItem,
          as: "orderItems",
          include: { model: Product, as: "product" },
        },
        { model: Payment, as: "payments" },
      ],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

// --- New/Missing Functions ---

/**
 * Updates an existing order's status or total amount.
 * NOTE: Updating items should be done via separate OrderItem endpoints.
 */
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow updates to status or total_amount for simplicity
    const { status, total_amount } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (total_amount) updateData.total_amount = total_amount;

    await order.update(updateData);
    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};

/**
 * Deletes an order by ID.
 * NOTE: Deleting an Order should cascade delete its OrderItems based on your model configuration.
 */
export const deleteOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // In Sequelize, destroying the parent (Order) should automatically delete
    // associated children (OrderItems) if configured with `onDelete: 'CASCADE'`
    // in the model associations (Order.hasMany(models.OrderItem, ...)).
    // However, explicitly deleting items first is safer in some setups.

    // Explicitly delete associated OrderItems (optional, based on model config)
    await OrderItem.destroy({
      where: { order_id: order.id },
      transaction: t,
    });

    // Delete the Order
    await order.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

// -------- Order Items Endpoints (Included for completeness) --------

export const addOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity } = req.body;

    // Fetch product to get price
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const price_at_purchase = parseFloat(product.price);

    const item = await OrderItem.create({
      order_id,
      product_id,
      quantity,
      price_at_purchase,
    });

    // NOTE: In a real app, you should also update the parent Order's total_amount here.

    res.status(201).json(item);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to add order item", error: error.message });
  }
};

export const updateOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Order item not found" });

    // If product_id changes, update price_at_purchase
    if (req.body.product_id) {
      const product = await Product.findByPk(req.body.product_id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      req.body.price_at_purchase = parseFloat(product.price);
    }

    await item.update(req.body);
    // NOTE: In a real app, you should also recalculate and update the parent Order's total_amount here.
    res.json(item);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update order item", error: error.message });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Order item not found" });

    await item.destroy();
    // NOTE: In a real app, you should also recalculate and update the parent Order's total_amount here.
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete order item", error: error.message });
  }
};
