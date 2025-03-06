
import { useTaskStore } from "@/lib/store";
import { Priority, Task } from "@/lib/types";
import { PriorityBadge } from "./TaskBadges";
import TaskCard from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowDown, CircleDot } from "lucide-react";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback } from "react";

interface TaskPriorityGroupProps {
  title: string;
  tasks: Task[];
  priority: Priority;
  icon: React.ReactNode;
  onDragEnd: (result: DropResult) => void;
}

const TaskPriorityGroup = ({ title, tasks, priority, icon, onDragEnd }: TaskPriorityGroupProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <PriorityBadge priority={priority} disabled />
        <span className="text-muted-foreground ml-2">({tasks.length})</span>
      </div>
      
      <Droppable droppableId={`priority-${priority}`}>
        {(provided, snapshot) => (
          <div 
            className={`space-y-4 p-2 rounded-lg min-h-[80px] transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/20" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <AnimatePresence mode="sync">
              {tasks.map((task, index) => (
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
    </div>
  );
};

const TaskPriorityGroupView = () => {
  const { tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists } = useTaskStore();
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = tasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = tasks.filter(task => task.priority === "low");
  
  // Check if there are any tasks
  const hasTasks = tasks.length > 0;

  // Handle drag and drop operations
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped in the same position within the same list
    if (!destination) {
      return;
    }
    
    // Extract priority information from droppableIds
    const sourcePriorityString = source.droppableId.split('-')[1] as Priority;
    const destPriorityString = destination.droppableId.split('-')[1] as Priority;
    
    // If dropping in the same list and same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // If moving within the same priority group, use the existing reordering logic
    if (sourcePriorityString === destPriorityString) {
      // Get all tasks in this priority group
      const tasksInPriority = tasks.filter(task => task.priority === sourcePriorityString);
      
      // Create a list of all task IDs in this priority
      const allTaskIdsInPriority = tasksInPriority.map(task => task.id);
      
      // Create the new order by moving the dragged task
      const newTaskIds = [...allTaskIdsInPriority];
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      
      // Call the store's reordering function
      reorderTasksInPriorityGroup(
        draggableId,
        sourcePriorityString,
        source.index,
        destination.index,
        newTaskIds
      );
    } else {
      // Moving between different priority groups
      moveTaskBetweenLists(
        draggableId,
        sourcePriorityString,
        destPriorityString,
        source.index,
        destination.index
      );
    }
  }, [tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists]);

  // If no tasks, show empty state
  if (!hasTasks) {
    return <TaskEmptyState hasTasksInStore={false} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <TaskPriorityGroup
          title="High Priority"
          tasks={highPriorityTasks}
          priority="high"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          onDragEnd={handleDragEnd}
        />
        
        <TaskPriorityGroup
          title="Medium Priority"
          tasks={mediumPriorityTasks}
          priority="medium"
          icon={<CircleDot className="h-5 w-5 text-yellow-500" />}
          onDragEnd={handleDragEnd}
        />
        
        <TaskPriorityGroup
          title="Low Priority"
          tasks={lowPriorityTasks}
          priority="low"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
          onDragEnd={handleDragEnd}
        />
      </DragDropContext>
    </motion.div>
  );
};

export default TaskPriorityGroupView;
