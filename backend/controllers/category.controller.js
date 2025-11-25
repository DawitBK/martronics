import models from "../models/index.js";
const { Category, SubCategory, Product } = models;

// List all categories with their subcategories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: { model: SubCategory, as: "SubCategories" },
    });
    console.log("Categories with subcategories:", JSON.stringify(categories, null, 2));
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(400)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: { model: SubCategory, as: "SubCategories" },
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch category", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create category", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update category", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete category", error: error.message });
  }
};
