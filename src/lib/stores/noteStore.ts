
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../types';

interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, noteData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  
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
