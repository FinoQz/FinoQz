import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface QuizStat {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  avgPercentage: number;
}

interface QuizPerformanceChartsProps {
  data: QuizStat[];
}

export default function QuizPerformanceCharts({ data }: QuizPerformanceChartsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const maxAttempts = Math.max(...data.map(d => d.totalAttempts), 1);
  // Optional: Take only top 5-6 for the chart so it doesn't get squished
  const chartData = data.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Total Attempts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-700">Top Quizzes by Attempts</h3>
        </div>

        <div className="relative h-64">
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
            <span>{maxAttempts}</span>
            <span>{Math.round(maxAttempts * 0.5)}</span>
            <span>0</span>
          </div>

          <div className="absolute left-14 right-0 top-0 bottom-8">
            <div className="h-full flex items-end justify-around gap-2">
              {chartData.map((item, index) => {
                const height = (item.totalAttempts / maxAttempts) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group w-full">
                    <div className="w-full relative h-full flex items-end justify-center">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {item.quizTitle}: {item.totalAttempts} attempts
                        </div>
                      </div>
                      <div
                        className="w-4/5 max-w-[40px] bg-[#253A7B] rounded-t transition-all duration-300 hover:bg-[#1a2a5e]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute left-14 right-0 bottom-0 flex justify-around text-[10px] text-gray-500 text-center">
            {chartData.map((item, index) => (
              <span key={index} className="flex-1 px-1 truncate" title={item.quizTitle}>
                {item.quizTitle.length > 12 ? item.quizTitle.substring(0, 10) + '...' : item.quizTitle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 2: Average Scores */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-700">Average Score % by Quiz</h3>
        </div>

        <div className="relative h-64">
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>

          <div className="absolute left-14 right-0 top-0 bottom-8">
            <div className="h-full flex items-end justify-around gap-2">
              {chartData.map((item, index) => {
                const height = item.avgPercentage;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group w-full">
                    <div className="w-full relative h-full flex items-end justify-center">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {item.quizTitle}: {item.avgPercentage}%
                        </div>
                      </div>
                      <div
                        className="w-4/5 max-w-[40px] bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute left-14 right-0 bottom-0 flex justify-around text-[10px] text-gray-500 text-center">
            {chartData.map((item, index) => (
              <span key={index} className="flex-1 px-1 truncate" title={item.quizTitle}>
                {item.quizTitle.length > 12 ? item.quizTitle.substring(0, 10) + '...' : item.quizTitle}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
