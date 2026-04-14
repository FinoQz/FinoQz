'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserCheck, CreditCard, IndianRupee, BookOpen, ChevronRight } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import UserListModal, { UserListType } from './UserListModal';

interface KPICardsProps {
  quizId: string;
  quizTitle?: string;
  pricingType?: 'free' | 'paid';
  visibility?: string;
}

interface Stats {
  registeredCount: number;
  enrolledCount: number;
  participatedCount: number;
  paidUsersCount: number;
  totalRevenue: number;
}

export default function KPICards({ quizId, quizTitle = 'Quiz', pricingType = 'free', visibility = 'public' }: KPICardsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<UserListType | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const isPaid = pricingType === 'paid';
        const requests: Promise<{ data: { total?: number; users?: unknown[]; participants?: unknown[]; paidUsers?: number; totalRevenue?: number } }>[] = [
          apiAdmin.get(`/api/analytics/quiz-registered-users?quizId=${quizId}`),
          apiAdmin.get(`/api/analytics/quiz-enrolled-users?quizId=${quizId}`),
          apiAdmin.get(`/api/analytics/quiz-participants?quizId=${quizId}`),
        ];
        if (isPaid) {
          requests.push(apiAdmin.get(`/api/analytics/quiz-paid-users?quizId=${quizId}`));
          requests.push(apiAdmin.get(`/api/analytics/quiz-revenue?quizId=${quizId}`));
        }
        const results = await Promise.allSettled(requests);
        const get = (i: number) => results[i]?.status === 'fulfilled' ? results[i].value.data : {};
        const reg = get(0);
        const enr = get(1);
        const par = get(2);
        const paid = isPaid ? get(3) : {};
        const rev = isPaid ? get(4) : {};
        setStats({
          registeredCount: Number(reg.total ?? (reg.users as unknown[])?.length ?? 0),
          enrolledCount: Number(enr.total ?? (enr.users as unknown[])?.length ?? 0),
          participatedCount: Number(par.total ?? (par.participants as unknown[])?.length ?? 0),
          paidUsersCount: Number(paid.paidUsers ?? 0),
          totalRevenue: Number(rev.totalRevenue ?? 0),
        });
      } catch (err) {
        console.error('KPICards fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [quizId, pricingType]);

  const isPaid = pricingType === 'paid';

  const visibilityLabel = () => {
    if (visibility === 'public') return 'All Platform Users';
    if (visibility === 'private') return 'Group Members';
    if (visibility === 'individual') return 'Assigned Individuals';
    return 'Users';
  };

  const cards = [
    {
      label: 'Registered',
      sublabel: visibilityLabel(),
      value: loading ? '—' : (stats?.registeredCount ?? 0).toLocaleString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      listType: 'registered' as UserListType,
      clickable: true,
    },
    {
      label: 'Enrolled',
      sublabel: isPaid ? 'Paid transactions' : 'Started quiz',
      value: loading ? '—' : (stats?.enrolledCount ?? 0).toLocaleString(),
      icon: BookOpen,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
      listType: 'enrolled' as UserListType,
      clickable: true,
    },
    {
      label: 'Participated',
      sublabel: 'Attempted quiz',
      value: loading ? '—' : (stats?.participatedCount ?? 0).toLocaleString(),
      icon: UserCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100',
      listType: 'participated' as UserListType,
      clickable: true,
    },
    ...(isPaid ? [
      {
        label: 'Paid Users',
        sublabel: 'Successful payments',
        value: loading ? '—' : (stats?.paidUsersCount ?? 0).toLocaleString(),
        icon: CreditCard,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-100',
        listType: 'paid' as UserListType,
        clickable: true,
      },
      {
        label: 'Revenue',
        sublabel: 'Total earned',
        value: loading ? '—' : `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`,
        icon: IndianRupee,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-100',
        listType: null,
        clickable: false,
      },
    ] : []),
  ];

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 ${isPaid ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3'}`}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => card.clickable && card.listType && setActiveModal(card.listType)}
              className={`bg-white rounded-xl p-5 border ${card.borderColor} shadow-sm transition-all group
                ${card.clickable ? 'cursor-pointer hover:shadow-md hover:border-opacity-80 hover:scale-[1.01]' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                </div>
                {card.clickable && (
                  <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5`} />
                )}
              </div>
              <p className={`text-2xl font-bold ${loading ? 'text-gray-300 animate-pulse' : 'text-gray-900'} mb-0.5`}>
                {card.value}
              </p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.sublabel}</p>
            </div>
          );
        })}
      </div>

      {activeModal && (
        <UserListModal
          quizId={quizId}
          quizTitle={quizTitle}
          listType={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
