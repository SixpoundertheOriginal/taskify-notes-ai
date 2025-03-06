
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, Status, Subtask } from '../types';
import { demoTasks } from '../demoData';
import { 
  createTask as createTaskInSupabase,
  updateTask as updateTaskInSupabase,
  deleteTask as deleteTaskInSupabase,
  addSubtask as addSubtaskInSupabase,
  updateSubtask as updateSubtaskInSupabase,
  deleteSubtask as deleteSubtaskInSupabase,
  saveTasksOrder
} from '@/services/taskService';

interface TaskState {
  tasks: Task[];
  
  // Tasks array management
  setTasks: (tasks: Task[]) => void;
  
  // Task CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'status' | 'subtasks'>) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Task priority and ordering
  updateTaskPriority: (id: string, priority: Task['priority'], destinationIndex?: number, reorderedIds?: string[]) => void;
  reorderTasks: (taskId: string, sourceIndex: number, destinationIndex: number, reorderedIds: string[]) => void;
  reorderTasksInPriorityGroup: (taskId: string, priority: Priority, sourceIndex: number, destinationIndex: number, reorderedIds: string[]) => void;
  
  // Cross-list drag and drop
  moveTaskBetweenLists: (taskId: string, sourcePriority: Priority, targetPriority: Priority, sourceIndex: number, destinationIndex: number) => void;
  
  // Subtask operations
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initialize with demo tasks
  tasks: demoTasks,
  
  // Set all tasks (used when loading from Supabase)
  setTasks: (tasks) => set({ tasks }),
  
  addTask: async (task) => {
    // Create a local task object with a temporary ID
    const newTask: Task = {
      ...task,
      id: uuidv4(), // Temporary ID that will be replaced with the one from Supabase
      completed: false,
      status: 'todo',
      subtasks: [],
      createdAt: new Date().toISOString(),
    };
    
    // Optimistically update the UI
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
    
    // Create the task in Supabase
    const createdTask = await createTaskInSupabase(task);
    
    if (createdTask) {
      // Update the local state with the task from Supabase
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === newTask.id ? createdTask : t
        ),
      }));
    }
  },
  
  toggleTaskCompletion: async (id) => {
    // Get the current task state before toggling
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    
    const newCompletedState = !task.completed;
    const newStatus = newCompletedState ? 'completed' : 'todo';
    
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { 
          ...task, 
          completed: newCompletedState,
          status: newStatus
        } : task
      ),
    }));
    
    // Update in Supabase
    await updateTaskInSupabase(id, { 
      completed: newCompletedState,
      status: newStatus
    });
  },
  
  updateTask: async (id, taskData) => {
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...taskData } : task
      ),
    }));
    
    // Update in Supabase
    await updateTaskInSupabase(id, taskData);
  },
  
  deleteTask: async (id) => {
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    
    // Delete from Supabase
    await deleteTaskInSupabase(id);
  },

  addSubtask: async (taskId, subtaskTitle) => {
    const tempSubtaskId = uuidv4();
    
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? {
          ...task,
          subtasks: [
            ...(task.subtasks || []),
            {
              id: tempSubtaskId,
              title: subtaskTitle,
              completed: false
            }
          ]
        } : task
      ),
    }));
    
    // Add to Supabase
    const createdSubtask = await addSubtaskInSupabase(taskId, subtaskTitle);
    
    if (createdSubtask) {
      // Update with the actual subtask from Supabase
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? {
            ...task,
            subtasks: task.subtasks?.map(subtask => 
              subtask.id === tempSubtaskId ? createdSubtask : subtask
            )
          } : task
        ),
      }));
    }
  },

  toggleSubtaskCompletion: async (taskId, subtaskId) => {
    // Get current state
    const task = get().tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;
    
    const newCompletedState = !subtask.completed;
    
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? {
          ...task,
          subtasks: task.subtasks?.map((subtask) =>
            subtask.id === subtaskId ? {
              ...subtask,
              completed: newCompletedState
            } : subtask
          )
        } : task
      ),
    }));
    
    // Update in Supabase
    await updateSubtaskInSupabase(subtaskId, { completed: newCompletedState });
  },

  updateSubtask: async (taskId, subtaskId, title) => {
    // Optimistically update the UI
    set((state) => ({
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
    }));
    
    // Update in Supabase
    await updateSubtaskInSupabase(subtaskId, { title });
  },

  deleteSubtask: async (taskId, subtaskId) => {
    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? {
          ...task,
          subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId)
        } : task
      ),
    }));
    
    // Delete from Supabase
    await deleteSubtaskInSupabase(subtaskId);
  },
  
  updateTaskPriority: async (id, priority, destinationIndex, reorderedIds) => {
    console.log('updateTaskPriority called:', { id, priority, destinationIndex, reorderIdsLength: reorderedIds?.length });
    
    // Create a deep copy of all tasks using immutable approach
    const allTasks = [...get().tasks];
    
    // Find task by ID - use the stable ID directly
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      console.error("Task not found for priority update:", id);
      return;
    }
    
    // Remove the task from its current position (immutably)
    const taskToUpdate = allTasks[taskIndex];
    const tasksWithoutUpdated = [
      ...allTasks.slice(0, taskIndex),
      ...allTasks.slice(taskIndex + 1)
    ];
    
    // Create an updated version of the task with the new priority
    const updatedTask = { ...taskToUpdate, priority };
    
    // If no reordering info provided, just put it back at the same position
    if (destinationIndex === undefined || !reorderedIds || reorderedIds.length === 0) {
      const updatedTasks = [
        ...tasksWithoutUpdated.slice(0, taskIndex),
        updatedTask,
        ...tasksWithoutUpdated.slice(taskIndex)
      ];
      console.log("Priority updated without reordering:", { taskId: id, newPriority: priority });
      
      // Update state
      set({ tasks: updatedTasks });
      
      // Update in Supabase
      await updateTaskInSupabase(id, { priority });
      return;
    }
    
    // Apply the entire new order as specified by reorderedIds
    const taskMap = new Map<string, Task>();
    
    // Map all tasks by ID for easy access
    tasksWithoutUpdated.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Add the updated task to the map
    taskMap.set(updatedTask.id, updatedTask);
    
    // Build the new task array based on the provided order
    const finalTaskOrder: Task[] = [];
    
    // First add tasks with the specified order from reorderedIds
    reorderedIds.forEach(taskId => {
      const task = taskMap.get(taskId);
      if (task) {
        finalTaskOrder.push({...task});
        taskMap.delete(taskId);
      }
    });
    
    // Add any remaining tasks that weren't in the reorderedIds
    taskMap.forEach(task => {
      finalTaskOrder.push({...task});
    });
    
    console.log("Task priority and position updated:", {
      taskId: id,
      newPriority: priority,
      resultingOrder: finalTaskOrder
        .filter(t => t.priority === priority)
        .map(t => t.title)
    });
    
    // Update state
    set({ tasks: finalTaskOrder });
    
    // Update task priority in Supabase
    await updateTaskInSupabase(id, { priority });
    
    // Save the new task order
    await saveTasksOrder(finalTaskOrder);
  },

  reorderTasks: async (taskId, sourceIndex, destinationIndex, reorderedIds) => {
    console.log('reorderTasks called:', { taskId, sourceIndex, destinationIndex, reorderIdsLength: reorderedIds?.length });
    
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering");
      return;
    }

    // Create a map of all tasks by ID for easy access
    const taskMap = new Map<string, Task>();
    get().tasks.forEach(task => {
      taskMap.set(task.id, {...task});
    });
    
    // Create a new task array based on the provided order in reorderedIds
    const newTasksOrder: Task[] = [];
    
    // Add tasks in the specified order, maintaining the complete state of each task
    reorderedIds.forEach(id => {
      const task = taskMap.get(id);
      if (task) {
        newTasksOrder.push({ ...task });
        taskMap.delete(id);
      } else {
        console.warn(`Task ID ${id} was in reorderedIds but not found in the store`);
      }
    });
    
    // Add any remaining tasks that weren't in reorderedIds
    // This ensures we don't lose any tasks that might not be in the current filtered view
    taskMap.forEach(task => {
      newTasksOrder.push({ ...task });
    });
    
    console.log("Task reordering complete:", {
      sourceIndex,
      destinationIndex,
      taskId,
      resultingOrderIds: newTasksOrder.map(t => t.id),
      resultingTitles: newTasksOrder.map(t => t.title)
    });
    
    // Update state
    set({ tasks: newTasksOrder });
    
    // Save the new task order to Supabase
    await saveTasksOrder(newTasksOrder);
  },

  reorderTasksInPriorityGroup: async (taskId, priority, sourceIndex, destinationIndex, reorderedIds) => {
    console.log('reorderTasksInPriorityGroup called:', { 
      taskId, 
      priority, 
      sourceIndex, 
      destinationIndex, 
      reorderIdsLength: reorderedIds?.length 
    });
    
    if (!reorderedIds || reorderedIds.length === 0) {
      console.error("No reordered IDs provided for task reordering in priority group");
      return;
    }

    // Create copies of tasks immutably
    const allTasks = [...get().tasks];
    
    // Get tasks in the specified priority group
    const tasksInPriorityGroup = allTasks.filter(task => task.priority === priority);
    
    // Get tasks not in the priority group
    const tasksInOtherGroups = allTasks.filter(task => task.priority !== priority);
    
    // Map priority group tasks by ID
    const priorityTaskMap = new Map<string, Task>();
    tasksInPriorityGroup.forEach(task => {
      priorityTaskMap.set(task.id, {...task});
    });
    
    // Create the new order for tasks in the priority group
    const newPriorityGroupOrder: Task[] = [];
    
    // Add tasks in the specified order
    reorderedIds.forEach(id => {
      const task = priorityTaskMap.get(id);
      if (task) {
        newPriorityGroupOrder.push({...task});
        priorityTaskMap.delete(id);
      }
    });
    
    // Add any remaining tasks in the priority group not included in reorderedIds
    priorityTaskMap.forEach(task => {
      newPriorityGroupOrder.push({...task});
    });
    
    // Combine with tasks from other priority groups
    const newTasksOrder = [...tasksInOtherGroups, ...newPriorityGroupOrder];
    
    console.log("Task reordering in priority group complete:", {
      sourceIndex,
      destinationIndex,
      taskId,
      priority,
      resultingOrderIds: newPriorityGroupOrder.map(t => t.id),
      resultingTitles: newPriorityGroupOrder.map(t => t.title)
    });
    
    // Update state
    set({ tasks: newTasksOrder });
    
    // Save the new task order to Supabase
    await saveTasksOrder(newTasksOrder);
  },

  moveTaskBetweenLists: async (taskId, sourcePriority, targetPriority, sourceIndex, destinationIndex) => {
    console.log('moveTaskBetweenLists called:', { 
      taskId, 
      sourcePriority, 
      targetPriority, 
      sourceIndex, 
      destinationIndex 
    });
    
    // Find the task to move
    const taskToMove = get().tasks.find(task => task.id === taskId);
    if (!taskToMove) {
      console.error("Task not found for cross-list move:", taskId);
      return;
    }
    
    // Create an updated version of the task with the new priority
    const updatedTask = { ...taskToMove, priority: targetPriority };
    
    // Create a new immutable array of tasks with the task removed from its current position
    // and updated with the new priority
    const updatedTasks = get().tasks.map(task => 
      task.id === taskId ? updatedTask : task
    );
    
    // Reorder the tasks in the target priority group
    const tasksInTargetPriority = updatedTasks.filter(task => task.priority === targetPriority);
    
    // Move the task to the correct position in the target priority group
    const updatedTargetPriorityTasks = [
      ...tasksInTargetPriority.slice(0, destinationIndex),
      updatedTask,
      ...tasksInTargetPriority.slice(destinationIndex)
    ].filter((task, index, self) => 
      // Remove duplicates (the task appears twice because we mapped it above and added it again here)
      index === self.findIndex(t => t.id === task.id)
    );
    
    // Map all tasks by priority for easy reconstruction
    const tasksByPriority = new Map<Priority, Task[]>();
    updatedTasks.forEach(task => {
      if (task.priority === targetPriority) {
        // Skip target priority tasks, we'll add the reordered ones later
        return;
      }
      
      if (!tasksByPriority.has(task.priority)) {
        tasksByPriority.set(task.priority, []);
      }
      tasksByPriority.get(task.priority)?.push(task);
    });
    
    // Add the reordered target priority tasks
    tasksByPriority.set(targetPriority, updatedTargetPriorityTasks);
    
    // Flatten the map back to a single array
    const finalTasksOrder: Task[] = [];
    tasksByPriority.forEach(tasks => {
      finalTasksOrder.push(...tasks);
    });
    
    console.log("Cross-list task move complete:", {
      taskId,
      fromPriority: sourcePriority,
      toPriority: targetPriority,
      atPosition: destinationIndex,
      resultingTargetPriorityTasks: updatedTargetPriorityTasks.map(t => t.title)
    });
    
    // Update state
    set({ tasks: finalTasksOrder });
    
    // Update task priority in Supabase
    await updateTaskInSupabase(taskId, { priority: targetPriority });
    
    // Save the new task order
    await saveTasksOrder(finalTasksOrder);
  },
}));
