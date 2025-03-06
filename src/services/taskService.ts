
import { supabase } from "@/integrations/supabase/client";
import { Task, Subtask } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// Convert local task object to database format
const prepareTaskForDatabase = (task: Task, position: number) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description || null,
    priority: task.priority,
    status: task.status === 'in-progress' ? 'in_progress' : task.status, // Adjust for database format
    completed: task.completed,
    due_date: task.dueDate ? new Date(task.dueDate) : null,
    position,
  };
};

// Convert database task to local format
const mapDatabaseTaskToLocal = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    completed: dbTask.completed,
    priority: dbTask.priority as 'low' | 'medium' | 'high',
    status: dbTask.status === 'in_progress' ? 'in-progress' : dbTask.status as 'todo' | 'completed',
    dueDate: dbTask.due_date ? dbTask.due_date : undefined,
    createdAt: dbTask.created_at,
    subtasks: [],
  };
};

// Convert local subtask to database format
const prepareSubtaskForDatabase = (subtask: Subtask, taskId: string) => {
  return {
    id: subtask.id,
    task_id: taskId,
    title: subtask.title,
    completed: subtask.completed,
  };
};

// Fetch all tasks from Supabase
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log("Fetching tasks from Supabase...");
    
    // Fetch tasks ordered by position
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true });
      
    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      toast.error("Failed to load tasks");
      return [];
    }
    
    console.log("Fetched tasks:", tasksData.length);
    
    // Fetch all subtasks
    const { data: subtasksData, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*');
      
    if (subtasksError) {
      console.error("Error fetching subtasks:", subtasksError);
      toast.error("Failed to load subtasks");
      return [];
    }
    
    console.log("Fetched subtasks:", subtasksData.length);
    
    // Map tasks to local format and include their subtasks
    const tasks = tasksData.map(dbTask => {
      const task = mapDatabaseTaskToLocal(dbTask);
      
      // Find subtasks for this task
      const taskSubtasks = subtasksData
        .filter(subtask => subtask.task_id === dbTask.id)
        .map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed
        }));
        
      // Add subtasks to task
      task.subtasks = taskSubtasks;
      
      return task;
    });
    
    console.log("Processed tasks with subtasks:", tasks.length);
    return tasks;
  } catch (error) {
    console.error("Unexpected error fetching tasks:", error);
    toast.error("Failed to load tasks");
    return [];
  }
};

// Save all tasks to Supabase with their current order
export const saveTasksOrder = async (tasks: Task[]): Promise<boolean> => {
  try {
    console.log("Saving task order to Supabase:", tasks.map(t => t.title));
    
    // Map each task to its new position
    const taskUpdates = tasks.map((task, index) => ({
      id: task.id,
      position: index
    }));
    
    // Update all tasks with new positions in a batch operation
    const { data, error } = await supabase
      .from('tasks')
      .upsert(taskUpdates, { onConflict: 'id' });
      
    if (error) {
      console.error("Error saving task order:", error);
      toast.error("Failed to save task order");
      return false;
    }
    
    console.log("Task order saved successfully:", data);
    return true;
  } catch (error) {
    console.error("Unexpected error saving task order:", error);
    toast.error("Failed to save task order");
    return false;
  }
};

// Create a new task in Supabase
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'status' | 'subtasks'>): Promise<Task | null> => {
  try {
    console.log("Creating new task:", task.title);
    
    // Get current task count to determine position
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error getting task count:", countError);
      toast.error("Failed to create task");
      return null;
    }
    
    const taskId = uuidv4();
    const position = count || 0;
    
    // Create the task
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        id: taskId,
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        status: 'todo',
        completed: false,
        due_date: task.dueDate ? new Date(task.dueDate) : null,
        position
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
      return null;
    }
    
    console.log("Task created successfully:", data);
    
    // Return the new task in local format
    return mapDatabaseTaskToLocal(data);
  } catch (error) {
    console.error("Unexpected error creating task:", error);
    toast.error("Failed to create task");
    return null;
  }
};

// Update a task in Supabase
export const updateTask = async (id: string, taskData: Partial<Task>): Promise<boolean> => {
  try {
    console.log("Updating task:", id, taskData);
    
    // Prepare data for database
    const updateData: any = {};
    
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description || null;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.status !== undefined) {
      updateData.status = taskData.status === 'in-progress' ? 'in_progress' : taskData.status;
    }
    if (taskData.completed !== undefined) updateData.completed = taskData.completed;
    if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate ? new Date(taskData.dueDate) : null;
    
    // Add updated timestamp
    updateData.updated_at = new Date();
    
    // Update the task
    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id);
      
    if (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      return false;
    }
    
    console.log("Task updated successfully:", id);
    return true;
  } catch (error) {
    console.error("Unexpected error updating task:", error);
    toast.error("Failed to update task");
    return false;
  }
};

// Delete a task from Supabase
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    console.log("Deleting task:", id);
    
    // Subtasks are deleted automatically due to CASCADE constraint
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      return false;
    }
    
    console.log("Task deleted successfully:", id);
    return true;
  } catch (error) {
    console.error("Unexpected error deleting task:", error);
    toast.error("Failed to delete task");
    return false;
  }
};

// Add a subtask to a task
export const addSubtask = async (taskId: string, title: string): Promise<Subtask | null> => {
  try {
    console.log("Adding subtask to task:", taskId, title);
    
    const subtaskId = uuidv4();
    
    // Insert the subtask
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{
        id: subtaskId,
        task_id: taskId,
        title,
        completed: false
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error adding subtask:", error);
      toast.error("Failed to add subtask");
      return null;
    }
    
    console.log("Subtask added successfully:", data);
    
    // Return the new subtask
    return {
      id: data.id,
      title: data.title,
      completed: data.completed
    };
  } catch (error) {
    console.error("Unexpected error adding subtask:", error);
    toast.error("Failed to add subtask");
    return null;
  }
};

// Update a subtask
export const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>): Promise<boolean> => {
  try {
    console.log("Updating subtask:", subtaskId, updates);
    
    // Prepare update data
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    
    // Update the subtask
    const { error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', subtaskId);
      
    if (error) {
      console.error("Error updating subtask:", error);
      toast.error("Failed to update subtask");
      return false;
    }
    
    console.log("Subtask updated successfully:", subtaskId);
    return true;
  } catch (error) {
    console.error("Unexpected error updating subtask:", error);
    toast.error("Failed to update subtask");
    return false;
  }
};

// Delete a subtask
export const deleteSubtask = async (subtaskId: string): Promise<boolean> => {
  try {
    console.log("Deleting subtask:", subtaskId);
    
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);
      
    if (error) {
      console.error("Error deleting subtask:", error);
      toast.error("Failed to delete subtask");
      return false;
    }
    
    console.log("Subtask deleted successfully:", subtaskId);
    return true;
  } catch (error) {
    console.error("Unexpected error deleting subtask:", error);
    toast.error("Failed to delete subtask");
    return false;
  }
};

// Listen for real-time updates to tasks
export const subscribeToTaskUpdates = (onTasksChange: () => void) => {
  const channel = supabase
    .channel('task-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks'
      },
      () => {
        console.log('Task table changed, triggering refresh');
        onTasksChange();
      }
    )
    .subscribe();
    
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
