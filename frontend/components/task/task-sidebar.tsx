'use client';

import { useState, useMemo } from 'react';
import { Task, TaskFilterStatus } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { PriorityBadge } from './priority-badge';

type TaskSidebarProps = {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: number | null;
};

const filterTabs: { value: TaskFilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function TaskSidebar({ tasks, onTaskClick, selectedTaskId }: TaskSidebarProps) {
  const [filter, setFilter] = useState<TaskFilterStatus>('all');

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Task List</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {counts.pending} pending, {counts.completed} done
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'flex-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              filter === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {tab.label}
            <span className="ml-1 opacity-60">({counts[tab.value]})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No {filter === 'all' ? '' : filter} tasks
          </div>
        ) : (
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={cn(
                  'w-full p-3 text-left hover:bg-muted/50 transition-colors',
                  selectedTaskId === task.id && 'bg-muted',
                  task.completed && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-2">
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      task.completed && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} className="text-[10px] px-1.5 py-0" />
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
