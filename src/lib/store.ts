
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Note } from './types';

interface TaskStore {
  tasks: Task[];
  notes: Note[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, noteData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
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
        createdAt: new Date().toISOString(),
      },
    ],
  })),
  
  toggleTaskCompletion: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
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
}));
