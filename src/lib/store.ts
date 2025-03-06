import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Note, Subtask } from './types';

interface TaskStore {
  tasks: Task[];
  notes: Note[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'status' | 'subtasks'>) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, noteData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updateTaskPriority: (id: string, priority: Task['priority']) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number, filteredTasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  notes: [],
  
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
  
  addNote: (note) => set((state) => ({
    notes: [
      ...state.notes,
      {
        ...note,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  })),
  
  updateNote: (id, noteData) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id 
        ? { 
            ...note, 
            ...noteData, 
            updatedAt: new Date().toISOString() 
          } 
        : note
    ),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
  })),
  
  updateTaskPriority: (id, priority) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, priority } : task
    ),
  })),

  reorderTasks: (sourceIndex, destinationIndex, filteredTasks) => set((state) => {
    if (
      sourceIndex < 0 || 
      destinationIndex < 0 || 
      sourceIndex >= filteredTasks.length || 
      destinationIndex >= filteredTasks.length
    ) {
      console.error("Invalid source or destination index", { sourceIndex, destinationIndex, taskCount: filteredTasks.length });
      return { tasks: state.tasks };
    }

    // Get the task IDs in their current order
    const taskIds = filteredTasks.map(task => task.id);
    
    // Reorder the IDs
    const draggedId = taskIds[sourceIndex];
    const newTaskIds = [...taskIds];
    newTaskIds.splice(sourceIndex, 1);
    newTaskIds.splice(destinationIndex, 0, draggedId);
    
    console.log("Reordering task", {
      draggedId,
      oldIndex: sourceIndex,
      newIndex: destinationIndex,
      oldOrder: taskIds,
      newOrder: newTaskIds
    });

    // Create a new ordered array of tasks based on all tasks
    const reorderedTasks = [...state.tasks];
    
    // Create an index mapping for quick lookup
    const taskIndexMap = new Map(state.tasks.map((task, index) => [task.id, index]));
    
    // Apply the new order (only for tasks in filteredTasks)
    filteredTasks.forEach((task, idx) => {
      const originalIndex = taskIndexMap.get(task.id);
      const newIndex = taskIndexMap.get(newTaskIds[idx]);
      
      if (originalIndex !== undefined && newIndex !== undefined) {
        // Swap positions
        const temp = reorderedTasks[originalIndex];
        reorderedTasks[originalIndex] = reorderedTasks[newIndex];
        reorderedTasks[newIndex] = temp;
        
        // Update the map after swapping
        taskIndexMap.set(reorderedTasks[originalIndex].id, originalIndex);
        taskIndexMap.set(reorderedTasks[newIndex].id, newIndex);
      }
    });
    
    return { tasks: reorderedTasks };
  }),
}));
