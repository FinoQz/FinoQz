import FinanceCategory from '../models/FinanceCategory.js';
import FinanceSubcategory from '../models/FinanceSubcategory.js';

// --- Category Controllers ---

export const getCategories = async (req, res) => {
  try {
    const categories = await FinanceCategory.find().sort({ order: 1, name: 1 });
    
    // Fetch subcategories for each category
    const categoriesWithSubs = await Promise.all(categories.map(async (cat) => {
      const subcategories = await FinanceSubcategory.find({ categoryId: cat._id }).sort({ order: 1, name: 1 });
      return {
        ...cat.toObject(),
        subcategories
      };
    }));
    
    res.json(categoriesWithSubs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, description, order } = req.body;
    const category = await FinanceCategory.create({ name, icon, description, order });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const category = await FinanceCategory.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are subcategories
    const hasSubs = await FinanceSubcategory.findOne({ categoryId: id });
    if (hasSubs) {
      return res.status(400).json({ message: 'Cannot delete category with associated subcategories.' });
    }
    
    const category = await FinanceCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// --- Subcategory Controllers ---

export const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId, description, order } = req.body;
    
    // Verify category exists
    const category = await FinanceCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Parent category not found' });
    
    const subcategory = await FinanceSubcategory.create({ name, categoryId, description, order });
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(400).json({ message: 'Error creating subcategory', error: error.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const subcategory = await FinanceSubcategory.findByIdAndUpdate(id, updateData, { new: true });
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
    res.json(subcategory);
  } catch (error) {
    res.status(400).json({ message: 'Error updating subcategory', error: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await FinanceSubcategory.findByIdAndDelete(id);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error: error.message });
  }
};
