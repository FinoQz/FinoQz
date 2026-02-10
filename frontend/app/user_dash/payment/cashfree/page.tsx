'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiUser from '@/lib/apiUser';

function CashfreeCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verifying payment...');
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = searchParams?.get('order_id') || searchParams?.get('orderId');
    const quizId = searchParams?.get('quizId');

    if (!orderId) {
      setError('Order ID missing.');
      return;
    }

    const verify = async () => {
      try {
        await apiUser.post('/api/transactions/verify', {
          orderId,
          gatewayResponse: Object.fromEntries(searchParams?.entries() || [])
        });

        if (quizId) {
          await apiUser.post(`/api/quizzes/${quizId}/enroll`);
        }

        setMessage('Payment verified. Redirecting to your dashboard...');
        setTimeout(() => router.push('/user_dash'), 1500);
      } catch (err) {
        console.error('Payment verification failed:', err);
        setError('Payment verification failed. Please contact support.');
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <p className="text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function CashfreeCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    }>
      <CashfreeCallbackContent />
    </Suspense>
  );
}
