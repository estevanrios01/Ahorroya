'use client';

import { SearchX, Heart, Package, WifiOff, AlertTriangle, ShoppingBag } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: 'search' | 'favorites' | 'products' | 'offline' | 'error' | 'cart';
}

const icons = {
  search: <SearchX size={48} />,
  favorites: <Heart size={48} />,
  products: <Package size={48} />,
  offline: <WifiOff size={48} />,
  error: <AlertTriangle size={48} />,
  cart: <ShoppingBag size={48} />,
};

export function EmptyState({ icon, title, description, action, variant = 'search' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <div className="text-zinc-600 mb-4">
        {icon || icons[variant]}
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 max-w-sm">{description}</p>}
      {action && (
        <Button variant="secondary" size="md" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
