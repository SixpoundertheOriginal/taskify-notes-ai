
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Priority } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAiTaskParser } from "@/hooks/use-ai-task-parser";
import AiTaskInput from "./AiTaskInput";
import TaskDetailsForm from "./TaskDetailsForm";
import TaskFormActions from "./TaskFormActions";
import AiModeToggle from "./AiModeToggle";

const TaskForm = () => {
  const { addTask } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [isAiMode, setIsAiMode] = useState(false);
  
  const { resetParser } = useAiTaskParser();

  useEffect(() => {
    // Reset all form fields when the form is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    addTask({
      title,
      description: description.trim() ? description : undefined,
      priority,
      dueDate: date ? date.toISOString() : undefined,
      reminderTime: reminderTime ? reminderTime.toISOString() : undefined,
    });
    
    toast.success("Task created successfully");
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDate(undefined);
    setReminderTime(undefined);
    resetParser();
  };

  const handleTaskParsed = (
    parsedTitle: string, 
    parsedDescription: string, 
    parsedPriority: Priority, 
    parsedDate: Date | undefined
  ) => {
    setTitle(parsedTitle);
    setDescription(parsedDescription);
    setPriority(parsedPriority);
    setDate(parsedDate);
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full glass-card h-14 border-dashed"
        >
          <Plus className="h-5 w-5 mr-2" /> Add New Task
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Create a new task</CardTitle>
                <AiModeToggle 
                  isAiMode={isAiMode} 
                  toggleAiMode={() => setIsAiMode(!isAiMode)} 
                />
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {isAiMode && (
                  <AiTaskInput onTaskParsed={handleTaskParsed} />
                )}
                
                <TaskDetailsForm
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  priority={priority}
                  setPriority={setPriority}
                  date={date}
                  setDate={setDate}
                  reminderTime={reminderTime}
                  setReminderTime={setReminderTime}
                />
              </CardContent>
              
              <CardFooter>
                <TaskFormActions 
                  onCancel={() => {
                    resetForm();
                    setIsOpen(false);
                  }} 
                />
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TaskForm;
