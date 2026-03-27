'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface Review {
  _id: string;
  name: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    name: '',
    email: '',
    rating: 0,
    reviewText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchPinnedReviews();
  }, []);

  const fetchPinnedReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/pinned`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.rating || !newReview.reviewText.trim()) {
      setSubmitMessage('Please provide a rating and review text');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await axios.post(`${API_URL}/api/reviews`, {
        name: newReview.name.trim() || 'Anonymous',
        email: newReview.email.trim(),
        rating: newReview.rating,
        reviewText: newReview.reviewText.trim()
      });
      
      setSubmitMessage('Thank you! Your review has been submitted and will appear after approval.');
      setNewReview({ name: '', email: '', rating: 0, reviewText: '' });
      
      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      className="py-20 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden relative"
    >
      {/* Background blur shapes */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300 opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-300 opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-[var(--theme-primary)] mb-4 text-center">
          What Our Community Says
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Real feedback from our users who are mastering finance with FinoQz
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Featured Reviews */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-[var(--theme-primary)] mb-6">Featured Reviews</h3>
            
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[var(--theme-primary)] font-semibold text-lg">{review.name}</h4>
                      <div className="flex gap-1">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.reviewText}</p>
                    <p className="text-gray-400 text-xs mt-3">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Write a Review */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-[var(--theme-primary)] mb-2">Write a Review</h3>
              <p className="text-gray-600 text-sm mb-6">Share your experience with FinoQz</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Anonymous"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                    maxLength={50}
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={newReview.email}
                    onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          newReview.rating >= star 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Share your experience with FinoQz..."
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] resize-none"
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newReview.reviewText.length}/1000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--theme-primary)] text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>

                {/* Submit Message */}
                {submitMessage && (
                  <p className={`text-sm text-center ${
                    submitMessage.includes('Thank you') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {submitMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
