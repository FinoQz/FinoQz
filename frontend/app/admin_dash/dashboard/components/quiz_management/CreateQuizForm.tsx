'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye } from 'lucide-react';
import CategorySelection from './CategorySelection';
import PricingAccess from './PricingAccess';
import BasicSettings from './BasicSettings';
import UploadImport from './UploadImport';
import ScheduleVisibility from './ScheduleVisibility';
import MediaAdvanced from './MediaAdvanced';
import QuizPreview from './QuizPreview';
import apiAdmin from '@/lib/apiAdmin';

type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

interface CreateQuizFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateQuizForm({ onClose, onSuccess }: CreateQuizFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const quizId = '';
  const [cachedQuestions, setCachedQuestions] = useState<Question[]>([]);

  // Step 1: Category
  const [selectedCategory, setSelectedCategory] = useState('');

  // Step 2: Pricing
  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [coupon, setCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    visibility: 'all' | 'new_users' | 'existing_users';
  }>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    visibility: 'all',
  });
  // const [allowOfflinePayment, setAllowOfflinePayment] = useState(false);

  // Step 3: Basic Settings
  const [quizTitle, setQuizTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [attemptLimit, setAttemptLimit] = useState<'unlimited' | '1'>('1');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativePerWrong, setNegativePerWrong] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');

  // Step 4: Upload (managed internally by component)

  // Step 5: Schedule
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [postType, setPostType] = useState<'live' | 'scheduled'>('live'); // <-- Add this line
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [assignedGroups, setAssignedGroups] = useState<string[]>([]);

  // Step 6: Media & Advanced
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false); // Add this state

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== '';
      case 2:
        if (pricingType === 'paid') {
          return price !== '' && parseFloat(price) > 0;
        }
        return true;
      case 3:
        return quizTitle.trim() !== '' && description.trim() !== '' && duration !== '' && totalMarks !== '' && numberOfQuestions !== '';
      case 4:
        return true; // Upload is optional
      case 5:
        if (postType === 'scheduled') {
          if (visibility === 'private') {
            return (
              startDate &&
              startTime &&
              endDate &&
              endTime &&
              assignedGroups.length > 0
            );
          }
          return startDate && startTime && endDate && endTime;
        } else {
          // postType === 'live'
          if (visibility === 'private') {
            return assignedGroups.length > 0;
          }
          return true;
        }
      case 6:
        return true; // All optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };
  const handleSubmit = async () => {
    if (!selectedCategory) {
      alert('Please select a category.');
      return;
    }

    if (!quizTitle.trim() || quizTitle.trim().length < 3) {
      alert('Quiz title must be at least 3 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      alert('Description must be at least 10 characters.');
      return;
    }

    if (Number(duration) < 1 || Number(totalMarks) < 1 || Number(numberOfQuestions) < 1) {
      alert('Duration, total marks, and number of questions must be at least 1.');
      return;
    }

    if (pricingType === 'paid' && Number(price) < 1) {
      alert('For paid quizzes, price must be at least 1.');
      return;
    }

    const quizData = {
      category: selectedCategory,
      pricingType,
      price: pricingType === 'paid' ? Number(price) : 0,
      couponCode: coupon.code,
      // allowOfflinePayment,
      quizTitle,
      description,
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      attemptLimit,
      shuffleQuestions,
      negativeMarking,
      negativePerWrong: Number(negativePerWrong || 0),
      numberOfQuestions: Number(numberOfQuestions || 0),
      startDate,
      startTime,
      endDate,
      endTime,
      postType,
      visibility,
      assignedGroups,
      tags,
      difficultyLevel,
      coverImage: coverImagePreview,
      saveAsDraft
    };

    try {
      const res = await apiAdmin.post('/api/quizzes/admin/quizzes', quizData);
      const data = res.data;
      if (res.status >= 200 && res.status < 300) {
        const createdQuizId = data?.data?._id as string | undefined;
        if (createdQuizId && cachedQuestions.length > 0) {
          try {
            await apiAdmin.post('/api/upload/manual', {
              quizId: createdQuizId,
              questions: cachedQuestions
            });
          } catch (err) {
            console.error('❌ Error importing cached questions:', err);
            alert('Quiz created, but failed to import cached questions. You can retry from Upload/AI tab.');
          }
        }
        alert(`Quiz "${quizTitle}" ${saveAsDraft ? 'saved as draft' : 'created'} successfully!`);
        onSuccess?.(); // parent ko notify karega (QuizManagement me re-fetch)
        onClose();
      } else {
        alert(`Error: ${data?.message || 'Failed to create quiz'}`);
      }
    } catch (err: unknown) {
      console.error('❌ Error creating quiz:', err);

      const maybeResponse =
        err && typeof err === 'object'
          ? (err as { response?: { data?: { message?: string; error?: string; details?: unknown } } }).response
          : undefined;

      const message =
        maybeResponse?.data?.message ||
        maybeResponse?.data?.error ||
        'Server error creating quiz';

      alert(message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategorySelection
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        );
      case 2:
        return (
          <BasicSettings
            quizTitle={quizTitle}
            description={description}
            duration={duration}
            totalMarks={totalMarks}
            attemptLimit={attemptLimit}
            shuffleQuestions={shuffleQuestions}
            negativeMarking={negativeMarking}
            negativePerWrong={negativePerWrong}
            numberOfQuestions={numberOfQuestions}
            onQuizTitleChange={setQuizTitle}
            onDescriptionChange={setDescription}
            onDurationChange={setDuration}
            onTotalMarksChange={setTotalMarks}
            onAttemptLimitChange={setAttemptLimit}
            onShuffleQuestionsChange={setShuffleQuestions}
            onNegativeMarkingChange={setNegativeMarking}
            onNegativePerWrongChange={setNegativePerWrong}
            onNumberOfQuestionsChange={setNumberOfQuestions}
          />
        );
      case 3:
        return (
          <PricingAccess
            pricingType={pricingType}
            price={price}
            coupon={coupon}
            onPricingTypeChange={setPricingType}
            onPriceChange={setPrice}
            onCouponChange={setCoupon}
          />

        );
      case 4:
        return (
          <UploadImport
            quizId={quizId}
            numberOfQuestions={numberOfQuestions}
            onCacheQuestions={setCachedQuestions}
          />
        );
      case 5:
        return (
          <ScheduleVisibility
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            visibility={visibility}
            assignedGroups={assignedGroups}
            onStartDateChange={setStartDate}
            onStartTimeChange={setStartTime}
            onEndDateChange={setEndDate}
            onEndTimeChange={setEndTime}
            onVisibilityChange={setVisibility}
            onAssignedGroupsChange={setAssignedGroups}
            postType={postType} // <-- Pass postType
            onPostTypeChange={setPostType} // <-- Pass setter
          />
        );
      case 6:
        return (
          <MediaAdvanced
            coverImage={coverImage}
            coverImagePreview={coverImagePreview}
            tags={tags}
            difficultyLevel={difficultyLevel}
            saveAsDraft={saveAsDraft}
            onCoverImageChange={(file, preview) => {
              setCoverImage(file);
              setCoverImagePreview(preview);
            }}
            onTagsChange={setTags}
            onDifficultyLevelChange={setDifficultyLevel}
            onSaveAsDraftChange={setSaveAsDraft}
          />
        );
      default:
        return null;
    }
  };

  if (showSummary) {
    return (
      <div>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review Quiz Details</h2>
            <p className="text-sm text-gray-600">Please review your quiz before publishing</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Quiz Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600">Title:</span> <span className="font-medium">{quizTitle}</span></div>
                <div><span className="text-gray-600">Category:</span> <span className="font-medium">{selectedCategory}</span></div>
                <div><span className="text-gray-600">Duration:</span> <span className="font-medium">{duration} min</span></div>
                <div><span className="text-gray-600">Total Marks:</span> <span className="font-medium">{totalMarks}</span></div>
                <div><span className="text-gray-600">Pricing:</span> <span className="font-medium">{pricingType === 'free' ? 'Free' : `₹${price}`}</span></div>
                <div><span className="text-gray-600">Difficulty:</span> <span className="font-medium capitalize">{difficultyLevel}</span></div>
                <div><span className="text-gray-600">Visibility:</span> <span className="font-medium capitalize">{visibility}</span></div>
                <div><span className="text-gray-600">Status:</span> <span className="font-medium">{saveAsDraft ? 'Draft' : 'Published'}</span></div>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#253A7B] bg-opacity-10 text-[#253A7B] rounded-lg text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
              <div className="text-sm text-gray-700">
                <p>Starts: {startDate} at {startTime}</p>
                <p>Ends: {endDate} at {endTime}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSummary(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Edit Details
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {saveAsDraft ? 'Save as Draft' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Quiz Preview Modal */}
      {showPreview && (
        <QuizPreview
          quizData={{
            quizTitle,
            description,
            category: selectedCategory,
            duration,
            totalMarks,
            difficultyLevel,
            pricingType,
            price,
            attemptLimit,
            startDate,
            startTime,
            endDate,
            endTime,
            tags,
            coverImagePreview,
            negativeMarking,
            negativePerWrong
          }}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Step {currentStep} of {totalSteps}
            </h3>
            {currentStep === 6 && (
              <button
                onClick={handlePreview}
                className="text-sm text-[#253A7B] hover:underline flex items-center gap-1 transition"
              >
                <Eye className="w-4 h-4" />
                Preview as student
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${idx + 1 <= currentStep ? 'bg-[#253A7B]' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl transition font-medium flex items-center gap-2 ${canProceed()
              ? 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {currentStep === totalSteps ? (
              <>
                Review
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
