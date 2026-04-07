import Banner from '../models/Banner.js';

// Get active banners for User Dashboard
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({ success: false, message: 'Server error fetching banners' });
  }
};

// --- Admin Endpoints ---

// Get all banners (active and inactive)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    console.error('Error fetching all banners:', error);
    res.status(500).json({ success: false, message: 'Server error fetching banners' });
  }
};

// Create new banner
export const createBanner = async (req, res) => {
  try {
    const { title, description, imageUrl, targetUrl, isActive, order } = req.body;
    
    // Create banner
    const banner = await Banner.create({
      title,
      description,
      imageUrl,
      targetUrl,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      createdBy: req.adminId || null,
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Server error creating banner' });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    let banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner = await Banner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: 'Server error updating banner' });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Server error deleting banner' });
  }
};
