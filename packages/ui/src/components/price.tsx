'use client';

interface PriceProps {
  amount: number;
  oldAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPerUnit?: boolean;
  unit?: string;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function Price({ amount, oldAmount, size = 'lg', className = '', showPerUnit, unit }: PriceProps) {
  const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-bold text-zinc-100 ${sizes[size]}`}>{formatted}</span>
      {oldAmount && oldAmount > amount && (
        <>
          <span className="text-sm text-zinc-500 line-through">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(oldAmount)}
          </span>
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
            -{Math.round(((oldAmount - amount) / oldAmount) * 100)}%
          </span>
        </>
      )}
      {showPerUnit && unit && (
        <span className="text-xs text-zinc-500">/ {unit}</span>
      )}
    </div>
  );
}
