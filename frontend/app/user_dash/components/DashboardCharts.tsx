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
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

ChartJS.defaults.font.family = "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
ChartJS.defaults.font.weight = "normal";
ChartJS.defaults.color = "#94a3b8"; // Tailwind slate-400

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
        let url = '/api/quiz-attempts/user/all?status=submitted&limit=1000';
        const res = await apiUser.get(url);
        const attempts = res.data?.attempts || [];

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
        // Result mapping is complete.
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
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#253A7B',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Total Score',
        data: activity.map(a => a.score),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: '#1e2d62',
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 20,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)', // slate-200 very light
          drawBorder: false,
        },
        border: { display: false },
        ticks: { font: { size: 10 }, padding: 10 }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
        <h3 className="text-base sm:text-lg font-medium tracking-tight text-slate-800 mb-6">Activity Timeline</h3>
        <div className="h-64">
          {loading ? <div className="text-slate-400 text-sm h-full flex items-center justify-center">Loading chart data...</div> : error ? <div className="text-red-500 text-sm h-full flex items-center justify-center">{error}</div> : (
            <Line data={activityLineData} options={commonOptions} />
          )}
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
        <h3 className="text-base sm:text-lg font-medium tracking-tight text-slate-800 mb-6">Mastery Progress</h3>
        <div className="h-64">
          {loading ? <div className="text-slate-400 text-sm h-full flex items-center justify-center">Loading chart data...</div> : error ? <div className="text-red-500 text-sm h-full flex items-center justify-center">{error}</div> : (
            <Bar data={progressBarData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
          )}
        </div>
      </div>
    </div>
  );
}
