import { useState, useEffect, useRef } from 'react';
import { Plus, X, Play, MoreVertical, Moon, Sun, Camera, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from 'html2canvas';

export interface Task {
  id: string;
  text: string;
  pomodoroCount: number;
  isActive?: boolean;
  completed?: boolean;
}

interface TodoListProps {
  onTaskStart: (task: Task) => void;
  activeTaskId?: string;
}

const STORAGE_KEY = 'pomodoro-tasks';

export default function TodoList({ onTaskStart, activeTaskId }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'night'>('dark');
  const todoListRef = useRef<HTMLDivElement>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        pomodoroCount: 0,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleTaskClick = (task: Task) => {
    onTaskStart(task);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskText('');
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark' | 'night') => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.className = newTheme;
  };

  const generateScreenshot = async () => {
    if (!todoListRef.current) return;
    
    try {
      const canvas = await html2canvas(todoListRef.current, {
        backgroundColor: theme === 'light' ? '#ffffff' : theme === 'dark' ? '#0a0a0a' : '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      // Convert to JPEG and download
      const link = document.createElement('a');
      link.download = `task-list-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('Error generating screenshot:', error);
    }
  };

  return (
    <div ref={todoListRef} className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="outline"
            size="sm"
            className="btn-secondary p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="btn-secondary p-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
              <DropdownMenuItem 
                onClick={() => toggleTheme('light')}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/80 transition-colors"
              >
                <Sunrise className="w-4 h-4 text-amber-500" />
                Day Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleTheme('dark')}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/80 transition-colors"
              >
                <Sun className="w-4 h-4 text-blue-400" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleTheme('night')}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/80 transition-colors"
              >
                <Moon className="w-4 h-4 text-purple-400" />
                Night Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={generateScreenshot}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/80 transition-colors border-t border-border/30 mt-1 pt-2"
              >
                <Camera className="w-4 h-4 text-green-400" />
                Screenshot (JPEG)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Task Input */}
      {isAddingTask && (
        <div className="mb-6 p-4 timer-card animate-fade-in">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter task name..."
            className="mb-3 bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            autoFocus
          />
          <div className="flex gap-3">
            <Button onClick={addTask} size="sm" className="btn-primary flex-1 hover-scale">
              Add Task
            </Button>
            <Button 
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskText('');
              }} 
              variant="outline" 
              size="sm"
              className="btn-secondary hover-scale"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`timer-card p-4 transition-all duration-500 hover-scale animate-fade-in group ${
              activeTaskId === task.id 
                ? 'border-primary/60 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg shadow-primary/20' 
                : 'hover:border-white/30 hover:shadow-lg hover:shadow-black/10'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => handleTaskClick(task)}
                className="flex items-center gap-3 flex-1 text-left group/button"
              >
                <div className={`p-1.5 rounded-full transition-all duration-300 ${
                  activeTaskId === task.id 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/50 text-muted-foreground group-hover/button:bg-primary/10 group-hover/button:text-primary'
                }`}>
                  <Play className="w-3 h-3" />
                </div>
                <span className={`text-sm font-medium break-words flex-1 transition-all duration-300 ${
                  activeTaskId === task.id ? 'text-primary' : 'text-foreground'
                } ${task.completed ? 'line-through opacity-60' : ''} group-hover/button:text-primary`}>
                  {task.text}
                </span>
              </button>
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="p-2 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-full opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Completion Checkbox and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed || false}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200 hover-scale"
                />
                <span className={`text-xs transition-colors duration-200 ${
                  task.completed 
                    ? 'text-green-500 font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                  {task.completed ? '✨ Completed' : 'Mark as done'}
                </span>
              </div>
              
              {activeTaskId === task.id && (
                <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-full border border-primary/20 animate-fade-in">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary font-medium">Active Session</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !isAddingTask && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          <div className="mb-4 opacity-50">
            <div className="w-16 h-16 mx-auto bg-secondary/30 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm mb-4 font-medium">No tasks yet</p>
          <p className="text-xs mb-6 opacity-70 max-w-48 mx-auto">Get started by adding your first task to begin tracking your pomodoro sessions</p>
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="outline"
            size="sm"
            className="btn-secondary hover-scale"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first task
          </Button>
        </div>
      )}
    </div>
  );
}