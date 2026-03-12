'use client';

import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import apiUser from '@/lib/apiUser';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface ActivityPoint {
  date: string;
  quizzes: number;
  score: number;
}

interface ProgressPoint {
  quizTitle: string;
  percentage: number;
}

interface QuizAttempt {
  createdAt: string;
  totalScore: number;
  percentage: number;
  quizId?: {
    quizTitle: string;
  };
}

interface DashboardChartsProps {
  userId?: string;
}

export default function DashboardCharts({ userId }: DashboardChartsProps) {
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [progress, setProgress] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch user quiz attempts
        // Always include userId for user-specific chart data
        let url = '/api/quiz-attempts/user/all?status=submitted';
        const resolvedUserId = userId || (typeof window !== 'undefined' ? window.localStorage.getItem('userId') : undefined);
        if (resolvedUserId) {
          url += `&userId=${resolvedUserId}`;
        }
        const res = await apiUser.get(url);
        const attempts = res.data?.attempts || [];

        // Fetch enrolled quizzes for user
        let enrolledQuizzes: { quizTitle: string; quizId: string }[] = [];
        try {
          let enrolledUrl = '/api/quiz/my-quizzes';
          if (resolvedUserId) enrolledUrl += `?userId=${resolvedUserId}`;
          const enrolledRes = await apiUser.get(enrolledUrl);
          enrolledQuizzes = (enrolledRes.data?.data || []).map((q: { quizTitle: string; _id: string }) => ({ quizTitle: q.quizTitle, quizId: q._id }));
        } catch {}

        // Activity chart: group by date
        const activityMap: Record<string, { quizzes: number; score: number }> = {};
        attempts.forEach((a: QuizAttempt) => {
          const date = new Date(a.createdAt).toLocaleDateString();
          if (!activityMap[date]) activityMap[date] = { quizzes: 0, score: 0 };
          activityMap[date].quizzes += 1;
          activityMap[date].score += a.totalScore || 0;
        });
        const activityData: ActivityPoint[] = Object.entries(activityMap).map(([date, val]) => ({ date, quizzes: val.quizzes, score: val.score }));

        // Progress chart: show all enrolled quizzes, progress 0 if no attempt
        const quizProgressMap: Record<string, { quizTitle: string; percentage: number }> = {};
        // Add attempts
        attempts.forEach((a: QuizAttempt) => {
          const quizTitle = a.quizId?.quizTitle;
          if (quizTitle) {
            if (!quizProgressMap[quizTitle] || (a.percentage > quizProgressMap[quizTitle].percentage)) {
              quizProgressMap[quizTitle] = { quizTitle, percentage: Math.round(a.percentage || 0) };
            }
          }
        });
        // Add enrolled quizzes with progress 0 if not attempted
        enrolledQuizzes.forEach((q) => {
          if (!quizProgressMap[q.quizTitle]) {
            quizProgressMap[q.quizTitle] = { quizTitle: q.quizTitle, percentage: 0 };
          }
        });
        const progressData: ProgressPoint[] = Object.values(quizProgressMap);
        setActivity(activityData);
        setProgress(progressData);
      } catch (err) {
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Line chart for activity
  const activityLineData = {
    labels: activity.map(a => a.date),
    datasets: [
      {
        label: 'Quizzes Attempted',
        data: activity.map(a => a.quizzes),
        borderColor: '#253A7B',
        backgroundColor: 'rgba(37,58,123,0.1)',
        tension: 0.4,
      },
      {
        label: 'Total Score',
        data: activity.map(a => a.score),
        borderColor: '#F59E42',
        backgroundColor: 'rgba(245,158,66,0.1)',
        tension: 0.4,
      }
    ]
  };

  // Bar chart for progress
  const progressBarData = {
    labels: progress.map(p => p.quizTitle),
    datasets: [
      {
        label: 'Score %',
        data: progress.map(p => p.percentage),
        backgroundColor: '#253A7B',
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
        {loading ? <div className="text-gray-400 text-sm">Loading chart...</div> : error ? <div className="text-red-600 text-sm">{error}</div> : (
          <Line data={activityLineData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        )}
      </div>
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Quiz Progress</h3>
        {loading ? <div className="text-gray-400 text-sm">Loading chart...</div> : error ? <div className="text-red-600 text-sm">{error}</div> : (
          <Bar data={progressBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        )}
      </div>
    </div>
  );
}
