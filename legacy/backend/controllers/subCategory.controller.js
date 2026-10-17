import models from "../models/index.js";
const { SubCategory, Product, Category } = models;

// List all subcategories
export const listSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [
        { model: Category, as: "category" },
        { model: Product, as: "products" },
      ],
    });
    res.json(subCategories);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch subcategories", error: error.message });
  }
};

export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: Product, as: "products" },
      ],
    });
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });
    res.json(subCategory);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch subcategory", error: error.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;
    const subCategory = await SubCategory.create({
      name,
      description,
      category_id,
    });
    res.status(201).json(subCategory);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create subcategory", error: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    await subCategory.update(req.body);
    res.json(subCategory);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update subcategory", error: error.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    await subCategory.destroy();
    res.json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete subcategory", error: error.message });
  }
};
