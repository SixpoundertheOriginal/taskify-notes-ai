
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
import { useTaskStore } from "@/lib/store";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { updateTaskPriority } = useTaskStore();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside the list or same position
    if (!destination || 
       (source.droppableId === destination.droppableId && 
        source.index === destination.index)) {
      return;
    }
    
    // In list view, we don't reorder tasks but we can 
    // still update priority based on vertical position
    // This is just a simple implementation - the higher in the list, the higher priority
    const draggedTask = filteredTasks[source.index];
    
    // When task is moved to the top third of the list
    if (destination.index < Math.floor(filteredTasks.length / 3)) {
      if (draggedTask.priority !== 'high') {
        updateTaskPriority(draggedTask.id, 'high');
      }
    } 
    // When task is moved to the middle third of the list
    else if (destination.index < Math.floor(filteredTasks.length * 2 / 3)) {
      if (draggedTask.priority !== 'medium') {
        updateTaskPriority(draggedTask.id, 'medium');
      }
    } 
    // When task is moved to the bottom third of the list
    else {
      if (draggedTask.priority !== 'low') {
        updateTaskPriority(draggedTask.id, 'low');
      }
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="task-list">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 p-2 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/30' : ''
                }`}
              >
                <AnimatePresence>
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? "opacity-80" : ""}`}
                        >
                          <div className="flex items-start">
                            <div 
                              {...provided.dragHandleProps}
                              className="mt-6 mr-2 p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <TaskCard key={task.id} task={task} />
                            </div>
                          </div>
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
