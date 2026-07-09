'use client';

import { motion } from 'framer-motion';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, title, subtitle, action, className = '', id }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`py-8 ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-end justify-between mb-6">
          <div>
            {title && <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>}
            {subtitle && <p className="text-zinc-500 mt-1 text-sm">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
