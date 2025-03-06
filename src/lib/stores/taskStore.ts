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
    
    if (reorderedIds.length > 0) {
      const newTasksOrder: Task[] = [];
      const taskMap = new Map<string, Task>();
      
      allTasks.forEach(task => {
        taskMap.set(task.id, task);
      });
      
      taskMap.set(updatedTask.id, updatedTask);
      
      reorderedIds.forEach(taskId => {
        const task = taskMap.get(taskId);
        if (task) {
          newTasksOrder.push(task);
          taskMap.delete(taskId);
        }
      });
      
      taskMap.forEach(task => {
        newTasksOrder.push(task);
      });
      
      console.log("Task priority and position updated:", {
        taskId: id,
        newPriority: priority,
        resultingOrder: newTasksOrder.filter(t => t.priority === priority).map(t => t.title)
      });
      
      return { tasks: newTasksOrder };
    }
    
    allTasks.push(updatedTask);
    
    return { tasks: allTasks };
  }),

  reorderTasks: (taskId, sourceIndex, destinationIndex, reorderedIds) => set((state) => {
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering");
      return { tasks: state.tasks };
    }

    const allTasks = [...state.tasks];
    
    const taskMap = new Map<string, Task>();
    allTasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    const newTasksOrder: Task[] = [];
    
    reorderedIds.forEach(id => {
      const task = taskMap.get(id);
      if (task) {
        newTasksOrder.push(task);
        taskMap.delete(id);
      }
    });
    
    taskMap.forEach(task => {
      newTasksOrder.push(task);
    });
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      taskId,
      resultingOrder: reorderedIds.map(id => {
        const task = state.tasks.find(t => t.id === id);
        return task ? task.title : `Unknown (${id})`;
      })
    });
    
    return { tasks: newTasksOrder };
  }),

  reorderTasksInPriorityGroup: (taskId, priority, sourceIndex, destinationIndex, reorderedIds) => set((state) => {
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering in priority group");
      return { tasks: state.tasks };
    }

    const allTasks = [...state.tasks];
    
    const tasksInOtherGroups = allTasks.filter(task => task.priority !== priority);
    
    const priorityTaskMap = new Map<string, Task>();
    allTasks.filter(task => task.priority === priority).forEach(task => {
      priorityTaskMap.set(task.id, task);
    });
    
    const newPriorityGroupOrder: Task[] = [];
    
    reorderedIds.forEach(id => {
      const task = priorityTaskMap.get(id);
      if (task) {
        newPriorityGroupOrder.push(task);
        priorityTaskMap.delete(id);
      }
    });
    
    priorityTaskMap.forEach(task => {
      newPriorityGroupOrder.push(task);
    });
    
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
