
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, PenSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TaskList from "@/components/tasks/TaskList";
import NoteList from "@/components/notes/NoteList";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { motion } from "framer-motion";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container max-w-5xl py-6 px-4 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Taskify
              </h1>
              <p className="text-muted-foreground">
                Manage your tasks and notes in one place
              </p>
            </div>
            
            <Tabs 
              defaultValue="tasks" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="tasks" className="flex items-center gap-2 py-3">
                  <CheckSquare className="h-4 w-4" />
                  <span>Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2 py-3">
                  <PenSquare className="h-4 w-4" />
                  <span>Notes</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="mt-0">
                <TaskList />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0">
                <NoteList />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
