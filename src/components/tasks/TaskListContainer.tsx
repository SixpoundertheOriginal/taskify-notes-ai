
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { toast } from "sonner";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { updateTaskPriority } = useTaskStore();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // No change in position
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }
    
    // Get the task that was dragged
    const draggedTask = filteredTasks[source.index];
    if (!draggedTask) {
      console.error("Dragged task not found:", source.index, filteredTasks);
      return;
    }
    
    console.log("Drag operation:", {
      task: draggedTask.title,
      sourceIndex: source.index,
      destinationIndex: destination.index,
      tasksList: filteredTasks.map(t => t.title)
    });
    
    // When task is moved to the top third of the list
    if (destination.index < Math.floor(filteredTasks.length / 3)) {
      if (draggedTask.priority !== 'high') {
        updateTaskPriority(draggedTask.id, 'high');
        toast.success(`"${draggedTask.title}" priority updated to high`);
      }
    } 
    // When task is moved to the middle third of the list
    else if (destination.index < Math.floor(filteredTasks.length * 2 / 3)) {
      if (draggedTask.priority !== 'medium') {
        updateTaskPriority(draggedTask.id, 'medium');
        toast.success(`"${draggedTask.title}" priority updated to medium`);
      }
    } 
    // When task is moved to the bottom third of the list
    else {
      if (draggedTask.priority !== 'low') {
        updateTaskPriority(draggedTask.id, 'low');
        toast.success(`"${draggedTask.title}" priority updated to low`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="task-list" type="TASK">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 p-2 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/30' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-all ${snapshot.isDragging ? "opacity-80 scale-105" : ""}`}
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
