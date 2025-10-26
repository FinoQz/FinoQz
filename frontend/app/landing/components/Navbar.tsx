"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const router = useRouter(); 

  return (
    <nav className="sticky top-0 z-50 border-b bg-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} />
          <div>
            <span className="text-[1.25rem] font-semibold text-black tracking-wide">FinoQz</span>
            <p className="text-xs text-gray-600">Smart finance learning</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <a href="#home" className="hover:text-indigo-600 transition">Home</a>
          <a href="#about" className="hover:text-indigo-600 transition">Features</a>
          <a href="#categories" className="hover:text-indigo-600 transition">Quizzes</a>
          <a href="#community" className="hover:text-indigo-600 transition">Community</a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/landing/login")} 
            className="border border-black rounded-md"
          >
            Login
          </Button>
          <Button
            className="rounded-md"
            onClick={() => router.push("/landing/signup")} 
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-6 bg-white border-t border-gray-200">
          <div className="flex flex-col gap-2 text-gray-700 font-medium text-sm">
            <a href="#home" onClick={toggleMenu} className="block w-full px-3 py-2 rounded hover:bg-gray-100">Home</a>
            <a href="#about" onClick={toggleMenu} className="block w-full px-3 py-2 rounded hover:bg-gray-100">Features</a>
            <a href="#categories" onClick={toggleMenu} className="block w-full px-3 py-2 rounded hover:bg-gray-100">Quizzes</a>
            <a href="#community" onClick={toggleMenu} className="block w-full px-3 py-2 rounded hover:bg-gray-100">Community</a>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 border border-black text-sm rounded hover:bg-gray-100"
              onClick={() => { router.push("/landing/login"); toggleMenu(); }}
            >
              Login
            </Button>
            <Button
              className="w-full justify-start px-3 py-2 text-sm rounded hover:bg-indigo-600 hover:text-white"
              onClick={() => { router.push("/landing/signup"); toggleMenu(); }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
