
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, ChevronDown, ChevronUp, Bell, Calendar } from "lucide-react";
import { Task, Priority, Status } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TaskEditableTitle, 
  TaskEditableDescription
} from "./TaskEditableField";
import { 
  SafeTaskEditablePriority, 
  SafeTaskEditableStatus,
  SafeTaskEditableDate,
  SafeTaskEditableReminder
} from "./TaskEditableWrapper";
import TaskSubtaskList from "./TaskSubtaskList";
import TaskActions from "./TaskActions";
import TaskEditControls from "./TaskEditControls";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const { 
    toggleTaskCompletion, 
    updateTask, 
    deleteTask, 
    addSubtask, 
    toggleSubtaskCompletion, 
    updateSubtask, 
    deleteSubtask 
  } = useTaskStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority);
  const [editedStatus, setEditedStatus] = useState<Status>(task.status || "todo");
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [editedReminderTime, setEditedReminderTime] = useState<Date | undefined>(
    task.reminderTime ? new Date(task.reminderTime) : undefined
  );

  // Handle click outside to save changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingField === "title" || editingField === "description") {
        const target = event.target as Node;
        const isClickOutside = !document.querySelector(`[data-field="${editingField}"]`)?.contains(target);
        
        if (isClickOutside) {
          saveField(editingField);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingField, editedTitle, editedDescription]);

  const getPriorityStyles = (priority: Priority) => {
    switch(priority) {
      case "high":
        return {
          indicator: "bg-red-500",
          text: "text-red-500",
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-300 dark:border-red-800"
        };
      case "medium":
        return {
          indicator: "bg-yellow-500",
          text: "text-yellow-500",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-300 dark:border-yellow-800"
        };
      case "low":
        return {
          indicator: "bg-blue-500",
          text: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-300 dark:border-blue-800"
        };
      default:
        return {
          indicator: "bg-slate-500",
          text: "text-slate-500",
          bg: "bg-slate-50 dark:bg-slate-900/20",
          border: "border-slate-300 dark:border-slate-800"
        };
    }
  };

  const getStatusIndicator = (status: Status) => {
    if (status === "in-progress") {
      return <div className="status-pulse pulse-animation bg-amber-400"></div>;
    }
    return null;
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      status: editedStatus,
      dueDate: editedDueDate?.toISOString(),
      reminderTime: editedReminderTime?.toISOString(),
    });
    setIsEditing(false);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setEditedPriority(task.priority);
    setEditedStatus(task.status || "todo");
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setEditedReminderTime(task.reminderTime ? new Date(task.reminderTime) : undefined);
    setIsEditing(false);
    setEditingField(null);
  };

  const toggleExpand = () => {
    if (!editingField) {
      setIsExpanded(!isExpanded);
    }
  };

  const startEditing = (field: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(true);
    setEditingField(field);
  };

  const saveField = (field: string) => {
    if (field === "title" && editedTitle.trim() === "") {
      setEditedTitle(task.title);
      setEditingField(null);
      return;
    }

    let updateData: Partial<Task> = {};
    
    if (field === "title") {
      updateData.title = editedTitle;
    } else if (field === "description") {
      updateData.description = editedDescription;
    } else if (field === "priority") {
      updateData.priority = editedPriority;
    } else if (field === "status") {
      updateData.status = editedStatus;
      if (editedStatus === "completed") {
        updateData.completed = true;
      } else {
        updateData.completed = false;
      }
    } else if (field === "dueDate") {
      updateData.dueDate = editedDueDate?.toISOString();
    } else if (field === "reminderTime") {
      updateData.reminderTime = editedReminderTime?.toISOString();
    }

    if (Object.keys(updateData).length > 0) {
      updateTask(task.id, updateData);
    }
    
    setEditingField(null);
  };

  const priorityStyles = getPriorityStyles(task.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card 
        className={`relative glass-card overflow-hidden ${task.completed ? "opacity-70" : "opacity-100"} 
          transition-all duration-200 hover:shadow-md ${isDragging ? 'shadow-lg' : ''}`}
        onClick={toggleExpand}
      >
        {/* Priority indicator */}
        <div className={`priority-indicator ${priorityStyles.indicator}`}></div>
        
        {/* Status indicator for in-progress tasks */}
        {getStatusIndicator(task.status)}
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
                className="mt-1"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div data-field="title">
                  <TaskEditableTitle
                    value={editedTitle}
                    isEditing={editingField === "title"}
                    isCompleted={task.completed}
                    onChange={setEditedTitle}
                    onStartEditing={(e) => startEditing("title", e)}
                    onSave={() => saveField("title")}
                    onCancel={handleCancelEdit}
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()} className="ml-2 flex-shrink-0">
                  {isExpanded ? 
                    <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
              </div>
              
              <AnimatePresence>
                {(isExpanded || editingField) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={isExpanded ? "animate-expand" : ""}
                    data-field="description"
                  >
                    <TaskEditableDescription
                      value={editedDescription}
                      isEditing={editingField === "description"}
                      isCompleted={task.completed}
                      onChange={setEditedDescription}
                      onStartEditing={(e) => startEditing("description", e)}
                      onSave={() => saveField("description")}
                      onCancel={handleCancelEdit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-wrap items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <SafeTaskEditablePriority
                  value={editedPriority}
                  isEditing={editingField === "priority"}
                  isCompleted={task.completed}
                  onChange={setEditedPriority}
                  onStartEditing={(e) => startEditing("priority", e)}
                  onSave={() => saveField("priority")}
                />
                
                <SafeTaskEditableStatus
                  value={editedStatus}
                  isEditing={editingField === "status"}
                  isCompleted={task.completed}
                  onChange={setEditedStatus}
                  onStartEditing={(e) => startEditing("status", e)}
                  onSave={() => saveField("status")}
                />
                
                <SafeTaskEditableDate
                  value={editedDueDate}
                  isEditing={editingField === "dueDate"}
                  isCompleted={task.completed}
                  onChange={setEditedDueDate}
                  onStartEditing={(e) => startEditing("dueDate", e)}
                  onSave={() => saveField("dueDate")}
                />
                
                <SafeTaskEditableReminder
                  value={editedReminderTime}
                  isEditing={editingField === "reminderTime"}
                  isCompleted={task.completed}
                  onChange={setEditedReminderTime}
                  onStartEditing={(e) => startEditing("reminderTime", e)}
                  onSave={() => saveField("reminderTime")}
                />
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <AnimatePresence>
          {isExpanded && !editingField && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="animate-expand"
            >
              {/* Subtasks section */}
              <div className="px-6 pb-4">
                <TaskSubtaskList
                  taskId={task.id}
                  subtasks={task.subtasks}
                  onToggleSubtask={toggleSubtaskCompletion}
                  onAddSubtask={addSubtask}
                  onUpdateSubtask={updateSubtask}
                  onDeleteSubtask={deleteSubtask}
                />
              </div>

              <CardFooter className="p-4 pt-0">
                <TaskActions
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => deleteTask(task.id)}
                />
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isEditing && (
          <CardFooter className="p-4 pt-0">
            <TaskEditControls
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default TaskCard;
