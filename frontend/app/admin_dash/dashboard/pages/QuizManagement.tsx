'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, File } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import CreateQuizButton from '../components/quiz_management/CreateQuizButton';
import QuizFilters from '../components/quiz_management/QuizFilters';
import QuizCard from '../components/quiz_management/QuizCard';
import AdminQuizPreviewModal from '../components/quiz_management/AdminQuizPreviewModal';
// You may want to create a QuizPreviewModal component for full quiz preview
import StatusMessage from '../components/quiz_management/StatusMessage';
import CreateQuizForm from '../components/quiz_management/CreateQuizForm';
import ParticipantsDrawer from '../components/quiz_management/ParticipantsDrawer';
import EditQuizModal from '../components/quiz_management/EditQuizModal';
import EditQuestionModal from '../components/quiz_management/EditQuestionModal';
import DeleteConfirmDialog from '../components/quiz_management/DeleteConfirmDialog';

interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  createdAt: string;
  duration: number;
  price: number;
  pricingType?: 'free' | 'paid';
  status: 'published' | 'draft';
  participantCount?: number;
  totalMarks?: number;
  attemptLimit?: string;
  difficultyLevel?: string;
  category?: string;
  visibility?: string;
}

interface ApiResponse {
  data: Quiz[];
  message?: string;
}

interface QuestionEditData {
  _id: string;
  questionText?: string;
  text: string;
  options: string[];
  correctAnswer?: string;
  correct: number | null;
  marks?: number;
  type?: string;
  [key: string]: unknown;
}

const QUIZZES_API = '/api/quizzes/admin/quizzes';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [quizToPreview, setQuizToPreview] = useState<Quiz | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<string | null>(null);
  const [showQuestionEditModal, setShowQuestionEditModal] = useState(false);
  const [questionEditData, setQuestionEditData] = useState<QuestionEditData | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdmin.get(QUIZZES_API);
      const result: ApiResponse = res.data;
      const quizzesArray = Array.isArray(result.data) ? result.data : [];
      setQuizzes(quizzesArray);
      setFilteredQuizzes(quizzesArray);
    } catch {
      setError('Failed to fetch quizzes');
      setQuizzes([]);
      setFilteredQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    let filtered = quizzes;
    if (searchQuery.trim()) {
      filtered = filtered.filter(q =>
        q.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(q => q.status === selectedStatus);
    }
    setFilteredQuizzes(filtered);
  }, [searchQuery, selectedStatus, quizzes]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleStatusChange = (status: string) => setSelectedStatus(status);

  const handleCreateQuiz = () => setShowCreateForm(true);
  const handleFormClose = () => setShowCreateForm(false);

  const handleFormSuccess = async () => {
    setActionStatus('Quiz created successfully!');
    setTimeout(() => setActionStatus(''), 3000);
    await fetchQuizzes();
  };

  const handleViewParticipants = (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowParticipantsDrawer(true);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setQuizToEdit(quiz);
    setShowEditModal(true);
  };

  const handleDelete = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteDialog(true);
  };


  // Preview handler
  const handlePreview = (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      setQuizToPreview(quiz);
      setShowPreviewModal(true);
    }
  };

  // Handler for editing a question from preview
  const handleEditQuestion = (questionId: string) => {
    setQuestionToEdit(questionId);
    setShowQuestionEditModal(true);
    // Fetch question data for editing
    apiAdmin.get(`/api/questions/questions/${questionId}`).then(res => {
      setQuestionEditData(res.data);
    });
  };

  const handleEditSuccess = async () => {
    setActionStatus('Quiz updated successfully!');
    setTimeout(() => setActionStatus(''), 3000);
    setShowEditModal(false);
    setQuizToEdit(null);
    await fetchQuizzes();
  };

  const handleDeleteSuccess = async () => {
    setActionStatus('Quiz deleted successfully!');
    setTimeout(() => setActionStatus(''), 3000);
    setShowDeleteDialog(false);
    setQuizToDelete(null);
    await fetchQuizzes();
  };

  const handleEnroll = async (quizId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdmin.post(`/api/quizzes/${quizId}/enroll`);
      const data = res.data;
      if (res.status >= 200 && res.status < 300) {
        setActionStatus('Enrolled successfully!');
        setTimeout(() => setActionStatus(''), 3000);
        setQuizzes(prev =>
          prev.map(q =>
            q._id === quizId ? { ...q, participantCount: data.participantCount } : q
          )
        );
        setFilteredQuizzes(prev =>
          prev.map(q =>
            q._id === quizId ? { ...q, participantCount: data.participantCount } : q
          )
        );
      } else {
        setError(data.message || 'Failed to enroll');
      }
    } catch {
      setError('Enroll error');
    } finally {
      setLoading(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Quiz Management</h1>
        <CreateQuizButton onClick={handleCreateQuiz} />
      </div>

      {actionStatus && <StatusMessage message={actionStatus} />}
      {error && <StatusMessage message={error} type="error" />}

      <QuizFilters
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onApply={() => {}}
      />

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-1 pb-4 mb-4 border-b border-gray-200">
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            ))}
                {/* Admin Quiz Preview Modal with all questions */}
                {showPreviewModal && quizToPreview && (
                  <AdminQuizPreviewModal
                    quizId={quizToPreview._id}
                    onClose={() => {
                      setShowPreviewModal(false);
                      setQuizToPreview(null);
                    }}
                    onEditQuestion={handleEditQuestion}
                  />
                )}

                {showQuestionEditModal && questionToEdit && questionEditData && (
                  <EditQuestionModal
                    question={{
                      ...questionEditData,
                      marks: questionEditData.marks ?? 0,
                      type: questionEditData.type ?? 'multiple-choice',
                    }}
                    onClose={() => {
                      setShowQuestionEditModal(false);
                      setQuestionToEdit(null);
                      setQuestionEditData(null);
                    }}
                    onSuccess={() => {
                      setShowQuestionEditModal(false);
                      setQuestionToEdit(null);
                      setQuestionEditData(null);
                      fetchQuizzes();
                    }}
                  />
                )}
          </div>
        )}
      </div>

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

      {selectedQuiz && (
        <ParticipantsDrawer
          isOpen={showParticipantsDrawer}
          onClose={() => setShowParticipantsDrawer(false)}
          quizData={selectedQuiz}
        />
      )}

      {showEditModal && quizToEdit && (
        <EditQuizModal
          quiz={{
            ...quizToEdit,
            totalMarks: quizToEdit.totalMarks ?? 0,
            pricingType: quizToEdit.pricingType ?? 'free',
            attemptLimit: quizToEdit.attemptLimit ?? '',
            difficultyLevel: quizToEdit.difficultyLevel ?? '',
            category: quizToEdit.category ?? '',
            visibility: quizToEdit.visibility ?? '',
          }}
          onClose={() => {
            setShowEditModal(false);
            setQuizToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteDialog && quizToDelete && (
        <DeleteConfirmDialog
          quiz={quizToDelete}
          onClose={() => {
            setShowDeleteDialog(false);
            setQuizToDelete(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
