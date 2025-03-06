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
  updateTaskPriority: (id: string, priority: Task['priority'], destinationIndex?: number, reorderedIds?: string[]) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number, filteredTasks: Task[]) => void;
  reorderTasksInPriorityGroup: (taskId: string, priority: Priority, sourceIndex: number, destinationIndex: number, reorderedIds: string[]) => void;
  
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
  
  updateTaskPriority: (id, priority, destinationIndex, reorderedIds) => set((state) => {
    const allTasks = [...state.tasks];
    
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      console.error("Task not found for priority update:", id);
      return { tasks: state.tasks };
    }
    
    const [taskToUpdate] = allTasks.splice(taskIndex, 1);
    
    const updatedTask = { ...taskToUpdate, priority };
    
    if (destinationIndex === undefined || !reorderedIds) {
      allTasks.splice(taskIndex, 0, updatedTask);
      console.log("Priority updated without reordering:", { taskId: id, newPriority: priority });
      return { tasks: allTasks };
    }
    
    const tasksWithSamePriority = allTasks.filter(task => task.priority === priority);
    
    if (reorderedIds.length > 0) {
      let insertAfterIndex = -1;
      
      if (destinationIndex < reorderedIds.length - 1) {
        const nextTaskId = reorderedIds[destinationIndex];
        insertAfterIndex = allTasks.findIndex(task => task.id === nextTaskId);
      }
      
      if (insertAfterIndex !== -1) {
        allTasks.splice(insertAfterIndex, 0, updatedTask);
      } else {
        let lastSamePriorityIndex = -1;
        for (let i = allTasks.length - 1; i >= 0; i--) {
          if (allTasks[i].priority === priority) {
            lastSamePriorityIndex = i;
            break;
          }
        }
        
        if (lastSamePriorityIndex !== -1) {
          allTasks.splice(lastSamePriorityIndex + 1, 0, updatedTask);
        } else {
          allTasks.push(updatedTask);
        }
      }
    } else {
      allTasks.push(updatedTask);
    }
    
    console.log("Task priority and position updated:", {
      taskId: id,
      newPriority: priority,
      taskTitle: updatedTask.title,
      destinationIndex,
      reorderedIds
    });
    
    return { tasks: allTasks };
  }),

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

    const taskToMove = filteredTasks[sourceIndex];
    if (!taskToMove) {
      console.error("Task not found at source index:", sourceIndex);
      return { tasks: state.tasks };
    }

    const allTasks = [...state.tasks];
    
    const actualSourceIndex = allTasks.findIndex(task => task.id === taskToMove.id);
    if (actualSourceIndex === -1) {
      console.error("Task not found in full task list:", taskToMove.id);
      return { tasks: state.tasks };
    }
    
    const [removedTask] = allTasks.splice(actualSourceIndex, 1);
    
    let actualDestinationIndex;
    
    if (destinationIndex >= filteredTasks.length) {
      actualDestinationIndex = allTasks.length;
    } else {
      const destinationTask = filteredTasks[destinationIndex];
      
      actualDestinationIndex = allTasks.findIndex(task => task.id === destinationTask.id);
      
      if (actualDestinationIndex === -1) {
        console.warn("Destination task not found in full task list, appending to end");
        actualDestinationIndex = allTasks.length;
      }
    }
    
    if (actualSourceIndex < actualDestinationIndex) {
      actualDestinationIndex--;
    }
    
    allTasks.splice(actualDestinationIndex, 0, removedTask);
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      taskId: taskToMove.id,
      actualSourceIndex,
      actualDestinationIndex,
      taskTitle: taskToMove.title,
      resultingOrder: allTasks.map(t => t.title)
    });
    
    return { tasks: allTasks };
  }),

  reorderTasksInPriorityGroup: (taskId, priority, sourceIndex, destinationIndex, reorderedIds) => set((state) => {
    const allTasks = [...state.tasks];
    
    const actualSourceIndex = allTasks.findIndex(task => task.id === taskId);
    if (actualSourceIndex === -1) {
      console.error("Task not found in full task list:", taskId);
      return { tasks: state.tasks };
    }
    
    const [removedTask] = allTasks.splice(actualSourceIndex, 1);
    
    let actualDestinationIndex = -1;
    
    if (destinationIndex >= reorderedIds.length) {
      for (let i = allTasks.length - 1; i >= 0; i--) {
        if (allTasks[i].priority === priority) {
          actualDestinationIndex = i + 1;
          break;
        }
      }
      if (actualDestinationIndex === -1) {
        actualDestinationIndex = allTasks.length;
      }
    } else {
      const destinationTaskId = reorderedIds[destinationIndex];
      
      actualDestinationIndex = allTasks.findIndex(task => task.id === destinationTaskId);
      
      if (actualDestinationIndex === -1) {
        console.warn("Destination task not found in full task list, finding best position");
        actualDestinationIndex = allTasks.findIndex(task => task.priority === priority);
        if (actualDestinationIndex === -1) {
          actualDestinationIndex = allTasks.length;
        }
      }
    }
    
    allTasks.splice(actualDestinationIndex, 0, removedTask);
    
    console.log("Task reordering in priority group complete:", {
      sourceIndex,
      destinationIndex,
      taskId: removedTask.id,
      actualSourceIndex,
      actualDestinationIndex,
      taskTitle: removedTask.title,
      priority,
      resultingOrder: allTasks.filter(t => t.priority === priority).map(t => t.title)
    });
    
    return { tasks: allTasks };
  }),
}));
