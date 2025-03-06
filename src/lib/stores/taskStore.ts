
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
  reorderTasks: (taskId: string, sourceIndex: number, destinationIndex: number, reorderedIds: string[]) => void;
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
    // Create a copy of all tasks
    const allTasks = [...state.tasks];
    
    // Find task by ID and create a new copy with updated priority
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      console.error("Task not found for priority update:", id);
      return { tasks: state.tasks };
    }
    
    // Remove the task from its current position
    const [taskToUpdate] = allTasks.splice(taskIndex, 1);
    
    // Create an updated version of the task with the new priority
    const updatedTask = { ...taskToUpdate, priority };
    
    // If no reordering info provided, just put it back at the same position
    if (destinationIndex === undefined || !reorderedIds || reorderedIds.length === 0) {
      allTasks.splice(taskIndex, 0, updatedTask);
      console.log("Priority updated without reordering:", { taskId: id, newPriority: priority });
      return { tasks: allTasks };
    }
    
    // Apply the entire new order as specified by reorderedIds
    const finalTaskOrder: Task[] = [];
    const taskMap = new Map<string, Task>();
    
    // Map all tasks by ID for easy access
    allTasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Add the updated task to the map
    taskMap.set(updatedTask.id, updatedTask);
    
    // Build the new task array based on the provided order
    reorderedIds.forEach(taskId => {
      const task = taskMap.get(taskId);
      if (task) {
        finalTaskOrder.push(task);
        taskMap.delete(taskId);
      }
    });
    
    // Add any remaining tasks that weren't in the reorderedIds
    taskMap.forEach(task => {
      finalTaskOrder.push(task);
    });
    
    console.log("Task priority and position updated:", {
      taskId: id,
      newPriority: priority,
      resultingOrder: finalTaskOrder
        .filter(t => t.priority === priority)
        .map(t => t.title)
    });
    
    return { tasks: finalTaskOrder };
  }),

  reorderTasks: (taskId, sourceIndex, destinationIndex, reorderedIds) => set((state) => {
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering");
      return { tasks: state.tasks };
    }

    // Use a map to ensure each task ID is included exactly once
    const taskMap = new Map<string, Task>();
    state.tasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Create the new task order using the provided IDs
    const newTasksOrder: Task[] = [];
    
    // Add tasks in the specified order
    reorderedIds.forEach(id => {
      const task = taskMap.get(id);
      if (task) {
        newTasksOrder.push(task);
        taskMap.delete(id);
      }
    });
    
    // Add any remaining tasks not included in reorderedIds
    taskMap.forEach(task => {
      newTasksOrder.push(task);
    });
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      taskId,
      resultingOrder: newTasksOrder.map(t => t.title)
    });
    
    return { tasks: newTasksOrder };
  }),

  reorderTasksInPriorityGroup: (taskId, priority, sourceIndex, destinationIndex, reorderedIds) => set((state) => {
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering in priority group");
      return { tasks: state.tasks };
    }

    // Get tasks in the specified priority group
    const tasksInPriorityGroup = state.tasks.filter(task => task.priority === priority);
    
    // Get tasks not in the priority group
    const tasksInOtherGroups = state.tasks.filter(task => task.priority !== priority);
    
    // Map priority group tasks by ID
    const priorityTaskMap = new Map<string, Task>();
    tasksInPriorityGroup.forEach(task => {
      priorityTaskMap.set(task.id, task);
    });
    
    // Create the new order for tasks in the priority group
    const newPriorityGroupOrder: Task[] = [];
    
    // Add tasks in the specified order
    reorderedIds.forEach(id => {
      const task = priorityTaskMap.get(id);
      if (task) {
        newPriorityGroupOrder.push(task);
        priorityTaskMap.delete(id);
      }
    });
    
    // Add any remaining tasks in the priority group not included in reorderedIds
    priorityTaskMap.forEach(task => {
      newPriorityGroupOrder.push(task);
    });
    
    // Combine with tasks from other priority groups
    const newTasksOrder = [...tasksInOtherGroups, ...newPriorityGroupOrder];
    
    console.log("Task reordering in priority group complete:", {
      sourceIndex,
      destinationIndex,
      taskId,
      priority,
      resultingOrder: newPriorityGroupOrder.map(t => t.title)
    });
    
    return { tasks: newTasksOrder };
  }),
}));
