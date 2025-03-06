
import { useCallback, useState, useEffect } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Task, Priority } from "@/lib/types";
import { toast } from "sonner";
import { useTaskStore } from "@/lib/store";

export const useTaskPriorityDnd = () => {
  const { tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists } = useTaskStore();
  
  // Add local state to track optimistic UI updates
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  // Update local tasks when store tasks change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  
  // Handle drag and drop operations with optimistic updates
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    console.log("Priority Group View - Drag end event:", { 
      taskId: draggableId,
      sourceDroppableId: source.droppableId,
      sourceIndex: source.index,
      destinationDroppableId: destination?.droppableId,
      destinationIndex: destination?.index
    });
    
    // If there's no destination (dropped outside droppable area), return
    if (!destination) {
      console.log("Drop canceled - no destination or dropped outside droppable area");
      return;
    }
    
    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log("Dropped in the same position - no action needed");
      return;
    }
    
    // Extract priority information from droppableIds
    const sourcePriorityString = source.droppableId.split('-')[1] as Priority;
    const destPriorityString = destination.droppableId.split('-')[1] as Priority;
    
    if (!sourcePriorityString || !destPriorityString) {
      console.error("Invalid droppable IDs. Source:", source.droppableId, "Destination:", destination.droppableId);
      return;
    }
    
    console.log("Source priority:", sourcePriorityString);
    console.log("Destination priority:", destPriorityString);
    
    // Find the task being dragged
    const draggedTask = localTasks.find(task => task.id === draggableId);
    if (!draggedTask) {
      console.error("Could not find task with ID:", draggableId);
      return;
    }
    
    console.log("Task being dragged:", {
      id: draggedTask.id,
      title: draggedTask.title,
      priority: draggedTask.priority
    });
    
    // Create a deep copy of current tasks for optimistic update
    const newLocalTasks = [...localTasks];
    
    try {
      // Apply optimistic update to local state first
      if (sourcePriorityString === destPriorityString) {
        console.log("Same priority group reordering");
        
        // Get tasks in this priority group
        const tasksInPriority = newLocalTasks.filter(task => 
          task.priority === sourcePriorityString
        );
        
        console.log("Tasks in priority group before reordering:", 
          tasksInPriority.map(t => ({ id: t.id, title: t.title })));
        
        // Create new order for the priority group
        const updatedTasksInPriority = [...tasksInPriority];
        
        // Remove the task from its current position
        const [removedTask] = updatedTasksInPriority.splice(source.index, 1);
        if (!removedTask) {
          console.error("Could not find task at source index:", source.index);
          return;
        }
        
        console.log("Removed task:", { id: removedTask.id, title: removedTask.title });
        
        // Insert the task at its new position
        updatedTasksInPriority.splice(destination.index, 0, removedTask);
        
        console.log("Tasks in priority group after reordering:", 
          updatedTasksInPriority.map(t => ({ id: t.id, title: t.title })));
        
        // Update all tasks with the new priority group order
        const updatedTasks = newLocalTasks.map(task => {
          if (task.priority === sourcePriorityString) {
            // Replace all tasks in this priority with the reordered ones
            const indexInPriorityGroup = updatedTasksInPriority.findIndex(t => t.id === task.id);
            if (indexInPriorityGroup !== -1) {
              return updatedTasksInPriority[indexInPriorityGroup];
            }
          }
          return task;
        });
        
        // Update local state immediately
        setLocalTasks(updatedTasks);
        
        // Create the list of task IDs in the new order
        const newTaskIds = updatedTasksInPriority.map(task => task.id);
        console.log("New task IDs order:", newTaskIds);
        
        // Update the store (in background)
        reorderTasksInPriorityGroup(
          draggableId,
          sourcePriorityString,
          source.index,
          destination.index,
          newTaskIds
        );
        
        console.log("Reordering within priority group completed");
      } else {
        // Moving between different priority groups
        console.log("Moving between different priority groups");
        
        // Create a new version of the task with updated priority
        const updatedTask = { ...draggedTask, priority: destPriorityString };
        console.log("Updated task with new priority:", {
          id: updatedTask.id,
          title: updatedTask.title,
          oldPriority: draggedTask.priority,
          newPriority: updatedTask.priority
        });
        
        // Create new local tasks array for the update
        const updatedTasks = newLocalTasks.map(task => 
          task.id === draggableId ? updatedTask : task
        );
        
        // Update local state immediately
        setLocalTasks(updatedTasks);
        
        // Update the store (in background)
        moveTaskBetweenLists(
          draggableId,
          sourcePriorityString,
          destPriorityString,
          source.index,
          destination.index
        );
        
        console.log("Cross-list movement completed");
      }
    } catch (error) {
      // If an error occurs, revert to the previous state
      console.error("Error during drag and drop:", error);
      setLocalTasks(tasks); // Revert to the store state
      
      // Show error notification
      toast.error("Failed to update task position. Please try again.");
    }
  }, [localTasks, tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists]);

  // Group tasks by priority - using localTasks for rendering
  const highPriorityTasks = localTasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = localTasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = localTasks.filter(task => task.priority === "low");
  
  // Check if there are any tasks
  const hasTasks = localTasks.length > 0;

  return {
    localTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    hasTasks,
    handleDragEnd
  };
};
