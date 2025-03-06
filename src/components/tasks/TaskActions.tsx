
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface TaskActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const TaskActions = ({ onEdit, onDelete }: TaskActionsProps) => {
  return (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="h-8 px-2 text-xs"
      >
        <Edit className="h-3.5 w-3.5 mr-1" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="h-8 px-2 text-xs"
      >
        <Trash className="h-3.5 w-3.5 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default TaskActions;
