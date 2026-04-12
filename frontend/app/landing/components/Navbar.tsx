"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Check if we're on the main landing page
  const isLandingPage = pathname === "/landing" || pathname === "/landing/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Navigate to section: if on landing page, scroll to hash; else navigate to /landing#hash
  const handleNavClick = (hash: string) => {
    if (isLandingPage) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/landing#${hash}`);
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 max-w-5xl transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-[150%]"
        }`}
    >
      <div
        className={`w-full bg-white/70 backdrop-blur-2xl border border-white/60 rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${scrolled
            ? "shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 bg-white/80"
            : "shadow-sm"
          }`}
      >
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2 shrink-0">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={32}
            height={32}
            unoptimized
            priority
          />
          <span className="text-xl font-bold tracking-tight text-[#253A7B]">
            FinoQz
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex flex-1 justify-center gap-1 items-center px-4">
          <button
            onClick={() => handleNavClick("home")}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("try-quiz")}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors"
          >
            Quizzes
          </button>
          <button
            onClick={() => handleNavClick("categories")}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick("roadmap")}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full transition-colors"
          >
            Whats New
          </button>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button
            asChild
            variant="ghost"
            className="rounded-full text-sm font-bold text-gray-600 hover:bg-black/5 hover:text-gray-900 px-5"
          >
            <Link href="/landing/auth/user_login/login">
              Login
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-[#253A7B] text-white hover:bg-[#1a2a5e] hover:shadow-md transition-all text-sm font-bold px-6"
          >
            <Link href="/landing/auth/user_signup/signup">
              Get Started
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 rounded-full hover:bg-black/10 transition-colors"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
          >
            {isOpen ? (
              <X size={20} strokeWidth={2.5} />
            ) : (
              <Menu size={20} strokeWidth={2.5} />
            )}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[115%] left-4 right-4 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-xl rounded-3xl p-4 flex flex-col gap-2 md:hidden"
          >
            <button
              onClick={() => handleNavClick("home")}
              className="px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-black/5 rounded-2xl transition-colors text-left"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("try-quiz")}
              className="px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-black/5 rounded-2xl transition-colors text-left"
            >
              Quizzes
            </button>
            <button
              onClick={() => handleNavClick("categories")}
              className="px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-black/5 rounded-2xl transition-colors text-left"
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick("roadmap")}
              className="px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-black/5 rounded-2xl transition-colors text-left"
            >
              Whats New
            </button>

            <div className="h-px bg-gray-100 my-2 w-full" />

            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-center px-4 py-5 text-sm font-bold text-gray-700 rounded-2xl hover:bg-black/5"
                onClick={toggleMenu}
              >
                <Link href="/landing/auth/user_login/login">
                  Login
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-center px-4 py-5 text-sm font-bold rounded-2xl bg-[#253A7B] text-white hover:bg-[#1a2a5e]"
                onClick={toggleMenu}
              >
                <Link href="/landing/auth/user_signup/signup">
                  Get Started
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
