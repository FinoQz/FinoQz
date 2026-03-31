'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ManagementSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          className="relative overflow-hidden bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm"
        >
          {/* Shimmer Effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent z-10"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar Skeleton */}
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              
              <div className="space-y-2">
                {/* Name Skeleton */}
                <div className="w-32 h-4 bg-gray-200 rounded" />
                {/* Email Skeleton */}
                <div className="w-48 h-3 bg-gray-100 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Badge Skeletons */}
              <div className="w-20 h-6 bg-gray-100 rounded-full" />
              <div className="w-20 h-6 bg-gray-100 rounded-full" />
              {/* Action Button Skeletons */}
              <div className="w-8 h-8 bg-gray-200 rounded-lg ml-2" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
