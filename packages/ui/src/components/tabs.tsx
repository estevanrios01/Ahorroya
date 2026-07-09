'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  children?: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, className = '', children }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || '');

  function handleSelect(id: string) {
    setActive(id);
    onChange?.(id);
  }

  return (
    <div className={className}>
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === tab.id ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            role="tab"
            aria-selected={active === tab.id}
          >
            {active === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-zinc-800 rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {children?.(active)}
    </div>
  );
}
