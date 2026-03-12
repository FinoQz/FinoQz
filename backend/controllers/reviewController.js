import Review from '../models/Review.js';

// POST /api/reviews - Submit anonymous review (public)
const createReview = async (req, res) => {
  try {
    const { name, rating, reviewText, email } = req.body;
    
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Rating and review text are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({ 
      name: name || 'Anonymous', 
      rating, 
      reviewText, 
      email 
    });
    
    res.status(201).json({ 
      message: 'Review submitted successfully. It will be visible after approval.', 
      review 
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// GET /api/reviews/pinned - Get pinned reviews for landing page (public)
const getPinnedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isPinned: true, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(12);
    res.json({ reviews });
  } catch (error) {
    console.error('Get pinned reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch pinned reviews' });
  }
};

// GET /api/admin/reviews - Get all reviews with filters (admin only)
const getAllReviews = async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (filter === 'pinned') {
      query.isPinned = true;
    } else if (filter === 'approved') {
      query.isApproved = true;
    } else if (filter === 'pending') {
      query.isApproved = false;
    }
    
    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { reviewText: { $regex: search, $options: 'i' } }
      ];
    }
    
    const reviews = await Review.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Review.countDocuments(query);
    
    res.json({ 
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// PATCH /api/admin/reviews/:id/pin - Pin/unpin review (admin only)
const togglePinReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.isPinned = !review.isPinned;
    await review.save();
    
    res.json({ 
      message: `Review ${review.isPinned ? 'pinned' : 'unpinned'} successfully`, 
      review 
    });
  } catch (error) {
    console.error('Toggle pin review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// PATCH /api/admin/reviews/:id/approve - Approve/unapprove review (admin only)
const toggleApproveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.isApproved = !review.isApproved;
    await review.save();
    
    res.json({ 
      message: `Review ${review.isApproved ? 'approved' : 'unapproved'} successfully`, 
      review 
    });
  } catch (error) {
    console.error('Toggle approve review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// DELETE /api/admin/reviews/:id - Delete review (admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

export {
  createReview,
  getPinnedReviews,
  getAllReviews,
  togglePinReview,
  toggleApproveReview,
  deleteReview
};