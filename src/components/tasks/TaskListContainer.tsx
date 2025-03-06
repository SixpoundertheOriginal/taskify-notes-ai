
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
  
  // Store the previous state for rollback on error
  const previousStateRef = useRef<Task[]>(filteredTasks);
  
  // Update local state when filtered tasks change, but not during drag operations
  useEffect(() => {
    if (!isSaving) {
      setLocalFilteredTasks(filteredTasks);
      previousStateRef.current = filteredTasks;
    }
  }, [filteredTasks, isSaving]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    try {
      // Store current state for potential rollback
      const previousState = [...localFilteredTasks];
      previousStateRef.current = previousState;
      
      // Create optimistic update
      const newLocalFilteredTasks = [...localFilteredTasks];
      const [removedTask] = newLocalFilteredTasks.splice(source.index, 1);
      
      if (!removedTask) {
        console.error("Could not find task at source index:", source.index);
        return;
      }
      
      // Apply optimistic update immediately
      newLocalFilteredTasks.splice(destination.index, 0, removedTask);
      setLocalFilteredTasks(newLocalFilteredTasks);
      setIsSaving(true);
      
      // Create reordered complete list maintaining order of non-filtered tasks
      const filteredTaskIds = newLocalFilteredTasks.map(task => task.id);
      const filteredIdsSet = new Set(filteredTaskIds);
      const allTaskIds = allTasks.map(task => task.id);
      
      const reorderedCompleteList = allTaskIds
        .filter(id => !filteredIdsSet.has(id));
      
      // Insert filtered tasks at their new positions
      for (const filteredId of filteredTaskIds) {
        const filteredIndex = filteredTaskIds.indexOf(filteredId);
        let insertionIndex = 0;
        
        if (filteredIndex > 0) {
          const previousFilteredId = filteredTaskIds[filteredIndex - 1];
          const previousIndex = reorderedCompleteList.indexOf(previousFilteredId);
          insertionIndex = previousIndex !== -1 ? previousIndex + 1 : 0;
        }
        
        reorderedCompleteList.splice(insertionIndex, 0, filteredId);
      }
      
      // Update store immediately for smooth transitions
      reorderTasks(
        draggableId,
        source.index,
        destination.index,
        reorderedCompleteList
      );
      
      // Send update to backend without blocking UI
      const savePromise = saveTasksOrder(allTasks);
      
      // Use EdgeRuntime.waitUntil for background processing if available
      if (typeof EdgeRuntime !== 'undefined') {
        EdgeRuntime.waitUntil(savePromise);
      } else {
        // If not in edge runtime, handle normally but still don't block UI
        savePromise.catch(error => {
          console.error("Background save failed:", error);
          // Revert to previous state on error
          setLocalFilteredTasks(previousStateRef.current);
          reorderTasks(
            draggableId,
            destination.index,
            source.index,
            allTaskIds
          );
          toast.error("Failed to save task order");
        });
      }
      
    } catch (error) {
      console.error("Error during drag and drop:", error);
      // Revert to previous state on error
      setLocalFilteredTasks(previousStateRef.current);
      toast.error("Failed to update task position");
    } finally {
      // Clear saving state after a short delay to ensure smooth transition
      setTimeout(() => {
        setIsSaving(false);
      }, 100);
    }
  }, [localFilteredTasks, allTasks, reorderTasks]);

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
