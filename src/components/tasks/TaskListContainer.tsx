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
  const pendingTasksRef = useRef<Task[] | null>(null);
  
  // Prevent filtered tasks updates during drag operation
  useEffect(() => {
    if (!isSaving && !pendingTasksRef.current) {
      setLocalFilteredTasks(filteredTasks);
    }
  }, [filteredTasks, isSaving]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Early return conditions
    if (!destination) {
      pendingTasksRef.current = null;
      return;
    }
    
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      pendingTasksRef.current = null;
      return;
    }
    
    try {
      // Create a new copy of the filtered tasks for the optimistic update
      const newLocalFilteredTasks = [...localFilteredTasks];
      const [removedTask] = newLocalFilteredTasks.splice(source.index, 1);
      
      if (!removedTask) {
        console.error("Could not find task at source index:", source.index);
        pendingTasksRef.current = null;
        return;
      }
      
      // Insert the task at the destination immediately
      newLocalFilteredTasks.splice(destination.index, 0, removedTask);
      
      // Store the pending tasks in the ref BEFORE any state updates
      pendingTasksRef.current = newLocalFilteredTasks;
      
      // Set saving state to prevent filtered tasks updates
      setIsSaving(true);
      
      // Immediately update local state for smooth visual transition
      setLocalFilteredTasks(newLocalFilteredTasks);
      
      // Create reordered complete list with optimistic update
      const taskIdToFullListIndex = new Map();
      allTasks.forEach((task, index) => taskIdToFullListIndex.set(task.id, index));
      
      const filteredTaskIds = newLocalFilteredTasks.map(task => task.id);
      const filteredIdsSet = new Set(filteredTaskIds);
      const allTaskIds = allTasks.map(task => task.id);
      
      // Build the reordered list maintaining the order of non-filtered tasks
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
      
      // Save to backend without blocking the UI
      await saveTasksOrder(allTasks);
      
    } catch (error) {
      console.error("Error during drag and drop:", error);
      // Revert optimistic update on error
      setLocalFilteredTasks(filteredTasks);
      toast.error("Failed to update task position");
    } finally {
      // Clear pending state after a short delay to ensure smooth transition
      setTimeout(() => {
        pendingTasksRef.current = null;
        setIsSaving(false);
      }, 100);
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
