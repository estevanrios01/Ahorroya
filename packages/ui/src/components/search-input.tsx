'use client';

import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  recentSearches?: string[];
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar productos, marcas, categorías...',
  suggestions = [],
  onSuggestionClick,
  recentSearches = [],
}: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = 'search-input-options';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  }

  const showDropdown = focused && (value.length > 0 ? suggestions.length > 0 : recentSearches.length > 0);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-zinc-800/90 border border-zinc-700 rounded-2xl pl-12 pr-12 py-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
          aria-label="Buscar productos"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50"
            role="listbox"
            id={listboxId}
          >
            {value.length > 0 ? (
              suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onSuggestionClick?.(s); setFocused(false); }}
                  className="w-full text-left px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm"
                  role="option"
                  aria-selected="false"
                >
                  {s}
                </button>
              ))
            ) : (
              <>
                {recentSearches.length > 0 && (
                  <div className="px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">Recientes</div>
                )}
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange(s); onSubmit?.(); setFocused(false); }}
                    className="w-full text-left px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm"
                    role="option"
                    aria-selected="false"
                  >
                    {s}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
