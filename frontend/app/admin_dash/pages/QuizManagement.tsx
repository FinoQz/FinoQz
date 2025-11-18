'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, File } from 'lucide-react';
import CreateQuizButton from '../components/CreateQuizButton';
import QuizFilters from '../components/QuizFilters';
import QuizCard from '../components/QuizCard';
import StatusMessage from '../components/StatusMessage';
import CreateQuizForm from '../components/CreateQuizForm';
import ParticipantsDrawer from '../components/ParticipantsDrawer';

interface Quiz {
  _id: string;
  title: string;
  createdAt: string;
  duration: number;
  price: number;
  status: 'published' | 'draft';
  participantCount?: number;
}

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Dummy data for demonstration
  const dummyQuizzes: Quiz[] = [
    {
      _id: '1',
      title: 'Financial Literacy Basics',
      createdAt: '2025-01-15',
      duration: 45,
      price: 149,
      status: 'published',
      participantCount: 234
    },
    {
      _id: '2',
      title: 'Stock Market Fundamentals',
      createdAt: '2025-01-10',
      duration: 60,
      price: 299,
      status: 'published',
      participantCount: 189
    },
    {
      _id: '3',
      title: 'Cryptocurrency Basics',
      createdAt: '2025-01-05',
      duration: 30,
      price: 0,
      status: 'published',
      participantCount: 456
    },
    {
      _id: '4',
      title: 'Mutual Funds & SIP',
      createdAt: '2024-12-28',
      duration: 50,
      price: 199,
      status: 'draft',
      participantCount: 0
    },
    {
      _id: '5',
      title: 'Tax Planning Strategies',
      createdAt: '2024-12-20',
      duration: 40,
      price: 249,
      status: 'published',
      participantCount: 312
    },
    {
      _id: '6',
      title: 'Personal Budgeting 101',
      createdAt: '2024-12-15',
      duration: 35,
      price: 0,
      status: 'published',
      participantCount: 567
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setQuizzes(dummyQuizzes);
      setFilteredQuizzes(dummyQuizzes);
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleApplyFilters = () => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(quiz => quiz.status === selectedStatus);
    }

    setFilteredQuizzes(filtered);
  };

  const handleCreateQuiz = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleFormSuccess = () => {
    setActionStatus('Quiz created successfully!');
    setTimeout(() => setActionStatus(''), 3000);
    // Optionally refresh quizzes list
  };

  const handleViewParticipants = (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowParticipantsDrawer(true);
    }
  };

  // Show Create Form if active
  if (showCreateForm) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <CreateQuizForm onClose={handleFormClose} onSuccess={handleFormSuccess} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Quiz Management</h1>
        <CreateQuizButton onClick={handleCreateQuiz} />
      </div>

      {/* Status Message */}
      {actionStatus && <StatusMessage message={actionStatus} />}

      {/* Filters */}
      <QuizFilters
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onApply={handleApplyFilters}
      />

      {/* Quiz List Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        {/* Table Header - Desktop */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 pb-4 mb-4 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</div>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg font-medium">No quizzes found</div>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new quiz</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuizzes.map((quiz) => (
              <QuizCard 
                key={quiz._id} 
                quiz={quiz} 
                onViewParticipants={handleViewParticipants}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
            <div className="w-12 h-12 bg-[#253A7B]/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#253A7B]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Published</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {quizzes.filter(q => q.status === 'published').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Drafts</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                {quizzes.filter(q => q.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <File className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Participants Drawer */}
      {selectedQuiz && (
        <ParticipantsDrawer
          isOpen={showParticipantsDrawer}
          onClose={() => setShowParticipantsDrawer(false)}
          quizData={selectedQuiz}
        />
      )}
    </div>
  );
}
