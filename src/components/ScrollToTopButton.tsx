'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 pointer-events-none'
        }`}
    >
      <button
        onClick={scrollToTop}
        title="返回顶部"
        className={`
          group flex items-center justify-center
          h-14 w-14 rounded-full
          transition-all duration-300 ease-in-out
          shadow-xl hover:scale-110

          bg-black text-white hover:bg-neutral-800
          dark:bg-white dark:text-black dark:hover:bg-neutral-100
        `}
      >
        <ChevronUp className="w-7 h-7" />
      </button>
    </div>
  );
}
