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
  
  const previousStateRef = useRef<Task[]>(filteredTasks);
  
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
      const previousState = [...localFilteredTasks];
      previousStateRef.current = previousState;
      
      const newLocalFilteredTasks = [...localFilteredTasks];
      const [removedTask] = newLocalFilteredTasks.splice(source.index, 1);
      
      if (!removedTask) {
        console.error("Could not find task at source index:", source.index);
        return;
      }
      
      setTimeout(() => {
        newLocalFilteredTasks.splice(destination.index, 0, removedTask);
        setLocalFilteredTasks(newLocalFilteredTasks);
        setIsSaving(true);
      }, 50);
      
      const filteredTaskIds = newLocalFilteredTasks.map(task => task.id);
      const filteredIdsSet = new Set(filteredTaskIds);
      const allTaskIds = allTasks.map(task => task.id);
      
      const reorderedCompleteList = allTaskIds
        .filter(id => !filteredIdsSet.has(id));
      
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
      
      reorderTasks(
        draggableId,
        source.index,
        destination.index,
        reorderedCompleteList
      );
      
      saveTasksOrder(allTasks)
        .catch(error => {
          console.error("Background save failed:", error);
          setLocalFilteredTasks(previousStateRef.current);
          reorderTasks(
            draggableId,
            destination.index,
            source.index,
            allTaskIds
          );
          toast.error("Failed to save task order");
        });
      
    } catch (error) {
      console.error("Error during drag and drop:", error);
      setLocalFilteredTasks(previousStateRef.current);
      toast.error("Failed to update task position");
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 200);
    }
  }, [localFilteredTasks, allTasks, reorderTasks]);

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks-list">
          {(provided, snapshot) => (
            <div 
              className={`space-y-4 p-2 rounded-lg min-h-[100px] transition-all duration-200 ${
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
                          className={`mb-4 transition-all duration-200 ease-out ${
                            snapshot.isDragging ? "opacity-80" : ""
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            transition: snapshot.isDragging 
                              ? undefined 
                              : 'transform 0.2s ease-out'
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
