'use client';

import React, { useEffect, useState } from 'react';
import { Check, BookOpen, Award, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';

type Reason = {
  id: string;
  title: string;
  description: string;
  bullets?: string[];
};

export default function AboutSection() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchReasons = async () => {
      try {
        const res = await api.get('/admin/landing');
        if (!mounted) return;
        const data = res.data || {};
        const remote: Reason[] = Array.isArray(data.reasons) ? data.reasons : [];
        setReasons(remote);
      } catch (err) {
        console.error('Failed to fetch reasons', err);
        setReasons([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReasons();
    return () => {
      mounted = false;
    };
  }, []);

  const icons = [BookOpen, Award, Users, BarChart3];

  return (
    <section
      id="about"
      className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#253A7B] mb-4">Why Choose FinoQz?</h2>
          <p className="text-xl text-gray-600">
            Transform your finance knowledge with our proven learning system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse h-56"
              />
            ))
          ) : reasons.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No reasons found. Please check back later.
            </p>
          ) : (
            reasons.map((reason, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Card
                  key={reason.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
                  <CardContent className="relative z-10 p-6 space-y-4">
                    <div className="bg-white/80 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-[#253A7B]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#253A7B]">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600">{reason.description}</p>
                    {Array.isArray(reason.bullets) && reason.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {reason.bullets.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
