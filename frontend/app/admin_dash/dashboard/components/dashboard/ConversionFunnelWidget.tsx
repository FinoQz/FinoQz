'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Users, BookOpen, DollarSign, TrendingDown } from 'lucide-react';

interface FunnelStepDef {
  label: string;
  key: keyof FunnelData;
  icon: React.ReactNode;
  bar: string;
  iconBg: string;
  iconColor: string;
}

interface FunnelData {
  landingVisits: number;
  signups: number;
  approvedUsers: number;
  paidEnrollments: number;
}

const STEPS: FunnelStepDef[] = [
  { label: 'Landing Visits', key: 'landingVisits', icon: <Users className="w-3.5 h-3.5" />, bar: 'bg-blue-400', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Signups', key: 'signups', icon: <ArrowRight className="w-3.5 h-3.5" />, bar: 'bg-indigo-400', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { label: 'Approved', key: 'approvedUsers', icon: <BookOpen className="w-3.5 h-3.5" />, bar: 'bg-emerald-400', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Paid', key: 'paidEnrollments', icon: <DollarSign className="w-3.5 h-3.5" />, bar: 'bg-violet-400', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
];

export default function ConversionFunnelWidget() {
  const [data, setData] = useState<FunnelData>({ landingVisits: 0, signups: 0, approvedUsers: 0, paidEnrollments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/conversion-funnel');
        setData({
          landingVisits: res.data.landingVisits || 0,
          signups: res.data.signups || 0,
          approvedUsers: res.data.approvedUsers || 0,
          paidEnrollments: res.data.paidEnrollments || 0,
        });
      } catch {
        // endpoint not yet wired — zeros are fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxVal = Math.max(...STEPS.map(s => data[s.key]), 1);
  const convRate = (from: number, to: number) =>
    from > 0 ? `${((to / from) * 100).toFixed(0)}%` : '—';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Conversion Funnel</h3>
          <p className="text-[10px] text-gray-400">Visit → paid journey</p>
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={`widget-funnel-skeleton-${i}`} className="flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-2.5 bg-gray-100 rounded w-20" />
                  <div className="h-2.5 bg-gray-100 rounded w-10" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full w-full" />
              </div>
            </div>
          ))
        ) : (
          STEPS.map((step, i) => {
            const val = data[step.key];
            const fillPct = Math.max((val / maxVal) * 100, 2);
            const rate = i > 0 ? convRate(data[STEPS[i - 1].key], val) : null;

            return (
              <div key={`widget-funnel-step-${step.label}`} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg ${step.iconBg} ${step.iconColor} flex items-center justify-center shrink-0`}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">{step.label}</span>
                    <div className="flex items-center gap-2">
                      {rate && <span className="text-[10px] text-gray-400 font-medium">{rate}</span>}
                      <span className="text-xs font-bold text-gray-800 tabular-nums">{val.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${step.bar} transition-all duration-700`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
