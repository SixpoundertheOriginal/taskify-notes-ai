
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, PenSquare, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/layout/ThemeProvider';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Taskify
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Tabs defaultValue="tasks" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <PenSquare className="h-4 w-4" />
                <span>Notes</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                <Button className="justify-start" variant="ghost">
                  <CheckSquare className="mr-2 h-5 w-5" />
                  <span>Tasks</span>
                </Button>
                <Button className="justify-start" variant="ghost">
                  <PenSquare className="mr-2 h-5 w-5" />
                  <span>Notes</span>
                </Button>
                <div className="flex items-center">
                  <span className="mr-2 text-sm">Toggle theme</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle theme"
                    className="rounded-full"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
