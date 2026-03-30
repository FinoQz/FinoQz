'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <section id="reviews" className="py-16 md:py-20 bg-transparent overflow-hidden relative">
      {/* Background blur shapes matching TryQuiz */}
      <div className="absolute -top-10 -right-10 w-[300px] h-[300px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase"
          >
            Community Insights
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900 leading-tight">
            What <span className="text-[#253A7B] font-bold underline decoration-blue-200 underline-offset-8">Our Community</span> Says
          </h2>
          
          <p className="text-lg text-gray-500 font-normal max-w-2xl mx-auto leading-relaxed">
            Real feedback from our users <span className="text-gray-800 font-semibold italic">mastering finance with FinoQz.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Left: Featured Reviews */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-4 px-2 tracking-tight">Featured Ratings</h3>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-xs md:text-sm font-medium py-6 px-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-center">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-3 pb-4 lg:pb-0 lg:max-h-[600px] scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {reviews.map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="min-w-[260px] md:min-w-0 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl md:rounded-[1.5rem] shadow-sm p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-800 font-bold text-[10px] md:text-sm shadow-xs border border-white">
                           {review.name.charAt(0).toUpperCase()}
                         </div>
                         <h4 className="text-gray-800 font-bold text-xs md:text-sm tracking-tight">{review.name}</h4>
                      </div>
                      <div className="flex gap-0.5 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100/50 shadow-xs">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-2.5 w-2.5 md:h-3 md:w-3 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-[11px] md:text-sm leading-relaxed font-normal italic line-clamp-3">&quot;{review.reviewText}&quot;</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Write a Review */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-white/50 backdrop-blur-2xl rounded-2xl md:rounded-[1.5rem] shadow-sm p-5 md:p-8 border border-white/80 transition-all hover:shadow-md">
              <h3 className="text-base md:text-xl font-bold text-gray-800 mb-0.5">Write a Review</h3>
              <p className="text-gray-500 font-medium text-[11px] md:text-[13px] mb-4">Drop your thoughts on FinoQz</p>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-white/60 rounded-xl p-2.5 md:p-3 text-[11px] md:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
                    maxLength={50}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newReview.email}
                    onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                    className="w-full bg-white/60 rounded-xl p-2.5 md:p-3 text-[11px] md:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div className="bg-white/60 rounded-xl p-2.5 md:p-3 border border-white flex justify-between items-center shadow-xs">
                  <label className="text-[11px] md:text-[13px] font-bold text-gray-600">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 md:h-5 md:w-5 cursor-pointer transition-transform hover:scale-110 ${
                          newReview.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                      />
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Tell us what you love..."
                  value={newReview.reviewText}
                  onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                  className="w-full bg-white/60 rounded-xl p-2.5 md:p-3 text-[11px] md:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  maxLength={1000}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#253A7B] text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-md hover:bg-[#1a2a5e] transition-all disabled:bg-gray-300 text-xs md:text-sm font-bold uppercase tracking-widest"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>

                <AnimatePresence>
                  {submitMessage && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`text-[10px] md:text-[12px] text-center font-bold p-2.5 rounded-lg ${
                        submitMessage.includes('Thank you') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {submitMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
