'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiAdmin from '@/lib/apiAdmin';

interface Stat {
  value: string;
  label: string;
}

interface HeroData {
  heading: string;
  tagline: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  stats?: Stat[];
}

export default function Hero() {
  const router = useRouter();
  const [hero, setHero] = useState<HeroData | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await apiAdmin.get('api/admin/landing', {
          headers: {
            'Cache-Control': 'no-store',
          },
        });
        setHero(res.data?.hero || null);
      } catch (err) {
        console.error('Failed to fetch hero data', err);
      }
    };

    fetchHero();
  }, []);


  const handleCTAClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const id = link.slice(1);
      let element = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
      if (!element) {
        const all = Array.from(document.querySelectorAll<HTMLElement>('[id]'));
        element = all.find((el) => el.id.toLowerCase() === id.toLowerCase()) ?? null;
      }
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push(link);
    }
  };

  if (!hero) return null;

  const stats = hero?.stats ?? [];

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
          <div className="flex items-center gap-3 mb-6">
            <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={52} height={52} unoptimized priority style={{ height: 'auto' }} />
            <span className="text-[2rem] md:text-[2.25rem] font-semibold text-[#253A7B] tracking-wide">
              FinoQz
            </span>
          </div>

          <h2 className="text-lg md:text-2xl font-medium text-gray-700 mb-4">{hero.heading}</h2>

          <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
            {hero.tagline}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={() => handleCTAClick(hero.buttonLink)}
              className="rounded-md px-4 py-2 text-sm md:text-base md:px-6 md:py-3 bg-[#253A7B] hover:bg-blue-700 text-white"
            >
              {hero.buttonText}
              <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>

            <Button
              variant="outline"
              className="rounded-md px-4 py-2 text-sm md:text-base md:px-6 md:py-3 border border-[#253A7B]"
              onClick={() => router.push('/landing/auth/user_login/login')}
            >
              Login
            </Button>
          </div>

          {stats.length > 0 && (
            <div className="flex flex-row flex-wrap md:flex-nowrap justify-start md:justify-normal gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <Stat key={index} value={stat.value} label={stat.label} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Graphic */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-gray-100 hover:shadow-blue-100 transition">
            {hero.imageUrl ? (
              <Image
                src={hero.imageUrl}
                alt="Hero Graphic"
                width={600}
                height={300}
                className="object-contain w-full h-64"
                unoptimized
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                FinoQz
              </div>
            )}
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
