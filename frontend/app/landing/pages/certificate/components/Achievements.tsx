"use client";

import Image from "next/image";

const achievers = [
  {
    name: "Riya Sharma",
    review: "FinoQz helped me crack my finance interviews. The quizzes were spot on!",
    photo: "/achievers/riya.jpg",
  },
  {
    name: "Aman Verma",
    review: "I earned my first certificate and shared it on LinkedIn. Got noticed!",
    photo: "/achievers/aman.jpg",
  },
  {
    name: "Sneha Patel",
    review: "The badges and certificates kept me motivated throughout.",
    photo: "/achievers/sneha.jpg",
  },
];

export default function Achievements() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-[#253A7B] mb-6 text-center">Learner Achievements</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {achievers.map((user, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow text-center">
            <Image
              src={user.photo}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-[#253A7B]">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-2 italic">“{user.review}”</p>
          </div>
        ))}
      </div>
    </div>
  );
}
