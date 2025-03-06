
import { useTaskStore } from "@/lib/store";
import { Priority, Task } from "@/lib/types";
import { PriorityBadge } from "./TaskBadges";
import TaskCard from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowDown, CircleDot } from "lucide-react";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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
  
  // Add local state to track optimistic UI updates
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  // Group tasks by priority - now using localTasks for rendering
  const highPriorityTasks = localTasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = localTasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = localTasks.filter(task => task.priority === "low");
  
  // Update local tasks when store tasks change
  // This effect ensures our local state is up-to-date with the store
  // outside of drag/drop operations
  useCallback(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  
  // Check if there are any tasks
  const hasTasks = localTasks.length > 0;

  // Handle drag and drop operations with optimistic updates
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination, return
    if (!destination) {
      return;
    }
    
    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // Extract priority information from droppableIds
    const sourcePriorityString = source.droppableId.split('-')[1] as Priority;
    const destPriorityString = destination.droppableId.split('-')[1] as Priority;
    
    // Find the task being dragged
    const draggedTask = localTasks.find(task => task.id === draggableId);
    if (!draggedTask) {
      console.error("Could not find task with ID:", draggableId);
      return;
    }
    
    // Create a deep copy of current tasks for optimistic update
    const newLocalTasks = [...localTasks];
    
    try {
      // Apply optimistic update to local state first
      if (sourcePriorityString === destPriorityString) {
        // Same priority group - reordering within the group
        
        // Get tasks in this priority group
        const tasksInPriority = newLocalTasks.filter(task => 
          task.priority === sourcePriorityString
        );
        
        // Create new order for the priority group
        const updatedTasksInPriority = [...tasksInPriority];
        
        // Remove the task from its current position
        const [removedTask] = updatedTasksInPriority.splice(source.index, 1);
        
        // Insert the task at its new position
        updatedTasksInPriority.splice(destination.index, 0, removedTask);
        
        // Update all tasks with the new priority group order
        const updatedTasks = newLocalTasks.map(task => {
          if (task.priority === sourcePriorityString) {
            // Replace all tasks in this priority with the reordered ones
            const indexInPriorityGroup = updatedTasksInPriority.findIndex(t => t.id === task.id);
            if (indexInPriorityGroup !== -1) {
              return updatedTasksInPriority[indexInPriorityGroup];
            }
          }
          return task;
        });
        
        // Update local state immediately
        setLocalTasks(updatedTasks);
        
        // Create the list of task IDs in the new order
        const newTaskIds = updatedTasksInPriority.map(task => task.id);
        
        // Update the store (in background)
        reorderTasksInPriorityGroup(
          draggableId,
          sourcePriorityString,
          source.index,
          destination.index,
          newTaskIds
        );
      } else {
        // Moving between different priority groups
        
        // Create a new version of the task with updated priority
        const updatedTask = { ...draggedTask, priority: destPriorityString };
        
        // Create new local tasks array for the update
        const updatedTasks = newLocalTasks.map(task => 
          task.id === draggableId ? updatedTask : task
        );
        
        // Update local state immediately
        setLocalTasks(updatedTasks);
        
        // Update the store (in background)
        moveTaskBetweenLists(
          draggableId,
          sourcePriorityString,
          destPriorityString,
          source.index,
          destination.index
        );
      }
    } catch (error) {
      // If an error occurs, revert to the previous state
      console.error("Error during drag and drop:", error);
      setLocalTasks(tasks); // Revert to the store state
      
      // Show error notification
      toast.error("Failed to update task position. Please try again.");
    }
  }, [localTasks, tasks, reorderTasksInPriorityGroup, moveTaskBetweenLists]);

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
