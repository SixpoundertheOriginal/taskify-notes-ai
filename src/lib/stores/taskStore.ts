
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, Status, Subtask } from '../types';

interface TaskState {
  tasks: Task[];
  
  // Task CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'status' | 'subtasks'>) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Task priority and ordering
  updateTaskPriority: (id: string, priority: Task['priority']) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number, filteredTasks: Task[]) => void;
  
  // Subtask operations
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  
  addTask: (task) => set((state) => ({
    tasks: [
      ...state.tasks,
      {
        ...task,
        id: uuidv4(),
        completed: false,
        status: 'todo',
        subtasks: [],
        createdAt: new Date().toISOString(),
      },
    ],
  })),
  
  toggleTaskCompletion: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        status: !task.completed ? 'completed' : 'todo'
      } : task
    ),
  })),
  
  updateTask: (id, taskData) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...taskData } : task
    ),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  addSubtask: (taskId, subtaskTitle) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? {
        ...task,
        subtasks: [
          ...(task.subtasks || []),
          {
            id: uuidv4(),
            title: subtaskTitle,
            completed: false
          }
        ]
      } : task
    ),
  })),

  toggleSubtaskCompletion: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? {
        ...task,
        subtasks: task.subtasks?.map((subtask) =>
          subtask.id === subtaskId ? {
            ...subtask,
            completed: !subtask.completed
          } : subtask
        )
      } : task
    ),
  })),

  updateSubtask: (taskId, subtaskId, title) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? {
        ...task,
        subtasks: task.subtasks?.map((subtask) =>
          subtask.id === subtaskId ? {
            ...subtask,
            title
          } : subtask
        )
      } : task
    ),
  })),

  deleteSubtask: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? {
        ...task,
        subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId)
      } : task
    ),
  })),
  
  updateTaskPriority: (id, priority) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, priority } : task
    ),
  })),

  reorderTasks: (sourceIndex: number, destinationIndex: number, filteredTasks: Task[]) => set((state) => {
    // Validate indices to prevent errors
    if (
      sourceIndex < 0 || 
      destinationIndex < 0 || 
      sourceIndex >= filteredTasks.length || 
      destinationIndex >= filteredTasks.length
    ) {
      console.error("Invalid source or destination index", { sourceIndex, destinationIndex, taskCount: filteredTasks.length });
      return { tasks: state.tasks };
    }

    // Get the task being moved from the filtered list
    const taskToMove = filteredTasks[sourceIndex];
    if (!taskToMove) {
      console.error("Task not found at source index:", sourceIndex);
      return { tasks: state.tasks };
    }

    // Create a new array with all tasks
    const allTasks = [...state.tasks];
    
    // Find the actual position of the task in the complete list
    const actualSourceIndex = allTasks.findIndex(task => task.id === taskToMove.id);
    if (actualSourceIndex === -1) {
      console.error("Task not found in full task list:", taskToMove.id);
      return { tasks: state.tasks };
    }
    
    // Remove the task from its current position
    const [removedTask] = allTasks.splice(actualSourceIndex, 1);
    
    // Calculate the destination index in the full list
    let actualDestinationIndex;
    
    if (destinationIndex >= filteredTasks.length) {
      // If moving to the end of the filtered list
      actualDestinationIndex = allTasks.length;
    } else {
      // Get the task at the destination position in the filtered list
      const destinationTask = filteredTasks[destinationIndex];
      
      // Find its position in the full list
      actualDestinationIndex = allTasks.findIndex(task => task.id === destinationTask.id);
      
      // If the destination task wasn't found (shouldn't happen), append to the end
      if (actualDestinationIndex === -1) {
        console.warn("Destination task not found in full task list, appending to end");
        actualDestinationIndex = allTasks.length;
      }
    }
    
    // Insert the task at the calculated destination position
    allTasks.splice(actualDestinationIndex, 0, removedTask);
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      taskId: taskToMove.id,
      actualSourceIndex,
      actualDestinationIndex,
      taskTitle: taskToMove.title
    });
    
    return { tasks: allTasks };
  }),
}));
