
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiTaskParser } from "@/hooks/use-ai-task-parser";
import { ArrowRight, Sparkles } from "lucide-react";

export default function TestAiTaskParsing() {
  const [naturalInput, setNaturalInput] = useState("");
  const { parseTask, parsedTask, isLoading, resetParser } = useAiTaskParser();

  const handleAiParseClick = async () => {
    if (!naturalInput.trim()) return;
    await parseTask(naturalInput);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Test AI Task Parsing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Remind me to call Sarah tomorrow at 2pm"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAiParseClick}
              disabled={isLoading || !naturalInput.trim()}
            >
              {isLoading ? "Parsing..." : "Parse"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {parsedTask && (
            <div className="bg-secondary/20 p-4 rounded-md mt-4 space-y-2">
              <p className="font-medium">AI Parsed Result:</p>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium">Title:</span> 
                <span>{parsedTask.title}</span>
                
                <span className="font-medium">Description:</span> 
                <span>{parsedTask.description || "None"}</span>
                
                <span className="font-medium">Priority:</span> 
                <span>{parsedTask.priority}</span>
                
                <span className="font-medium">Due Date:</span> 
                <span>{parsedTask.dueDate ? new Date(parsedTask.dueDate).toLocaleString() : "None"}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={resetParser} disabled={!parsedTask}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
