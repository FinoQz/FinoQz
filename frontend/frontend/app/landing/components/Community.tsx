// "use client";

// import { motion } from "framer-motion";
// import { Heart, User } from "lucide-react";
// import { communityPosts } from "../data/communityPosts";

// export default function Community() {
//   return (
//     <section id="community" className="py-24 bg-gradient-to-br from-gray-100 via-white to-gray-50 relative overflow-hidden">
//       {/* Background blur shapes */}
//       <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-300 opacity-20 rounded-full blur-3xl" />

//       <div className="relative z-10 container mx-auto px-6 text-center">
//         <h2 className="text-4xl font-bold text-[#253A7B] mb-12">Community Insights</h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//           {communityPosts.map((post, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: i * 0.1 }}
//               className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#f0f4ff] to-[#e2e6f9] shadow-md hover:shadow-xl hover:ring-2 hover:ring-[#253A7B]/30 transition-all duration-300 cursor-pointer"
//             >
//               {/* User Icon */}
//               <div className="flex justify-center mb-4">
//                 <div className="w-14 h-14 rounded-full bg-[#253A7B] flex items-center justify-center shadow-md">
//                   <User className="h-7 w-7 text-white" />
//                 </div>
//               </div>

//               <h3 className="font-semibold text-lg md:text-xl text-[#253A7B] mb-2">{post.title}</h3>
//               <p className="text-gray-500 text-sm mb-4">by {post.author}</p>
//               <div className="flex justify-center items-center gap-2 text-[#253A7B] font-medium">
//                 <Heart className="h-4 w-4 fill-[#253A7B] text-white" />
//                 {post.likes} Likes
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
'use client';

import { motion } from 'framer-motion';
import { Heart, User, Star } from 'lucide-react';
import { communityPosts } from '../data/communityPosts';

const liveReviews = [
  { name: 'Aarav S.', rating: 5, comment: 'Amazing platform for finance learning!' },
  { name: 'Megha T.', rating: 4, comment: 'Quizzes are interactive and well-designed.' },
  { name: 'Rohit K.', rating: 5, comment: 'Loved the certification system!' },
];

export default function Community() {
  return (
    <section
      id="community"
      className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
    >
      {/* Background blur shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-300 opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-[#253A7B] mb-12 text-center">Community Insights</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Community Posts */}
          <div className="space-y-8">
            {communityPosts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#f0f4ff] to-[#e2e6f9] shadow-md hover:shadow-xl hover:ring-2 hover:ring-[#253A7B]/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#253A7B] flex items-center justify-center shadow-md">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#253A7B]">{post.title}</h3>
                    <p className="text-gray-500 text-sm">by {post.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#253A7B] font-medium">
                  <Heart className="h-4 w-4 fill-[#253A7B] text-white" />
                  {post.likes} Likes
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Live Reviews + Comment Box */}
          <div className="space-y-6">
            {/* Live Reviews */}
            <div className="space-y-4">
              {liveReviews.map((review, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[#253A7B] font-semibold">{review.name}</h4>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>

            {/* Comment Box */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h4 className="text-[#253A7B] font-semibold mb-2">Share your thoughts</h4>
              <textarea
                rows={4}
                placeholder="Write your comment..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
              />
              <button className="mt-4 bg-[#253A7B] text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
