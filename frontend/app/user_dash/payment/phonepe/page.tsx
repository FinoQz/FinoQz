'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PhonePeCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verifying payment...');
  const [error, setError] = useState('');


  useEffect(() => {
    const transactionId = searchParams.get('transactionId');
    const quizId = searchParams.get('quizId');

    async function verifyPayment() {
      try {
        // Optionally, get transactionId from backend or PhonePe callback
        if (!transactionId) {
          setError('Transaction ID missing.');
          return;
        }
        const res = await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('Payment successful! Redirecting...');
          setTimeout(() => {
            router.push(`/user_dash/pages/MyQuizes`);
          }, 1500);
        } else {
          setError(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setError('Payment verification failed.');
      }
    }

    if (transactionId) verifyPayment();
    else setError('Transaction ID missing.');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">PhonePe Payment</h2>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-blue-700">{message}</p>
        )}
      </div>
    </div>
  );
}