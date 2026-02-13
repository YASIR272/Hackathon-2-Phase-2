'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Task, Priority } from '@/types';

const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }).max(100, { message: 'Title must be less than 100 characters.' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters.' }).optional(),
  priority: z.enum(['low', 'normal', 'high']),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
  task?: Task;
  onSubmitSuccess?: () => void;
};

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ task, onSubmitSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'normal',
      dueDate: formatDateForInput(task?.dueDate),
    },
  });

  async function onSubmit(values: TaskFormValues) {
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        due_date: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      };

      if (isEditing && task) {
        // Update existing task
        await apiClient.put(`/api/{user_id}/tasks/${task.id}`, payload);

        toast({
          title: 'Success',
          description: 'Task updated successfully!',
        });
      } else {
        // Create new task
        await apiClient.post('/api/{user_id}/tasks', payload);

        toast({
          title: 'Success',
          description: 'Task created successfully!',
        });
      }

      form.reset();

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Task save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save task',
        variant: 'destructive',
      });
    }
  }

  // Character counter helper
  const titleLength = form.watch('title')?.length || 0;
  const descriptionLength = form.watch('description')?.length || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="What needs to be done?"
                    {...field}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {titleLength}/100
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Add more details..."
                    className="resize-none pr-16"
                    rows={3}
                    {...field}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                    {descriptionLength}/500
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="block"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Task' : 'Create Task')}
        </Button>
      </form>
    </Form>
  );
}
