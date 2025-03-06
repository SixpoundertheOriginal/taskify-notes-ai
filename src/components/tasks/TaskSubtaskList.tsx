
import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Subtask } from "@/lib/types";
import { Save, X, Plus } from "lucide-react";

interface TaskSubtaskListProps {
  taskId: string;
  subtasks?: Subtask[];
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string, e: React.MouseEvent) => void;
}

const TaskSubtaskList = ({
  taskId,
  subtasks = [],
  onToggleSubtask,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: TaskSubtaskListProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const editSubtaskRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSubtaskId && editSubtaskRef.current) {
      editSubtaskRef.current.focus();
    }
  }, [editingSubtaskId]);

  // Handle click outside to save subtask edits
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingSubtaskId && 
        editSubtaskRef.current && 
        !editSubtaskRef.current.contains(event.target as Node)
      ) {
        handleSaveSubtaskEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingSubtaskId, editingSubtaskTitle]);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newSubtaskTitle.trim()) {
      onAddSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      if (subtaskInputRef.current) {
        subtaskInputRef.current.focus();
      }
    }
  };

  const startEditingSubtask = (subtask: Subtask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const handleSaveSubtaskEdit = () => {
    if (editingSubtaskId && editingSubtaskTitle.trim()) {
      onUpdateSubtask(taskId, editingSubtaskId, editingSubtaskTitle);
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <h4 className="text-sm font-medium mb-2">Subtasks</h4>
      
      <div className="space-y-2">
        {subtasks.length > 0 ? (
          <ul className="space-y-2">
            {subtasks.map((subtask) => (
              <li key={subtask.id} className="flex items-start gap-2">
                <Checkbox
                  id={`subtask-${subtask.id}`}
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(taskId, subtask.id)}
                  className="mt-1"
                />
                
                {editingSubtaskId === subtask.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      ref={editSubtaskRef}
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveSubtaskEdit();
                        if (e.key === "Escape") {
                          setEditingSubtaskId(null);
                          setEditingSubtaskTitle("");
                        }
                      }}
                      className="flex-1 h-7 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveSubtaskEdit();
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start justify-between">
                    <span 
                      className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                      onClick={(e) => !subtask.completed && startEditingSubtask(subtask, e)}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2"
                      onClick={(e) => onDeleteSubtask(taskId, subtask.id, e)}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No subtasks yet</p>
        )}
        
        <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
          <Input
            ref={subtaskInputRef}
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Add a new subtask"
            className="flex-1 h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <Button 
            type="submit" 
            variant="outline" 
            size="sm"
            className="h-8"
            disabled={!newSubtaskTitle.trim()}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TaskSubtaskList;
