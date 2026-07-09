'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? { whileHover: { y: -2 }, transition: { duration: 0.2 } } : {};

  return (
    <Component
      className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl backdrop-blur-sm ${paddings[padding]} ${hover ? 'cursor-pointer' : ''} ${className}`}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-zinc-800 ${className}`}>{children}</div>;
}
