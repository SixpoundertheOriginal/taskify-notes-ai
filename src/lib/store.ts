
import { useTaskStore } from './stores/taskStore';
import { useNoteStore } from './stores/noteStore';

// Re-export the individual stores
export { useTaskStore };
export { useNoteStore };

// No need for a combined store as the original codebase used individual stores separately
