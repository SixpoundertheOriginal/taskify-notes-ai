
import { useCallback, useState, useEffect, useRef } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Task, Priority } from "@/lib/types";
import { toast } from "sonner";
import { useTaskStore } from "@/lib/store";
import { saveTasksOrder } from "@/services/taskService";

export const useTaskPriorityDnd = () => {
  const { tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists } = useTaskStore();
  
  // Add local state to track optimistic UI updates
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [isSaving, setIsSaving] = useState(false);
  
  // Add ref to hold the pending task order before committing to prevent re-render issues
  const pendingTasksRef = useRef<Task[] | null>(null);
  
  // Update local tasks when store tasks change, but only if not in the middle of a drag operation
  useEffect(() => {
    if (!isSaving && !pendingTasksRef.current) {
      setLocalTasks(tasks);
    }
  }, [tasks, isSaving]);
  
  // Handle drag and drop operations with optimistic updates
  const handleDragEnd = useCallback(async (result: DropResult) => {
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
      pendingTasksRef.current = null;
      return;
    }
    
    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log("Dropped in the same position - no action needed");
      pendingTasksRef.current = null;
      return;
    }
    
    // Extract priority information from droppableIds
    const sourcePriorityString = source.droppableId.split('-')[1] as Priority;
    const destPriorityString = destination.droppableId.split('-')[1] as Priority;
    
    if (!sourcePriorityString || !destPriorityString) {
      console.error("Invalid droppable IDs. Source:", source.droppableId, "Destination:", destination.droppableId);
      pendingTasksRef.current = null;
      return;
    }
    
    console.log("Source priority:", sourcePriorityString);
    console.log("Destination priority:", destPriorityString);
    
    // Find the task being dragged by ID
    const draggedTask = localTasks.find(task => task.id === draggableId);
    if (!draggedTask) {
      console.error("Could not find task with ID:", draggableId);
      pendingTasksRef.current = null;
      return;
    }
    
    console.log("Task being dragged:", {
      id: draggedTask.id,
      title: draggedTask.title,
      priority: draggedTask.priority
    });
    
    // Create a deep copy of current tasks for optimistic update
    const newLocalTasks = [...localTasks];
    
    setIsSaving(true);
    
    try {
      // Apply optimistic update to local state first
      if (sourcePriorityString === destPriorityString) {
        console.log("Same priority group reordering");
        
        // Get tasks in this priority group with their original indices for reference
        const tasksInPriority = newLocalTasks
          .filter(task => task.priority === sourcePriorityString)
          .map((task, index) => ({ 
            ...task, 
            originalIndex: index // Track original position
          }));
        
        console.log("Tasks in priority group before reordering:", 
          tasksInPriority.map(t => ({ id: t.id, title: t.title, index: t.originalIndex })));
        
        // Create new order for the priority group
        const updatedTasksInPriority = [...tasksInPriority];
        
        // Remove the task from its current position
        const [removedTask] = updatedTasksInPriority.splice(source.index, 1);
        if (!removedTask) {
          console.error("Could not find task at source index:", source.index);
          setIsSaving(false);
          pendingTasksRef.current = null;
          return;
        }
        
        console.log("Removed task:", { id: removedTask.id, title: removedTask.title, index: removedTask.originalIndex });
        
        // Insert the task at its new position
        updatedTasksInPriority.splice(destination.index, 0, removedTask);
        
        // Ensure each task has the correct index after reordering
        updatedTasksInPriority.forEach((task, newIndex) => {
          console.log(`Task ${task.id} (${task.title}) moved from index ${task.originalIndex} to ${newIndex}`);
        });
        
        console.log("Tasks in priority group after reordering:", 
          updatedTasksInPriority.map((t, idx) => ({ 
            id: t.id, 
            title: t.title, 
            newIndex: idx, 
            oldIndex: t.originalIndex 
          })));
        
        // Verify the reordered list has the task at the expected position
        const taskAtDestination = updatedTasksInPriority[destination.index];
        if (taskAtDestination.id !== removedTask.id) {
          console.error("Error: Task not correctly positioned after reordering. Expected", 
            removedTask.id, "but found", taskAtDestination.id);
          toast.error("Error during task reordering. Please try again.");
          setIsSaving(false);
          pendingTasksRef.current = null;
          return;
        }
        
        // Remove the originalIndex property before updating
        const cleanedTasksInPriority = updatedTasksInPriority.map(({ originalIndex, ...task }) => task);
        
        // Update all tasks with the new priority group order
        const updatedTasks = newLocalTasks.map(task => {
          if (task.priority === sourcePriorityString) {
            // Replace all tasks in this priority with the reordered ones
            const indexInPriorityGroup = cleanedTasksInPriority.findIndex(t => t.id === task.id);
            if (indexInPriorityGroup !== -1) {
              return cleanedTasksInPriority[indexInPriorityGroup];
            }
          }
          return task;
        });
        
        // Verify all tasks are present and none were accidentally removed
        if (updatedTasks.length !== newLocalTasks.length) {
          console.error("Error: Task count mismatch after reordering", 
            {original: newLocalTasks.length, reordered: updatedTasks.length});
          toast.error("Error in reordering. Please try again.");
          setIsSaving(false);
          pendingTasksRef.current = null;
          return;
        }
        
        // Store the pending tasks in the ref BEFORE updating the UI
        pendingTasksRef.current = updatedTasks;
        
        // Update local state immediately
        setLocalTasks(updatedTasks);
        
        // Create the list of task IDs in the new order
        const newTaskIds = cleanedTasksInPriority.map(task => task.id);
        console.log("New task IDs order:", newTaskIds);
        
        // Save the updated order to Supabase
        console.log("Saving reordered tasks to Supabase...");
        
        // Sort the tasks by their position in the priority group
        const sortedTasks = [...updatedTasks].sort((a, b) => {
          if (a.priority === sourcePriorityString && b.priority === sourcePriorityString) {
            return newTaskIds.indexOf(a.id) - newTaskIds.indexOf(b.id);
          }
          return 0;
        });
        
        console.log("Final sorted tasks:", sortedTasks.map(t => t.title));
        
        const saveSuccess = await saveTasksOrder(sortedTasks);
        
        if (saveSuccess) {
          console.log("Successfully saved task order to Supabase");
          toast.success("Task order updated");
          
          // Update the store (in background)
          reorderTasksInPriorityGroup(
            draggableId,
            sourcePriorityString,
            source.index,
            destination.index,
            newTaskIds
          );
        } else {
          console.error("Failed to save task order to Supabase");
          toast.error("Failed to save task order to database");
          
          // Revert to original tasks on failure
          pendingTasksRef.current = null;
          setLocalTasks(tasks);
        }
        
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
        
        // Get destination priority group tasks
        const tasksInDestPriority = newLocalTasks.filter(
          task => task.priority === destPriorityString
        );
        
        console.log("Tasks in destination priority group before inserting:", 
          tasksInDestPriority.map((t, idx) => ({ id: t.id, title: t.title, index: idx })));
        
        // Create new local tasks array for the update
        const updatedTasks = newLocalTasks.map(task => 
          task.id === draggableId ? updatedTask : task
        );
        
        // Validate the updated task exists in the list and has the correct priority
        const updatedTaskInList = updatedTasks.find(t => t.id === draggableId);
        if (!updatedTaskInList || updatedTaskInList.priority !== destPriorityString) {
          console.error("Error: Task not correctly updated with new priority", {
            found: updatedTaskInList ? "yes" : "no",
            priority: updatedTaskInList?.priority
          });
          toast.error("Error updating task priority. Please try again.");
          setIsSaving(false);
          pendingTasksRef.current = null;
          return;
        }
        
        // Verify all tasks are present and none were accidentally removed
        if (updatedTasks.length !== newLocalTasks.length) {
          console.error("Error: Task count mismatch after updating priority", 
            {original: newLocalTasks.length, updated: updatedTasks.length});
          toast.error("Error in updating priority. Please try again.");
          setIsSaving(false);
          pendingTasksRef.current = null;
          return;
        }
        
        // Ensure the task is in the correct position in the destination group
        // First, get all tasks in destination priority (excluding the moved task)
        const destPriorityTasks = updatedTasks
          .filter(t => t.priority === destPriorityString && t.id !== draggableId);
        
        // Then insert the updated task at the correct position
        destPriorityTasks.splice(destination.index, 0, updatedTask);
        
        // Create a map to track the final position of each task
        const taskPositions = new Map<string, number>();
        let positionCounter = 0;
        
        // First add all tasks not in destination priority
        updatedTasks.forEach(task => {
          if (task.priority !== destPriorityString) {
            taskPositions.set(task.id, positionCounter++);
          }
        });
        
        // Then add destination priority tasks in their reordered sequence
        destPriorityTasks.forEach(task => {
          taskPositions.set(task.id, positionCounter++);
        });
        
        // Create final sorted tasks array based on position
        const finalSortedTasks = [...updatedTasks]
          .sort((a, b) => {
            const posA = taskPositions.get(a.id) ?? 0;
            const posB = taskPositions.get(b.id) ?? 0;
            return posA - posB;
          });
        
        console.log("Final sorted tasks after cross-priority move:", 
          finalSortedTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })));
        
        // Store the pending tasks in the ref BEFORE updating the UI
        pendingTasksRef.current = finalSortedTasks;
        
        // Update local state immediately
        setLocalTasks(finalSortedTasks);
        
        // Save the updated order to Supabase
        console.log("Saving updated tasks to Supabase...");
        const saveSuccess = await saveTasksOrder(finalSortedTasks);
        
        if (saveSuccess) {
          console.log("Successfully saved task order to Supabase");
          toast.success("Task order updated");
          
          // Group tasks by priority after the update for logging
          const finalHighPriorityTasks = finalSortedTasks.filter(task => task.priority === "high");
          const finalMediumPriorityTasks = finalSortedTasks.filter(task => task.priority === "medium");
          const finalLowPriorityTasks = finalSortedTasks.filter(task => task.priority === "low");
          
          console.log("Final task counts by priority:", {
            high: finalHighPriorityTasks.length,
            medium: finalMediumPriorityTasks.length,
            low: finalLowPriorityTasks.length,
            total: finalSortedTasks.length
          });
          
          // Update the store (in background)
          moveTaskBetweenLists(
            draggableId,
            sourcePriorityString,
            destPriorityString,
            source.index,
            destination.index
          );
        } else {
          console.error("Failed to save task order to Supabase");
          toast.error("Failed to save task order to database");
          
          // Revert to original tasks on failure
          pendingTasksRef.current = null;
          setLocalTasks(tasks);
        }
        
        console.log("Cross-list movement completed");
      }
    } catch (error) {
      // If an error occurs, revert to the previous state
      console.error("Error during drag and drop:", error);
      pendingTasksRef.current = null;
      setLocalTasks(tasks); // Revert to the store state
      
      // Show error notification
      toast.error("Failed to update task position. Please try again.");
    } finally {
      // Only clear the pending tasks after the operation is fully completed
      setTimeout(() => {
        pendingTasksRef.current = null;
        setIsSaving(false);
      }, 0);
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
    handleDragEnd,
    isSaving
  };
};
