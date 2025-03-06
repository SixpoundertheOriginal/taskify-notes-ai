
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Trash, Edit, XCircle, Save } from "lucide-react";
import { Task } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className={`glass-card overflow-hidden ${task.completed ? "opacity-70" : "opacity-100"}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="mt-1"
            />
            
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-medium text-foreground"
                    placeholder="Task title"
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="text-sm text-muted-foreground resize-none"
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className={`font-medium text-foreground ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm text-muted-foreground ${task.completed ? "line-through" : ""}`}>
                      {task.description}
                    </p>
                  )}
                </>
              )}
              
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
        
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
