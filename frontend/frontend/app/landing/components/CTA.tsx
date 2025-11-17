"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function CTA() {
  const router = useRouter();


  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#f8faff] via-[#cddaff] to-[#3249b0] text-[#253A7B] text-center">

      {/* Radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08),_transparent)] pointer-events-none z-0" />

      {/* Animated floating blur shapes */}
      <motion.div
        initial={{ x: -100, opacity: 0.2 }}
        animate={{ x: [0, 30, -30, 0], opacity: [0.2, 0.3, 0.2, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20"
      />
      <motion.div
        initial={{ y: 100, opacity: 0.2 }}
        animate={{ y: [0, -40, 40, 0], opacity: [0.2, 0.3, 0.2, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl opacity-20"
      />

      {/* Main CTA Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 container mx-auto px-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Finance Knowledge?
        </h2>
        <p className="text-base md:text-lg mb-8 text-[#3b4db3]">
          Join thousands of learners mastering finance daily.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-[#253A7B] text-white hover:bg-[#1e2a78] transition duration-300 font-semibold"
            onClick={() => router.push("/landing/signup")}
          >
            Start Free Today
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border border-[#253A7B] text-[#253A7B] hover:bg-[#253A7B] hover:text-white transition duration-300 font-semibold"
            onClick={() => router.push("/landing/login")}
          >
            Login
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
