'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layout, 
  ListPlus,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  FileText,
  CreditCard,
  Layers,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySelection from './CategorySelection';
import PricingAccess from './PricingAccess';
import BasicSettings from './BasicSettings';
import UploadImport from './UploadImport';
import ScheduleVisibility from './ScheduleVisibility';
import MediaAdvanced from './MediaAdvanced';
import apiAdmin from '@/lib/apiAdmin';

interface CreateQuizFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface QuizData {
  categoryId: string;
  quizTitle: string;
  description: string;
  duration: string | number;
  totalMarks: string | number;
  attemptLimit: 'unlimited' | '1';
  shuffleQuestions: boolean;
  pricingType: 'free' | 'paid';
  price: string | number;
  offerCode?: string;
  questions: unknown[];
  postType: 'live' | 'scheduled';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  postingDate: string;
  postingTime: string;
  visibility: 'public' | 'private' | 'individual';
  assignedGroups: string[];
  assignedIndividuals: string[];
  bannerImage: string | null;
  featuredImage: string | null;
  showResults: boolean;
  showCorrectAnswers: boolean;
  certificateEnabled: boolean;
  difficultyLevel: string;
  status: 'draft' | 'published';
  broadcastEmail: boolean;
  sendEarlyAlertEmail: boolean;
};

export default function CreateQuizForm({ onClose, onSuccess }: CreateQuizFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<QuizData>({
    categoryId: '',
    quizTitle: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    attemptLimit: 'unlimited',
    shuffleQuestions: false,
    pricingType: 'free',
    price: 0,
    offerCode: '',
    questions: [],
    postType: 'live',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    postingDate: '',
    postingTime: '',
    visibility: 'public',
    assignedGroups: [],
    assignedIndividuals: [],
    bannerImage: null,
    featuredImage: null,
    showResults: true,
    showCorrectAnswers: true,
    certificateEnabled: false,
    difficultyLevel: 'medium',
    status: 'published',
    broadcastEmail: false,
    sendEarlyAlertEmail: false,
  });

  const steps = [
    { id: 1, label: 'Category', icon: Layers },
    { id: 2, label: 'Basics', icon: FileText },
    { id: 3, label: 'Pricing', icon: CreditCard },
    { id: 4, label: 'Questions', icon: Sparkles },
    { id: 5, label: 'Timeline', icon: Globe },
  ];

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !quizData.categoryId) {
      setError('Please select a category for the quiz.');
      return;
    }
    if (currentStep === 2) {
      if (!quizData.quizTitle) return setError('Title is required.');
      if (!quizData.duration || quizData.duration === 0) return setError('Duration must be greater than zero.');
    }
    if (currentStep === 3 && quizData.pricingType === 'paid' && (!quizData.price || Number(quizData.price) <= 0)) {
      return setError('Paid quizzes require a valid price.');
    }
    if (currentStep === 4 && quizData.questions.length === 0) {
      return setError('At least one question is required.');
    }

    if (currentStep < 5) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(currentStep - 1);
    }
  };

  const updateQuizData = (newData: Partial<QuizData>) => {
    setQuizData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    const isScheduled = quizData.postType === 'scheduled';
    if (!isDraft && isScheduled && (!quizData.startDate || !quizData.startTime)) {
      setLoading(false);
      return setError('Both date and time are required for scheduled quizzes.');
    }

    const toISO = (d: string, t: string) => {
      if (!d || !t) return null;
      try {
        const localDate = new Date(`${d}T${t}:00`);
        return isNaN(localDate.getTime()) ? null : localDate.toISOString();
      } catch {
        return null;
      }
    };

    const payload = {
      quizTitle: quizData.quizTitle,
      description: quizData.description,
      categoryId: quizData.categoryId,
      duration: Number(quizData.duration),
      totalMarks: Number(quizData.totalMarks),
      attemptLimit: quizData.attemptLimit,
      shuffleQuestions: quizData.shuffleQuestions,
      pricing: {
        type: quizData.pricingType,
        amount: quizData.pricingType === 'paid' ? Number(quizData.price) : 0,
        offerCode: quizData.offerCode,
      },
      questions: quizData.questions,
      visibility: quizData.visibility,
      groups: quizData.assignedGroups,
      individuals: quizData.assignedIndividuals,
      startAt: quizData.postType === 'live' ? new Date().toISOString() : toISO(quizData.startDate, quizData.startTime),
      endAt: toISO(quizData.endDate, quizData.endTime),
      scheduledAt: isScheduled ? (toISO(quizData.postingDate, quizData.postingTime) || toISO(quizData.startDate, quizData.startTime)) : new Date().toISOString(),
      schedule: isScheduled ? {
        startDate: quizData.startDate,
        startTime: quizData.startTime,
        endDate: quizData.endDate,
        endTime: quizData.endTime,
        postingDate: quizData.postingDate,
        postingTime: quizData.postingTime,
      } : null,
      media: {
        banner: quizData.bannerImage,
        featured: quizData.featuredImage,
      },
      settings: {
        showResults: quizData.showResults,
        showCorrectAnswers: quizData.showCorrectAnswers,
        certificateEnabled: false,
      },
      difficultyLevel: quizData.difficultyLevel,
      postType: quizData.postType,
      saveAsDraft: isDraft,
      broadcastEmail: quizData.broadcastEmail,
      sendEarlyAlertEmail: quizData.sendEarlyAlertEmail,
    };

    try {
      const response = await apiAdmin.post('/api/quizzes/admin/quizzes', payload);
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to create quiz.');
      }
    } catch (err: unknown) {
      type ApiErrorShape = {
        response?: {
          data?: {
            message?: string;
            validation?: {
              body?: {
                message?: string;
              };
            };
          };
        };
      };

      const apiError = err as ApiErrorShape;
      const serverError = apiError.response?.data?.message || apiError.response?.data?.validation?.body?.message;
      setError(serverError || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CategorySelection quizData={quizData} updateQuizData={updateQuizData} />;
      case 2:
        return <BasicSettings quizData={quizData} updateQuizData={updateQuizData} />;
      case 3:
        return <PricingAccess quizData={quizData} updateQuizData={updateQuizData} />;
      case 4:
        return <UploadImport quizData={quizData} updateQuizData={updateQuizData} />;
      case 5:
        return (
          <div className="space-y-12 pb-10">
            <ScheduleVisibility quizData={quizData} updateQuizData={updateQuizData} />
            <MediaAdvanced quizData={quizData} updateQuizData={updateQuizData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Full Screen Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#253A7B]/5 backdrop-blur-[3px] flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center border border-gray-100 max-w-xs w-full text-center"
            >
              <div className="w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#253A7B]/20 border-t-[#253A7B] animate-spin" />
                <Sparkles className="w-5 h-5 text-[#253A7B] ml-0.5 mt-0.5" />
              </div>
              <h3 className="text-[14px] font-bold text-gray-900 mb-1.5">Packaging Quiz</h3>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Securely syncing your parameters with the network. Please wait a moment.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Progress Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Create New Quiz</h2>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">Follow steps to configure and launch assessment</p>
          </div>

          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div className="flex p-1 bg-gray-50 rounded-lg border border-gray-100 min-w-max">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-semibold transition-all duration-300 whitespace-nowrap ${
                    currentStep === step.id
                      ? 'bg-white text-[#253A7B] shadow-sm'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-10 shadow-sm min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center sm:sticky sm:bottom-0 bg-white/95 backdrop-blur-sm py-4 gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-all border sm:border-transparent ${
              currentStep === 1
                ? 'opacity-0 pointer-events-none hidden sm:flex'
                : 'text-gray-500 border-gray-200 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md font-medium text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-200 sm:border-transparent"
            >
              Cancel Setup
            </button>
            
            {currentStep === 5 ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="w-full sm:w-auto justify-center px-6 py-2.5 bg-gray-50 text-[#253A7B] border border-gray-200 rounded-md font-medium text-sm hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="w-full sm:w-auto justify-center px-8 py-2.5 bg-[#253A7B] text-white rounded-md font-medium text-sm shadow-md hover:bg-[#1a2a5e] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Launch Quiz
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto justify-center px-8 py-2.5 bg-[#253A7B] text-white rounded-md font-medium text-sm shadow-md hover:bg-[#1a2a5e] transition-all flex items-center gap-2"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-red-600 text-white rounded-md text-xs font-semibold shadow-lg animate-in slide-in-from-top-4 z-50">
          {error}
        </div>
      )}
    </div>
  );
}
