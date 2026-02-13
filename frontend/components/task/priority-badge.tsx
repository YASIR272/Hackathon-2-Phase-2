'use client';

import { Priority } from '@/types';
import { cn } from '@/lib/utils';

type PriorityBadgeProps = {
  priority: Priority;
  className?: string;
};

const priorityConfig = {
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  normal: {
    label: 'Normal',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
