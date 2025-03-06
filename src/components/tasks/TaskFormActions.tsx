
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  onCancel: () => void;
}

const TaskFormActions = ({ onCancel }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit">Create Task</Button>
    </div>
  );
};

export default TaskFormActions;
