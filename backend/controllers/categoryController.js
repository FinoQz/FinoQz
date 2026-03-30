// controllers/categoryController.js
import Category from '../models/Category.js';

// Get all categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.json(categories);
  } catch (err) {
    console.error("❌ listCategories error:", err);
    return res.status(500).json({ message: "Server error fetching categories" });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "Name and description required" });
    }
    const category = new Category({ name, description });
    await category.save();
    return res.status(201).json(category);
  } catch (err) {
    console.error("❌ createCategory error:", err);
    return res.status(500).json({ message: "Server error creating category" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("❌ deleteCategory error:", err);
    return res.status(500).json({ message: "Server error deleting category" });
  }
};
