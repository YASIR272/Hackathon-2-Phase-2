'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, TaskFilterStatus, Priority } from '@/types';
import { TaskCard } from '@/components/task/task-card';
import { TaskForm } from '@/components/task/task-form';
import { EmptyState } from '@/components/task/empty-state';
import { TabFilters } from '@/components/task/tab-filters';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth-client';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskFilterStatus>('all');
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    // Set up auth credentials when session is available
    if (session?.user) {
      // Generate a simple token for API calls (in production, use proper JWT from auth)
      const userId = session.user.id;
      // For demo purposes, create a simple base64 encoded token
      const token = btoa(JSON.stringify({ userId, sub: userId, exp: Date.now() + 86400000 }));
      apiClient.setCredentials(userId, token);
    }
    fetchTasks();
  }, [session]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/api/{user_id}/tasks');
      if (response.tasks) {
        // Map snake_case from API to camelCase for frontend
        const mappedTasks = response.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          userId: task.user_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          priority: (task.priority as Priority) || 'normal',
          dueDate: task.due_date,
        }));
        setTasks(mappedTasks);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      // Don't show error toast for 401 - user just needs to be authenticated
      if (!error.message?.includes('401')) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load tasks',
          variant: 'destructive',
        });
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));

    try {
      await apiClient.patch(`/api/{user_id}/tasks/${id}/complete`, {
        completed: !task.completed
      });
      toast({
        title: task.completed ? 'Task reopened' : 'Task completed!',
        description: task.title,
      });
    } catch (error) {
      // Revert on error
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, completed: task.completed } : t
      ));
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const taskToDelete = tasks.find(t => t.id === id);

    // Optimistic update
    setTasks(prev => prev.filter(task => task.id !== id));

    toast({
      title: 'Task deleted',
      description: taskToDelete?.title || 'Task has been removed',
    });
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchTasks(); // Refresh the task list
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Filter tasks based on current filter
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

  // Calculate counts for filters
  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0 && !showForm) {
    return <EmptyState onRefresh={fetchTasks} onAddTask={() => setShowForm(true)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {counts.pending} pending, {counts.completed} completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => { setEditingTask(null); setShowForm(!showForm); }}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm && !editingTask ? 'Cancel' : 'Add Task'}
          </Button>
        </div>
      </div>

      {/* Tab filters */}
      <TabFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      {/* Task form */}
      {showForm && (
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancelForm}>
              Cancel
            </Button>
          </div>
          <TaskForm
            task={editingTask || undefined}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      )}

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No {filter === 'all' ? '' : filter} tasks found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
