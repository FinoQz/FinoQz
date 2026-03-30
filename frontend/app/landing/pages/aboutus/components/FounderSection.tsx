// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";

// export default function FounderSection() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 pb-12"
//     >
//       <div className="relative w-56 h-56 md:w-64 md:h-64 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition-transform duration-700 ease-out">
//         <Image
//           src="/founder4.jpeg"
//           alt="Siddhartha Singh"
//           fill
//           className="object-cover object-top"
//         />
//       </div>

//       <div className="flex-1 text-center md:text-left max-w-xl">
//         <h2 className="text-3xl font-bold text-[#253A7B] mb-1">Siddhartha Singh</h2>
//         <p className="text-sm text-blue-600 tracking-widest uppercase mb-6 font-semibold">Founder & CEO</p>
//         <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-serif italic border-l-4 border-blue-200 pl-6 md:pl-8 py-2">
//           Built by a professional with real-world experience in compliance, auditing, and investing — not just theory.
//         </p>
//       </div>
//     </motion.div>
//   );
// }
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FounderSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 pb-12"
    >
      <div
        className="relative w-56 h-56 md:w-64 md:h-64 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition-transform duration-700 ease-out"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={hovered ? "/founder2.jpg" : "/founder4.jpeg"}
          alt="Siddhartha Singh"
          fill
          className="object-cover object-top transition-all duration-500 ease-in-out"
        />
      </div>

      <div className="flex-1 text-center md:text-left max-w-xl">
        <h2 className="text-3xl font-bold text-[#253A7B] mb-1">Siddhartha Singh</h2>
        <p className="text-sm text-blue-600 tracking-widest uppercase mb-6 font-semibold">Founder & CEO</p>
        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-serif italic border-l-4 border-blue-200 pl-6 md:pl-8 py-2">
          Built by a professional with real-world experience in compliance, auditing, and investing — not just theory.
        </p>
      </div>
    </motion.div>
  );
}