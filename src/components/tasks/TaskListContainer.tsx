
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { useTaskStore } from "@/lib/store";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback } from "react";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { reorderTasks } = useTaskStore();

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get all task IDs in their current order
    const taskIds = filteredTasks.map(task => task.id);
    
    // Create a new array with the updated order
    const newTaskIds = [...taskIds];
    const [movedTaskId] = newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, movedTaskId);
    
    // Update the store with new order
    // Use the stable draggableId instead of relying on the index
    reorderTasks(
      draggableId, // Using the draggableId (task ID) instead of referencing by index
      source.index,
      destination.index,
      newTaskIds
    );
  }, [filteredTasks, reorderTasks]);

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
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
                  {filteredTasks.map((task, index) => (
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
