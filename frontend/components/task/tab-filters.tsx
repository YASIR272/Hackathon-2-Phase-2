'use client';

import { TaskFilterStatus } from '@/types';
import { cn } from '@/lib/utils';

type TabFiltersProps = {
  currentFilter: TaskFilterStatus;
  onFilterChange: (filter: TaskFilterStatus) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
  };
};

const filters: { value: TaskFilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function TabFilters({ currentFilter, onFilterChange, counts }: TabFiltersProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            currentFilter === filter.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {filter.label}
          <span
            className={cn(
              'ml-1.5 text-xs',
              currentFilter === filter.value
                ? 'text-foreground/70'
                : 'text-muted-foreground/70'
            )}
          >
            ({counts[filter.value]})
          </span>
        </button>
      ))}
    </div>
  );
}
