
import { useTaskStore } from "@/lib/store";
import { Priority, Task } from "@/lib/types";
import { PriorityBadge, priorityColors } from "./TaskBadges";
import TaskCard from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowDown, CircleDot } from "lucide-react";
import TaskEmptyState from "./TaskEmptyState";

interface TaskPriorityGroupProps {
  title: string;
  tasks: Task[];
  priority: Priority;
  icon: React.ReactNode;
}

const TaskPriorityGroup = ({ title, tasks, priority, icon }: TaskPriorityGroupProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <PriorityBadge priority={priority} disabled />
        <span className="text-muted-foreground ml-2">({tasks.length})</span>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TaskPriorityGroupView = () => {
  const { tasks } = useTaskStore();
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = tasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = tasks.filter(task => task.priority === "low");
  
  // Check if there are any tasks
  const hasTasks = tasks.length > 0;

  return (
    <div>
      {hasTasks ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      ) : (
        <TaskEmptyState hasTasksInStore={false} />
      )}
    </div>
  );
};

export default TaskPriorityGroupView;
