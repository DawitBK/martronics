// import models from "../models/index.js";

// const { Product, User } = models;

// export const listProducts = async (req, res) => {
//   try {
//     const products = await Product.findAll({
//       include: { model: User, as: "user" },
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(400).json({
//       message: "failed to fetch products",
//       error: error.message,
//     });
//   }
// };

// export const createProduct = async (req, res) => {
//   try {
//     const { name, description, price, user_id } = req.body;

//     const newProduct = await Product.create({
//       name,
//       description,
//       price,
//       user_id, // Make sure this field exists in your Product model
//     });

//     res.status(201).json(newProduct);
//   } catch (error) {
//     res.status(400).json({
//       message: "Failed to create product",
//       error: error.message,
//     });
//   }
// };

import models from "../models/index.js";
const { Product, ProductImage, User, SubCategory, Category } = models;

// List all products
export const listProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: User, as: "user" },
        { model: ProductImage, as: "images" },
        { model: SubCategory, as: "subCategory" },
        { model: Category, as: "category" },
      ],
    });
    res.json(products);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: "images" },
        { model: SubCategory, as: "subCategory" },
      ],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// Add product image
export const addProductImage = async (req, res) => {
  try {
    const { url } = req.body;
    const productId = req.params.id;

    const image = await ProductImage.create({
      product_id: productId,
      url,
    });

    res.status(201).json(image);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to add image", error: error.message });
  }
};

// List product images
export const getProductImages = async (req, res) => {
  try {
    const images = await ProductImage.findAll({
      where: { product_id: req.params.id },
    });
    res.json(images);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch images", error: error.message });
  }
};

// Remaining CRUD: createProduct, updateProduct, deleteProduct
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, sub_category_id } =
      req.body;

    // prefer authenticated user id from middleware (requireRole sets req.user_id)
    const user_id = req.user_id || req.body.user_id;

    if (
      !name ||
      !description ||
      price == null ||
      !user_id ||
      !category_id ||
      !sub_category_id
    ) {
      return res
        .status(400)
        .json({ message: "Missing required product fields" });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock: Number(stock) || 0,
      user_id,
      category_id,
      sub_category_id,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only allow specific fields to be updated
    const { name, description, price, stock, category_id, sub_category_id } =
      req.body;

    await product.update({
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(stock !== undefined ? { stock } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
      ...(sub_category_id !== undefined ? { sub_category_id } : {}),
    });

    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete product", error: error.message });
  }
};
