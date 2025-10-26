"use client";

import { motion } from "framer-motion";
import { Heart, User } from "lucide-react";
import { communityPosts } from "../data/communityPosts";

export default function Community() {
  return (
    <section id="community" className="py-24 bg-gradient-to-br from-gray-100 via-white to-gray-50 relative overflow-hidden">
      {/* Background blur shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-300 opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-[#253A7B] mb-12">Community Insights</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {communityPosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#f0f4ff] to-[#e2e6f9] shadow-md hover:shadow-xl hover:ring-2 hover:ring-[#253A7B]/30 transition-all duration-300 cursor-pointer"
            >
              {/* User Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#253A7B] flex items-center justify-center shadow-md">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>

              <h3 className="font-semibold text-lg md:text-xl text-[#253A7B] mb-2">{post.title}</h3>
              <p className="text-gray-500 text-sm mb-4">by {post.author}</p>
              <div className="flex justify-center items-center gap-2 text-[#253A7B] font-medium">
                <Heart className="h-4 w-4 fill-[#253A7B] text-white" />
                {post.likes} Likes
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
