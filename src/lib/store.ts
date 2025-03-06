
import { useTaskStore as useTaskStoreOriginal } from './stores/taskStore';
import { useNoteStore as useNoteStoreOriginal } from './stores/noteStore';

// Re-export the individual stores
export { useTaskStoreOriginal as useTaskStore };
export { useNoteStoreOriginal as useNoteStore };

// No need for a combined store as the original codebase used individual stores separately
