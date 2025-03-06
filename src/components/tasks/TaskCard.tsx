
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, Trash, Edit, XCircle, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const { toggleTaskCompletion, updateTask, deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority);
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Handle click outside to save changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingField === "title" && 
        titleRef.current && 
        !titleRef.current.contains(event.target as Node)
      ) {
        saveField("title");
      } else if (
        editingField === "description" && 
        descriptionRef.current && 
        !descriptionRef.current.contains(event.target as Node)
      ) {
        saveField("description");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingField, editedTitle, editedDescription]);

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (editingField === "title" && titleRef.current) {
      titleRef.current.focus();
    } else if (editingField === "description" && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [editingField]);

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      dueDate: editedDueDate?.toISOString(),
    });
    setIsEditing(false);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setEditedPriority(task.priority);
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
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
    } else if (field === "dueDate") {
      updateData.dueDate = editedDueDate?.toISOString();
    }

    if (Object.keys(updateData).length > 0) {
      updateTask(task.id, updateData);
    }
    
    setEditingField(null);
  };

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
        className={`glass-card overflow-hidden ${task.completed ? "opacity-70" : "opacity-100"} transition-all duration-200 hover:shadow-md cursor-pointer`}
        onClick={toggleExpand}
      >
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
                {editingField === "title" ? (
                  <Input
                    ref={titleRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("title");
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="font-medium text-foreground"
                    placeholder="Task title"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 
                    className={`font-medium text-foreground ${task.completed ? "line-through text-muted-foreground" : ""} cursor-text`}
                    onClick={(e) => !task.completed && startEditing("title", e)}
                  >
                    {task.title}
                  </h3>
                )}
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
                  >
                    {editingField === "description" ? (
                      <Textarea
                        ref={descriptionRef}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) saveField("description");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="text-sm text-muted-foreground resize-none mt-2"
                        placeholder="Add a description..."
                        rows={3}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      task.description ? (
                        <p 
                          className={`text-sm text-muted-foreground mt-2 ${task.completed ? "line-through" : ""} cursor-text`}
                          onClick={(e) => !task.completed && startEditing("description", e)}
                        >
                          {task.description}
                        </p>
                      ) : (
                        !task.completed && (
                          <p 
                            className="text-sm text-muted-foreground mt-2 italic cursor-text" 
                            onClick={(e) => startEditing("description", e)}
                          >
                            Add a description...
                          </p>
                        )
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-wrap items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                {editingField === "priority" ? (
                  <Select
                    value={editedPriority}
                    onValueChange={(value: string) => {
                      setEditedPriority(value as Priority);
                      // Auto-save when priority is changed
                      setTimeout(() => saveField("priority"), 100);
                    }}
                    onOpenChange={(open) => {
                      if (!open && editingField === "priority") {
                        saveField("priority");
                      }
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge 
                    className={`${priorityColors[task.priority]} cursor-pointer`}
                    onClick={(e) => !task.completed && startEditing("priority", e)}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                )}
                
                {editingField === "dueDate" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-normal"
                      >
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        {editedDueDate ? format(editedDueDate, "MMM d, yyyy") : "Set date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={editedDueDate}
                        onSelect={(date) => {
                          setEditedDueDate(date);
                          // Auto-save when date is selected
                          setTimeout(() => saveField("dueDate"), 100);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  task.dueDate ? (
                    <div 
                      className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
                      onClick={(e) => !task.completed && startEditing("dueDate", e)}
                    >
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    !task.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => startEditing("dueDate", e)}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Add date
                      </Button>
                    )
                  )
                )}
                
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
            >
              <CardFooter className="p-4 pt-0 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-2 text-xs"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="h-8 px-2 text-xs"
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isEditing && (
          <CardFooter className="p-4 pt-0 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8 px-2 text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              className="h-8 px-2 text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default TaskCard;
