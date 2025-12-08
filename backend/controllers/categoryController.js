// controllers/categoryController.js
const Category = require('../models/Category');

// Get all categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.json(categories);
  } catch (err) {
    console.error("❌ listCategories error:", err);
    return res.status(500).json({ message: "Server error fetching categories" });
  }
};

// Create category
exports.createCategory = async (req, res) => {
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
