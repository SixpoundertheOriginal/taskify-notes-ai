
import { Button } from "@/components/ui/button";
import { Save, XCircle } from "lucide-react";

interface TaskEditControlsProps {
  onSave: () => void;
  onCancel: () => void;
}

const TaskEditControls = ({ onSave, onCancel }: TaskEditControlsProps) => {
  return (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="h-8 px-2 text-xs"
      >
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        className="h-8 px-2 text-xs"
      >
        <Save className="h-3.5 w-3.5 mr-1" />
        Save
      </Button>
    </div>
  );
};

export default TaskEditControls;
