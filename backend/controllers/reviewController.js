const Review = require('../models/Review');

const createReview = async (req, res) => {
  try {
    const { name, rating, comment, email } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ message: 'Name, rating and comment are required' });
    }

    const review = await Review.create({ name, rating, comment, email });
    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

const getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved', showOnLanding: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ reviews });
  } catch (error) {
    console.error('Get featured reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch featured reviews' });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, showOnLanding } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (status) review.status = status;
    if (typeof showOnLanding === 'boolean') review.showOnLanding = showOnLanding;

    await review.save();

    res.json({ message: 'Review updated', review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

module.exports = {
  createReview,
  getReviews,
  getFeaturedReviews,
  updateReviewStatus
};