
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { useTaskStore } from "@/lib/store";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { saveTasksOrder } from "@/services/taskService";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { tasks: allTasks, reorderTasks } = useTaskStore();
  
  const [localFilteredTasks, setLocalFilteredTasks] = useState<Task[]>(filteredTasks);
  const [isSaving, setIsSaving] = useState(false);
  
  // Add ref to hold pending tasks before committing
  const pendingTasksRef = useRef<Task[] | null>(null);
  
  useEffect(() => {
    // Only update if not in the middle of a drag operation
    if (!isSaving && !pendingTasksRef.current) {
      setLocalFilteredTasks(filteredTasks);
    }
  }, [filteredTasks, isSaving]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    console.log("Drag end event:", { 
      taskId: draggableId,
      sourceIndex: source.index,
      destinationIndex: destination?.index,
      sourceDroppableId: source.droppableId,
      destinationDroppableId: destination?.droppableId
    });
    
    // If there's no destination (dropped outside droppable area) or
    // dropped in the same position, do nothing
    if (!destination) {
      console.log("Drop canceled - no destination or dropped outside droppable area");
      pendingTasksRef.current = null;
      return;
    }
    
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      console.log("Dropped in same position - no action needed");
      pendingTasksRef.current = null;
      return;
    }
    
    try {
      console.log("Starting task reordering process");
      console.log("Local filtered tasks before reordering:", 
        localFilteredTasks.map(t => ({ id: t.id, title: t.title })));
      
      // Create a new copy of the filtered tasks for the optimistic update
      const newLocalFilteredTasks = [...localFilteredTasks];
      
      // Find the task being moved
      const [removedTask] = newLocalFilteredTasks.splice(source.index, 1);
      if (!removedTask) {
        console.error("Could not find task at source index:", source.index);
        pendingTasksRef.current = null;
        return;
      }
      
      console.log("Removed task:", { id: removedTask.id, title: removedTask.title });
      
      // Insert the task at the destination
      newLocalFilteredTasks.splice(destination.index, 0, removedTask);
      console.log("Local filtered tasks after reordering:", 
        newLocalFilteredTasks.map(t => ({ id: t.id, title: t.title })));
      
      // Verify the reordered list for correctness - ensure the dragged task is at the expected position
      const taskAtDestination = newLocalFilteredTasks[destination.index];
      if (taskAtDestination.id !== removedTask.id) {
        console.error("Error: Task not correctly positioned after reordering. Expected", 
          removedTask.id, "but found", taskAtDestination.id);
        toast.error("Error during task reordering. Please try again.");
        pendingTasksRef.current = null;
        return;
      }
      
      // Store the pending tasks in the ref BEFORE updating the UI
      pendingTasksRef.current = newLocalFilteredTasks;
      
      // Set saving state to prevent further updates
      setIsSaving(true);
      
      // Update local state immediately (optimistic update)
      setLocalFilteredTasks(newLocalFilteredTasks);
      
      // Map task IDs to their indices in the full task list
      const taskIdToFullListIndex = new Map();
      allTasks.forEach((task, index) => {
        taskIdToFullListIndex.set(task.id, index);
      });
      console.log("Task ID to index mapping:", Object.fromEntries(taskIdToFullListIndex));
      
      const filteredTaskIds = newLocalFilteredTasks.map(task => task.id);
      console.log("Filtered task IDs in new order:", filteredTaskIds);
      
      const filteredIdsSet = new Set(filteredTaskIds);
      
      const allTaskIds = allTasks.map(task => task.id);
      console.log("All task IDs before reordering:", allTaskIds);
      
      const reorderedCompleteList = [];
      
      for (const taskId of allTaskIds) {
        if (filteredIdsSet.has(taskId)) {
          continue;
        } else {
          reorderedCompleteList.push(taskId);
        }
      }
      console.log("Reordered list (non-filtered tasks only):", reorderedCompleteList);
      
      for (const filteredId of filteredTaskIds) {
        const originalIndex = taskIdToFullListIndex.get(filteredId);
        
        let insertionIndex = 0;
        
        const filteredIndex = filteredTaskIds.indexOf(filteredId);
        if (filteredIndex > 0) {
          const previousFilteredId = filteredTaskIds[filteredIndex - 1];
          const previousIndex = reorderedCompleteList.indexOf(previousFilteredId);
          if (previousIndex !== -1) {
            insertionIndex = previousIndex + 1;
          }
        } else {
          insertionIndex = Math.min(originalIndex, reorderedCompleteList.length);
        }
        
        console.log(`Inserting task ${filteredId} at position ${insertionIndex}`);
        reorderedCompleteList.splice(insertionIndex, 0, filteredId);
      }
      
      console.log("Final reordered complete list:", reorderedCompleteList);
      
      // Verify all tasks are present in the reordered list
      if (reorderedCompleteList.length !== allTaskIds.length) {
        console.error("Error: Reordered list has different number of tasks than original list", 
          {original: allTaskIds.length, reordered: reorderedCompleteList.length});
        
        // Find missing tasks
        const missingIds = allTaskIds.filter(id => !reorderedCompleteList.includes(id));
        if (missingIds.length > 0) {
          console.error("Missing task IDs:", missingIds);
        }
        
        // Find duplicate tasks
        const dupeMap = new Map();
        const duplicates = [];
        reorderedCompleteList.forEach(id => {
          dupeMap.set(id, (dupeMap.get(id) || 0) + 1);
          if (dupeMap.get(id) > 1) {
            duplicates.push(id);
          }
        });
        
        if (duplicates.length > 0) {
          console.error("Duplicate task IDs:", [...new Set(duplicates)]);
        }
        
        // Try to recover by using the original list
        toast.error("Error in reordering. Using original task order.");
        setLocalFilteredTasks(filteredTasks);
        pendingTasksRef.current = null;
        setIsSaving(false);
        return;
      }
      
      // Build the reordered complete task list (not just IDs)
      const reorderedTaskObjects = reorderedCompleteList.map(id => 
        allTasks.find(t => t.id === id)
      ).filter(Boolean) as Task[];
      
      console.log("Reordered task objects:", reorderedTaskObjects.map(t => t.title));
      
      // Update the store (without waiting, but catch errors)
      reorderTasks(
        draggableId,
        source.index,
        destination.index,
        reorderedCompleteList
      );
      
      // Save the updated order to Supabase
      console.log("Saving reordered tasks to Supabase...");
      
      const saveSuccess = await saveTasksOrder(reorderedTaskObjects);
      if (saveSuccess) {
        console.log("Successfully saved task order to Supabase");
        toast.success("Task order updated");
      } else {
        console.error("Failed to save task order to Supabase");
        toast.error("Failed to save task order to database");
        // Revert the optimistic update on failure
        setLocalFilteredTasks(filteredTasks);
      }
      
      console.log("Reordering operation completed");
    } catch (error) {
      console.error("Error during drag and drop:", error);
      // Revert the optimistic update
      console.log("Reverting to previous filtered tasks state");
      setLocalFilteredTasks(filteredTasks);
      toast.error("Failed to update task position. Please try again.");
    } finally {
      // Clear pending tasks after the operation is complete
      setTimeout(() => {
        pendingTasksRef.current = null;
        setIsSaving(false);
      }, 0);
    }
  }, [localFilteredTasks, filteredTasks, allTasks, reorderTasks]);

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks-list">
          {(provided, snapshot) => (
            <div 
              className={`space-y-4 p-2 rounded-lg min-h-[100px] transition-colors ${
                snapshot.isDraggingOver ? "bg-accent/20" : ""
              } ${isSaving ? "opacity-70" : ""}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {localFilteredTasks.length > 0 ? (
                <AnimatePresence mode="sync">
                  {localFilteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-4 transition-opacity ${
                            snapshot.isDragging ? "opacity-80" : ""
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <TaskCard key={task.id} task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
              ) : (
                <TaskEmptyState hasTasksInStore={totalTasksCount > 0} />
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TaskListContainer;
