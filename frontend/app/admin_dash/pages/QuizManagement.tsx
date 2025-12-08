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
  quizTitle: string;   // ✅ backend field is quizTitle
  description: string;
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

  // ✅ Fetch quizzes from backend
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/quizzes/quizzes');
      const result = await res.json();

      const quizzesArray = Array.isArray(result.data) ? result.data : result;
      setQuizzes(quizzesArray);
      setFilteredQuizzes(quizzesArray);
    } catch (err) {
      console.error('❌ Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleStatusChange = (status: string) => setSelectedStatus(status);

  const handleApplyFilters = () => {
    let filtered = [...quizzes];
    if (searchQuery.trim()) {
      filtered = filtered.filter(q =>
        q.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(q => q.status === selectedStatus);
    }
    setFilteredQuizzes(filtered);
  };

  const handleCreateQuiz = () => setShowCreateForm(true);
  const handleFormClose = () => setShowCreateForm(false);

  const handleFormSuccess = async () => {
    setActionStatus('Quiz created successfully!');
    setTimeout(() => setActionStatus(''), 3000);
    await fetchQuizzes(); // ✅ refresh list after create
  };

  const handleViewParticipants = (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowParticipantsDrawer(true);
    }
  };

  // ✅ Enroll user in quiz
  const handleEnroll = async (quizId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/enroll`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setActionStatus('Enrolled successfully!');
        setTimeout(() => setActionStatus(''), 3000);
        // update participant count locally
        setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, participantCount: data.participantCount } : q));
        setFilteredQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, participantCount: data.participantCount } : q));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Enroll error:', err);
    }
  };

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

      {actionStatus && <StatusMessage message={actionStatus} />}

      <QuizFilters
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onApply={handleApplyFilters}
      />

      {/* Quiz List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 pb-4 mb-4 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</div>
        </div>

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
                onEnroll={() => handleEnroll(quiz._id)} // ✅ pass enroll handler
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
