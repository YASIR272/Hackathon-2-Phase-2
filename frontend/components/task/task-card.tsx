'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2, SquarePen, Calendar } from 'lucide-react';
import { Task } from '@/types';
import { PriorityBadge } from '@/components/task/priority-badge';
import { DeleteConfirmDialog } from '@/components/task/delete-confirm-dialog';
import { apiClient } from '@/lib/api';

type TaskCardProps = {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      // Optimistically update the UI
      onToggleComplete(task.id);

      // Update on the server
      await apiClient.patch(`/api/{user_id}/tasks/${task.id}/complete`, {
        completed: !task.completed
      });
    } catch (error) {
      // If API call fails, revert the UI update
      onToggleComplete(task.id);
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/{user_id}/tasks/${task.id}`);
      onDelete(task.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`, className: 'text-red-500' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-500' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600 dark:text-yellow-500' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, className: 'text-muted-foreground' };
    } else {
      return { text: date.toLocaleDateString(), className: 'text-muted-foreground' };
    }
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <Card className={`rounded-lg border shadow-sm transition-all hover:shadow-md ${task.completed ? 'opacity-70' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                disabled={isLoading}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className={`text-base font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.description && (
                  <p className={`text-sm text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                )}
                {dueDateInfo && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${dueDateInfo.className}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{dueDateInfo.text}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-3 pt-0 border-t border-border/40 bg-muted/20 rounded-b-lg">
            <span className="text-xs text-muted-foreground">
              {new Date(task.updatedAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(task)}
                disabled={isLoading}
              >
                <SquarePen className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        taskTitle={task.title}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
