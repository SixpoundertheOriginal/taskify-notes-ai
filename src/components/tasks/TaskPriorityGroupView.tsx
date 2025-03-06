
import { motion } from "framer-motion";
import { AlertCircle, ArrowDown, CircleDot } from "lucide-react";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext } from "react-beautiful-dnd";
import TaskPriorityGroup from "./TaskPriorityGroup";
import { useTaskPriorityDnd } from "@/hooks/use-task-priority-dnd";

const TaskPriorityGroupView = () => {
  const {
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    hasTasks,
    handleDragEnd
  } = useTaskPriorityDnd();

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
        />
        
        <TaskPriorityGroup
          title="Medium Priority"
          tasks={mediumPriorityTasks}
          priority="medium"
          icon={<CircleDot className="h-5 w-5 text-yellow-500" />}
        />
        
        <TaskPriorityGroup
          title="Low Priority"
          tasks={lowPriorityTasks}
          priority="low"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
        />
      </DragDropContext>
    </motion.div>
  );
};

export default TaskPriorityGroupView;
