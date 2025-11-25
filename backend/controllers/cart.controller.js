// import models from "../models/index.js";
// const { Cart, User, CartItem, Product } = models;

// // List all carts
// export const listCarts = async (req, res) => {
//   try {
//     const carts = await Cart.findAll({
//       include: [
//         { model: User, as: "user" },
//         {
//           model: CartItem,
//           as: "items", // must match Cart.hasMany alias
//           include: { model: Product, as: "product" },
//         },
//       ],
//     });
//     res.json(carts);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to fetch carts", error: error.message });
//   }
// };

// // Get single cart by user
// export const getCartByUser = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({
//       where: { user_id: req.params.userId },
//       include: [
//         {
//           model: CartItem,
//           as: "items",
//           include: { model: Product, as: "product" },
//         },
//       ],
//     });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });
//     res.json(cart);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to fetch cart", error: error.message });
//   }
// };

// // Create cart
// export const createCart = async (req, res) => {
//   try {
//     const { user_id } = req.body;
//     const cart = await Cart.create({ user_id });
//     res.status(201).json(cart);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to create cart", error: error.message });
//   }
// };

// // Delete cart
// export const deleteCart = async (req, res) => {
//   try {
//     const cart = await Cart.findByPk(req.params.id);
//     if (!cart) return res.status(404).json({ message: "Cart not found" });
//     await cart.destroy();
//     res.json({ message: "Cart deleted successfully" });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Failed to delete cart", error: error.message });
//   }
// };
import models from "../models/index.js";
const { Cart, User, CartItem, Product } = models;

/**
 * List all carts
 */
export const listCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    res.json(carts);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch carts",
      error: error.message,
    });
  }
};

/**
 * Get cart by user ID
 * Auto-create cart if it doesn't exist
 */
export const getCartByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    let cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    // Auto-create if missing
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    res.json(cart);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

/**
 * Create a new cart
 */
export const createCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    const cart = await Cart.create({ user_id });

    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create cart",
      error: error.message,
    });
  }
};

/**
 * Delete cart
 */
export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByPk(req.params.id);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await cart.destroy();

    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete cart",
      error: error.message,
    });
  }
};
