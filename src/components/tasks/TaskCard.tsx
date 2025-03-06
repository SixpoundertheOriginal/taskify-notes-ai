
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Trash, Edit, XCircle, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setIsEditing(false);
  };

  const toggleExpand = () => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
    }
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
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-medium text-foreground"
                    placeholder="Task title"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className={`font-medium text-foreground ${task.completed ? "line-through text-muted-foreground" : ""}`}>
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
                {(isExpanded || isEditing) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isEditing ? (
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="text-sm text-muted-foreground resize-none mt-2"
                        placeholder="Add a description..."
                        rows={3}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      task.description && (
                        <p className={`text-sm text-muted-foreground mt-2 ${task.completed ? "line-through" : ""}`}>
                          {task.description}
                        </p>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge className={`${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
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
          {isExpanded && !isEditing && (
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
