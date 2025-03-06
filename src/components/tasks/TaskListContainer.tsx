import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { useTaskStore } from "@/lib/store";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { tasks: allTasks, reorderTasks } = useTaskStore();
  
  const [localFilteredTasks, setLocalFilteredTasks] = useState<Task[]>(filteredTasks);
  
  useEffect(() => {
    setLocalFilteredTasks(filteredTasks);
  }, [filteredTasks]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    try {
      const newLocalFilteredTasks = [...localFilteredTasks];
      
      const [removedTask] = newLocalFilteredTasks.splice(source.index, 1);
      
      newLocalFilteredTasks.splice(destination.index, 0, removedTask);
      
      setLocalFilteredTasks(newLocalFilteredTasks);
      
      const taskIdToFullListIndex = new Map();
      allTasks.forEach((task, index) => {
        taskIdToFullListIndex.set(task.id, index);
      });
      
      const filteredTaskIds = newLocalFilteredTasks.map(task => task.id);
      
      const filteredIdsSet = new Set(filteredTaskIds);
      
      const allTaskIds = allTasks.map(task => task.id);
      
      const reorderedCompleteList = [];
      
      for (const taskId of allTaskIds) {
        if (filteredIdsSet.has(taskId)) {
          continue;
        } else {
          reorderedCompleteList.push(taskId);
        }
      }
      
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
        
        reorderedCompleteList.splice(insertionIndex, 0, filteredId);
      }
      
      reorderTasks(
        draggableId,
        source.index,
        destination.index,
        reorderedCompleteList
      );
    } catch (error) {
      console.error("Error during drag and drop:", error);
      setLocalFilteredTasks(filteredTasks);
      toast.error("Failed to update task position. Please try again.");
    }
  }, [localFilteredTasks, filteredTasks, allTasks, reorderTasks]);

  return (
    <div className="space-y-4">
      {localFilteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks-list">
            {(provided, snapshot) => (
              <div 
                className={`space-y-4 p-2 rounded-lg min-h-[100px] transition-colors ${
                  snapshot.isDraggingOver ? "bg-accent/20" : ""
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <TaskEmptyState hasTasksInStore={totalTasksCount > 0} />
      )}
    </div>
  );
};

export default TaskListContainer;
