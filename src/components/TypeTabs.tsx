import React from 'react';
import { ContentFilter, EraFilter } from '../types/tmdb';

interface TypeTabsProps {
  activeType: ContentFilter;
  onTypeChange: (type: ContentFilter) => void;
  activeEra: EraFilter;
  onEraChange: (era: EraFilter) => void;
}

const TYPE_OPTIONS: Array<{ id: ContentFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Web Series' },
];

const ERA_OPTIONS: Array<{ id: EraFilter; label: string; hint: string }> = [
  { id: 'all', label: 'All Eras', hint: 'Every release year' },
  { id: 'new', label: 'New', hint: 'Last 2 years' },
  { id: 'modern', label: 'Modern', hint: '2005 to now' },
  { id: 'classic', label: 'Classic', hint: 'Before 2005' },
];

export const TypeTabs: React.FC<TypeTabsProps> = ({
  activeType,
  onTypeChange,
  activeEra,
  onEraChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Content type"
        className="glass-surface inline-flex items-center gap-1 rounded-2xl p-1"
      >
        {TYPE_OPTIONS.map((tab) => {
          const active = activeType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTypeChange(tab.id)}
              className={`whitespace-nowrap shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'accent-gradient text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Era filter"
        className="glass-surface inline-flex items-center gap-1 rounded-2xl p-1 overflow-x-auto no-scrollbar max-w-full"
      >
        {ERA_OPTIONS.map((era) => {
          const active = activeEra === era.id;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onEraChange(era.id)}
              title={era.hint}
              className={`whitespace-nowrap shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                active
                  ? 'bg-white/20 text-white shadow-sm border border-white/20'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {era.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
