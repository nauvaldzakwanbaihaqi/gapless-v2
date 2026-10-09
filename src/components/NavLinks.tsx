"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface NavLinksProps {
  authButton: React.ReactNode;
  variant?: 'light' | 'dark';
}


export function NavLinks({ authButton, variant = 'light' }: NavLinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isDark = variant === 'dark';

  const links = [
    { href: "/", label: "Home" },
    { href: "/roadmap", label: "Learning Roadmap" },
    { href: "/results", label: "Hasil Saya" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto w-full relative">
      
      {/* 1. Div Logo (Animasi dari Kiri ke Kanan) */}
      <motion.div 
        className="flex-1 flex justify-start"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img src="/Asset 1.png" alt="Gapless Explorer Logo" className="h-8 md:h-10 w-auto" />
          <span className={`font-bold text-xl md:text-2xl transition-colors ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Gapless
          </span>
        </Link>
      </motion.div>

      {/* 2. Div Links (Desktop) (Animasi dari Atas ke Bawah bergantian) */}
      <motion.div 
        className="hidden md:flex flex-1 justify-center items-center gap-7"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { 
              staggerChildren: 0.1, // Link turun satu per satu jeda 0.1s
              delayChildren: 0.2 // Nunggu logo jalan duluan
            }
          }
        }}
      >
        {links.map((link) => (
          <motion.div
            key={link.href}
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
          >
            <Link
              href={link.href}
              className={`text-[15px] whitespace-nowrap transition-colors ${
                pathname === link.href
                  ? isDark 
                    ? "text-white font-bold" 
                    : "text-slate-900 font-semibold"
                  : isDark 
                    ? "text-slate-300 hover:text-white font-normal" 
                    : "text-slate-700 hover:text-slate-900 font-normal"
              }`}
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Div Login & Mobile Toggle (Animasi Kanan ke Kiri + Blur) */}
      <motion.div 
        className="flex-1 flex justify-end items-center gap-2 md:gap-4"
        initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }} // Delay biar muncul paling akhir
      >
        {authButton}
        
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 focus:outline-none transition-colors ${
            isDark ? "text-slate-200 hover:text-white" : "text-slate-800 hover:text-slate-900"
          }`}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.line
              x1="4" y1="6" x2="20" y2="6"
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              style={{ originX: "50%", originY: "50%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.line
              x1="4" y1="12" x2="20" y2="12"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.line
              x1="4" y1="18" x2="20" y2="18"
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              style={{ originX: "50%", originY: "50%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </svg>
        </button>
      </motion.div>

      {/* Mobile Menu Dropdown (Efek Fade In sederhana saat diklik) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-4 md:hidden z-50 rounded-2xl shadow-xl ${
              isDark 
                ? "bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white" 
                : "bg-white border-b border-gray-100 text-slate-800"
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base transition-colors ${
                  pathname === link.href
                    ? isDark 
                      ? "text-blue-400 font-bold" 
                      : "text-slate-900 font-semibold"
                    : isDark 
                      ? "text-slate-300 hover:text-white" 
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}