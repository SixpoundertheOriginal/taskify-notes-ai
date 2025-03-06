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
    if (
      sourceIndex < 0 || 
      destinationIndex < 0 || 
      sourceIndex >= filteredTasks.length || 
      destinationIndex >= filteredTasks.length
    ) {
      console.error("Invalid source or destination index", { sourceIndex, destinationIndex, taskCount: filteredTasks.length });
      return { tasks: state.tasks };
    }

    // Get the moved task ID and create a map of filtered task positions
    const movedTaskId = filteredTasks[sourceIndex].id;
    const filteredTaskPositions = new Map(
      filteredTasks.map((task, index) => [task.id, index])
    );
    
    // Create arrays for tasks that are in and out of the filtered view
    const tasksInFilter = state.tasks.filter(task => filteredTaskPositions.has(task.id));
    const tasksOutOfFilter = state.tasks.filter(task => !filteredTaskPositions.has(task.id));
    
    // Reorder the filtered tasks
    const reorderedFilteredTasks = [...tasksInFilter];
    const [movedTask] = reorderedFilteredTasks.splice(sourceIndex, 1);
    reorderedFilteredTasks.splice(destinationIndex, 0, movedTask);
    
    // Combine the reordered filtered tasks with the tasks that were out of filter
    const updatedTasks = [...reorderedFilteredTasks, ...tasksOutOfFilter];
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      movedTaskId,
      oldOrder: filteredTasks.map(t => t.title),
      newOrder: reorderedFilteredTasks.map(t => t.title)
    });
    
    return { tasks: updatedTasks };
  }),
}));
