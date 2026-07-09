'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'discount';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-zinc-800 text-zinc-300',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  discount: 'bg-rose-500/15 text-rose-400 border border-rose-500/25 font-bold',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium tracking-wide uppercase ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function DiscountBadge({ percent, className = '' }: { percent: number; className?: string }) {
  return (
    <Badge variant="discount" size="md" className={className}>
      -{percent}%
    </Badge>
  );
}
