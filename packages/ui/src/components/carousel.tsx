'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselProps {
  children: React.ReactNode[];
  title?: string;
  className?: string;
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function Carousel({
  children,
  title,
  className = '',
  slidesToShow = 4,
  autoPlay = false,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const maxIndex = Math.max(0, children.length - slidesToShow);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, maxIndex]);

  function scrollTo(index: number) {
    setCurrentIndex(index);
    setCanScrollLeft(index > 0);
    setCanScrollRight(index < maxIndex);
  }

  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo(Math.max(0, currentIndex - 1))}
              disabled={!canScrollLeft}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollTo(Math.min(maxIndex, currentIndex + 1))}
              disabled={!canScrollRight}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
      <div ref={containerRef} className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${slidesToShow}, 1fr)` }}
          >
            {children.slice(currentIndex, currentIndex + slidesToShow).map((child, i) => (
              <div key={i}>{child}</div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {maxIndex > 0 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
