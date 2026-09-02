import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../../utils';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'red' | 'gray';
}

interface SkeuoSearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export const SkeuoSearchableSelect: React.FC<SkeuoSearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search or select item...',
  required = false,
  error,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = options.find((o) => o.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.label.toLowerCase().includes(q) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
      o.value.toLowerCase().includes(q)
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      {label && (
        <label htmlFor={id} className="skeuo-label flex items-center justify-between">
          <span>{label} {required && <span className="text-amber-400">*</span>}</span>
          {selectedOption && (
            <span className="text-[10px] text-skeuo-gold font-mono font-normal">Selected</span>
          )}
        </label>
      )}

      {/* Main Select Button / Trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className={cn(
          'w-full rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer flex items-center justify-between gap-2',
          'bg-gradient-to-b from-[#22262f] to-[#1c2028] shadow-skeuo-inset',
          'border transition-all select-none',
          isOpen
            ? 'border-skeuo-gold/60 ring-2 ring-skeuo-gold/20'
            : error
            ? 'border-red-500/60'
            : 'border-white/08 hover:border-white/20',
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Search size={14} className="text-skeuo-gold/70 flex-shrink-0" />
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate min-w-0">
              {selectedOption.sublabel && (
                <span className="font-mono text-xs text-skeuo-gold font-bold px-1.5 py-0.5 rounded bg-skeuo-gold/10 border border-skeuo-gold/20 flex-shrink-0">
                  {selectedOption.sublabel}
                </span>
              )}
              <span className="text-gray-100 font-medium truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span
                  className={cn(
                    'text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-auto',
                    selectedOption.badgeColor === 'emerald' && 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                    selectedOption.badgeColor === 'amber' && 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
                    selectedOption.badgeColor === 'red' && 'bg-red-500/15 text-red-400 border border-red-500/30',
                    (!selectedOption.badgeColor || selectedOption.badgeColor === 'gray') && 'bg-white/10 text-gray-300'
                  )}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={cn('text-skeuo-gold/80 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </div>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          className="opacity-0 absolute bottom-0 left-0 w-0 h-0 pointer-events-none"
        />
      )}

      {/* Searchable Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl skeuo-panel border border-skeuo-gold/30 bg-[#1c2028]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-72"
          >
            {/* Search Bar Input */}
            <div className="p-2.5 border-b border-white/08 bg-black/40 flex items-center gap-2">
              <Search size={14} className="text-skeuo-gold/80 ml-1 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name, SKU, or keyword to search..."
                className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-gray-300 text-xs px-1.5 py-0.5 rounded bg-white/05"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-1 divide-y divide-white/04">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <motion.div
                      key={opt.value}
                      whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between gap-3 transition-colors',
                        isSelected ? 'bg-skeuo-gold/15 border border-skeuo-gold/30 text-skeuo-gold' : 'text-gray-200'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {opt.sublabel && (
                            <span className="font-mono text-[11px] font-bold text-skeuo-gold bg-skeuo-gold/10 px-1.5 py-0.5 rounded border border-skeuo-gold/20">
                              {opt.sublabel}
                            </span>
                          )}
                          <p className="text-xs font-semibold text-gray-100 truncate">{opt.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {opt.badge && (
                          <span
                            className={cn(
                              'text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full',
                              opt.badgeColor === 'emerald' && 'bg-emerald-500/20 text-emerald-300',
                              opt.badgeColor === 'amber' && 'bg-amber-500/20 text-amber-300',
                              opt.badgeColor === 'red' && 'bg-red-500/20 text-red-300',
                              (!opt.badgeColor || opt.badgeColor === 'gray') && 'bg-white/10 text-gray-400'
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-skeuo-gold" />}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-gray-500">
                  <p className="font-semibold text-gray-400 mb-0.5">No products found</p>
                  <p className="text-[11px]">Try searching with a different SKU or product name</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-red-400">⚠ {error}</p>}
    </div>
  );
};
