
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TaskEmptyStateProps {
  hasTasksInStore: boolean;
}

const TaskEmptyState = ({ hasTasksInStore }: TaskEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="flex justify-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasTasksInStore
          ? "Try adjusting your search or filters"
          : "Start by creating your first task"}
      </p>
    </motion.div>
  );
};

export default TaskEmptyState;
