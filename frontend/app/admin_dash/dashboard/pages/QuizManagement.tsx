'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, File, Loader2, Clock } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import CreateQuizButton from '../components/quiz_management/CreateQuizButton';
import QuizFilters from '../components/quiz_management/QuizFilters';
import QuizCard from '../components/quiz_management/QuizCard';
import AdminQuizPreviewModal from '../components/quiz_management/AdminQuizPreviewModal';
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
  status: 'published' | 'draft' | 'scheduled';
  startAt?: string;
  endAt?: string;
  scheduledAt?: string;
  enrolledCount?: number;
  participantCount?: number;
  totalMarks?: number;
  attemptLimit?: string;
  difficultyLevel?: string;
  category?: string;
  categoryName?: string;
  shuffleQuestions?: boolean;
  visibility?: string;
  assignedGroups?: string[];
  assignedIndividuals?: string[];
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
  explanation?: string;
  marks?: number;
  type?: string;
  [key: string]: unknown;
}

interface Category {
  _id: string;
  name: string;
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
  const [selectedPricing, setSelectedPricing] = useState('all');
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
      const [quizRes, categoryRes] = await Promise.all([
        apiAdmin.get(QUIZZES_API),
        apiAdmin.get('/api/categories').catch(() => ({ data: [] })),
      ]);

      const quizResult: ApiResponse = quizRes.data;
      const quizzesArray = Array.isArray(quizResult.data) ? quizResult.data : [];

      const rawCategories: unknown[] = Array.isArray(categoryRes.data?.data)
        ? categoryRes.data.data
        : Array.isArray(categoryRes.data)
          ? categoryRes.data
          : [];

      const categoryMap = rawCategories.reduce((acc: Record<string, string>, cat: unknown) => {
        if (!cat || typeof cat !== 'object') return acc;
        const item = cat as Category;
        if (typeof item._id === 'string' && typeof item.name === 'string') {
          acc[item._id] = item.name;
        }
        return acc;
      }, {} as Record<string, string>);

      const quizzesWithCategoryNames = quizzesArray.map((quiz) => ({
        ...quiz,
        categoryName:
          typeof quiz.category === 'string' && categoryMap[quiz.category]
            ? categoryMap[quiz.category]
            : quiz.category,
      }));

      setQuizzes(quizzesWithCategoryNames);
      setFilteredQuizzes(quizzesWithCategoryNames);
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
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(q => q.pricingType === selectedPricing);
    }
    setFilteredQuizzes(filtered);
  }, [searchQuery, selectedStatus, selectedPricing, quizzes]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleStatusChange = (status: string) => setSelectedStatus(status);
  const handlePricingChange = (pricing: string) => setSelectedPricing(pricing);

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


  if (showCreateForm) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <CreateQuizForm onClose={handleFormClose} onSuccess={handleFormSuccess} />
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Quiz Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Create and manage your assessments and quizzes</p>
        </div>
        <CreateQuizButton onClick={handleCreateQuiz} />
      </div>

      {actionStatus && <StatusMessage message={actionStatus} />}
      {error && <StatusMessage message={error} type="error" />}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Total Quizzes', value: quizzes.length, icon: FileText, color: 'text-blue-600' },
          { label: 'Published', value: quizzes.filter(q => q.status === 'published').length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Scheduled', value: quizzes.filter(q => q.status === 'scheduled').length, icon: Clock, color: 'text-amber-600' },
          { label: 'Drafts', value: quizzes.filter(q => q.status === 'draft').length, icon: File, color: 'text-gray-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-50 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <QuizFilters
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onPricingChange={handlePricingChange}
          />
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#253A7B] mb-4" />
              <p className="text-gray-500 text-sm font-medium">Loading quizzes...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No quizzes found</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your filters or create a new quiz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
            </div>
          )}
        </div>
      </div>

      {/* Modals & Overlays */}
      {showPreviewModal && quizToPreview && (
        <AdminQuizPreviewModal
          quizId={quizToPreview._id}
          quizTitle={quizToPreview.quizTitle}
          quizCategoryName={quizToPreview.categoryName || quizToPreview.category}
          onClose={() => {
            setShowPreviewModal(false);
            setQuizToPreview(null);
          }}
          onEditQuestion={handleEditQuestion}
        />
      )}

      {showQuestionEditModal && questionToEdit && questionEditData && (
        <EditQuestionModal
          isOpen={showQuestionEditModal}
          question={{
            _id: questionEditData._id,
            text: questionEditData.text || questionEditData.questionText || '',
            options: Array.isArray(questionEditData.options) ? questionEditData.options : [],
            correct: typeof questionEditData.correct === 'number' ? questionEditData.correct : 0,
            explanation: typeof questionEditData.explanation === 'string' ? questionEditData.explanation : '',
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
