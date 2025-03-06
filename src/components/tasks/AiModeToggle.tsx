
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiModeToggleProps {
  isAiMode: boolean;
  toggleAiMode: () => void;
}

const AiModeToggle = ({ isAiMode, toggleAiMode }: AiModeToggleProps) => {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-muted-foreground">AI Mode</span>
      <Button
        size="sm"
        variant={isAiMode ? "default" : "outline"}
        onClick={toggleAiMode}
        className="gap-1"
      >
        <Sparkles className="h-4 w-4" />
        {isAiMode ? "On" : "Off"}
      </Button>
    </div>
  );
};

export default AiModeToggle;
