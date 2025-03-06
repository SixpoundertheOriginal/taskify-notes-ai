
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, Priority } from "@/lib/types";
import { toast } from "sonner";

type ParsedTask = {
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
};

export function useAiTaskParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);

  const parseTask = async (taskText: string): Promise<ParsedTask | null> => {
    if (!taskText.trim()) return null;
    
    setIsLoading(true);
    setParsedTask(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("parse-task", {
        body: { taskText },
      });
      
      if (error) {
        console.error("Error parsing task:", error);
        toast.error("Failed to parse task. Please try again.");
        return null;
      }
      
      // Ensure the parsed data conforms to our expected format
      const parsedData: ParsedTask = {
        title: data.title || "New Task",
        description: data.description || null,
        priority: ["low", "medium", "high"].includes(data.priority) 
          ? data.priority as Priority 
          : "medium",
        dueDate: data.dueDate || null
      };
      
      setParsedTask(parsedData);
      return parsedData;
    } catch (err) {
      console.error("Error in task parsing:", err);
      toast.error("Something went wrong. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetParser = () => {
    setParsedTask(null);
  };

  return {
    parseTask,
    resetParser,
    parsedTask,
    isLoading
  };
}
