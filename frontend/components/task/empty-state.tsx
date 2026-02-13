import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';

type EmptyStateProps = {
  onRefresh?: () => void;
  onAddTask?: () => void;
};

export function EmptyState({ onRefresh, onAddTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Get started by creating your first task. Your completed tasks will also appear here.
      </p>
      <div className="flex gap-3">
        <Button onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Task
        </Button>
      </div>
    </div>
  );
}