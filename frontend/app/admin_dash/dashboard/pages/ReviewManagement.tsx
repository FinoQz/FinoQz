'use client';

import React, { useState, useEffect } from 'react';
import { Star, Search, Filter, ThumbsUp, ThumbsDown, Trash2, Pin, Check, X } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Review {
  _id: string;
  name: string;
  email?: string;
  rating: number;
  reviewText: string;
  isPinned: boolean;
  isApproved: boolean;
  createdAt: string;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [filter, searchQuery, currentPage]);

  const fetchReviews = async () => {
    try {
      const response = await apiAdmin.get('/api/reviews/admin/all', {
        params: {
          filter: filter !== 'all' ? filter : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 20
        }
      });
      
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/reviews/admin/${id}/pin`);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update review');
    }
  };

  const handleToggleApprove = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/reviews/admin/${id}/approve`);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling approve:', error);
      alert('Failed to update review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await apiAdmin.delete(`/api/reviews/admin/${id}`);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Review Management</h1>
        <p className="text-gray-600 mt-2">Manage user reviews and testimonials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
          <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.isApproved).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {reviews.filter(r => !r.isApproved).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Pinned</div>
          <div className="text-3xl font-bold text-blue-600">
            {reviews.filter(r => r.isPinned).length}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or review text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('pinned')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pinned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pinned
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No reviews found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{review.name}</div>
                        {review.email && (
                          <div className="text-sm text-gray-500">{review.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md line-clamp-2">
                        {review.reviewText}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {review.isApproved && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Approved
                          </span>
                        )}
                        {!review.isApproved && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        )}
                        {review.isPinned && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Pinned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePin(review._id)}
                          className={`p-2 rounded-lg transition ${
                            review.isPinned
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={review.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleApprove(review._id)}
                          className={`p-2 rounded-lg transition ${
                            review.isApproved
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                          title={review.isApproved ? 'Unapprove' : 'Approve'}
                        >
                          {review.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
