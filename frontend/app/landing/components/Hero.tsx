"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import logo from "@/public/finoqz.svg";
import banner from "@/public/banner.svg";
import { useRouter } from "next/navigation";


export default function Hero() {
  const router = useRouter();

  return (

    <section
      id="home"
      className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
    >
      <div className="container mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 mb-6">
            <Image src={logo} alt="FinoQz Logo" width={52} height={52} />
            <span className="text-[2rem] md:text-[2.25rem] font-semibold text-[#253A7B] tracking-wide">
              FinoQz
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-lg md:text-2xl font-medium text-gray-700 mb-4">
            Where Smart Finance Learning Becomes a Daily Habit
          </h2>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
            Master finance through interactive quizzes, earn certificates, and grow with a thriving community.
          </p>

          {/* Buttons Row */}
          <div className="flex flex-wrap gap-4 mb-8">
            <a href="#TryQuiz">
              <Button className="rounded-md px-4 py-2 text-sm md:text-base md:px-6 md:py-3 bg-[#253A7B] hover:bg-blue-700 text-white">
                Try Free Quiz
                <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </a>

            <Button
              variant="outline"
              className="rounded-md px-4 py-2 text-sm md:text-base md:px-6 md:py-3 border border-[#253A7B]"
              onClick={() => router.push("/landing/login")}
            >
              Login
            </Button>


          </div>

          {/* Stats Row */}
          <div className="flex flex-row flex-wrap md:flex-nowrap justify-start md:justify-normal gap-6 sm:gap-8">
            <Stat value="100+" label="Active Learners" />
            <Stat value="25+" label="Expert Quizzes" />
            <Stat value="95%" label="Success Rate" />
          </div>
        </motion.div>

        {/* Right Graphic */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-gray-100 hover:shadow-blue-100 transition">
            <Image src={banner} alt="Hero Graphic" className="object-contain w-full h-64" />
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-blue-400 to-purple-400 blur-3xl opacity-30 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="min-w-[80px]">
    <p className="text-base md:text-2xl font-bold text-[#253A7B]">{value}</p>
    <p className="text-xs md:text-sm text-gray-500">{label}</p>
  </div>
);
