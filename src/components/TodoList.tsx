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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.className = newTheme === 'light' ? '' : 'dark';
  };

  const generateScreenshot = async () => {
    if (!todoListRef.current) return;
    
    try {
      // Create a beautiful canvas with gradient background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions
      canvas.width = 800;
      canvas.height = 600;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (theme === 'light') {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      } else {
        gradient.addColorStop(0, '#833ab4');
        gradient.addColorStop(1, '#fd1d1d');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.fillStyle = theme === 'light' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.2)';
      for (let i = 0; i < canvas.width; i += 60) {
        for (let j = 0; j < canvas.height; j += 60) {
          ctx.fillRect(i, j, 30, 30);
        }
      }

      // Create content area
      const contentX = 100;
      const contentY = 80;
      const contentWidth = canvas.width - 200;
      const contentHeight = canvas.height - 160;

      // Draw content background
      ctx.fillStyle = theme === 'light' 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(20, 20, 30, 0.95)';
      ctx.roundRect(contentX, contentY, contentWidth, contentHeight, 20);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = theme === 'light' 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Title
      ctx.fillStyle = theme === 'light' ? '#1a1a1a' : '#ffffff';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('My Tasks', canvas.width / 2, contentY + 50);

      // Draw tasks
      const taskY = contentY + 100;
      const taskHeight = 60;
      const taskSpacing = 20;

      tasks.forEach((task, index) => {
        const y = taskY + (index * (taskHeight + taskSpacing));
        
        if (y + taskHeight > contentY + contentHeight - 40) return; // Don't overflow

        // Task background
        ctx.fillStyle = task.completed 
          ? (theme === 'light' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)')
          : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)');
        ctx.roundRect(contentX + 40, y, contentWidth - 80, taskHeight, 12);
        ctx.fill();

        // Checkbox
        const checkboxX = contentX + 60;
        const checkboxY = y + 20;
        const checkboxSize = 20;
        
        ctx.strokeStyle = task.completed 
          ? '#22c55e' 
          : (theme === 'light' ? '#666' : '#999');
        ctx.lineWidth = 2;
        ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
        
        if (task.completed) {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(checkboxX + 2, checkboxY + 2, checkboxSize - 4, checkboxSize - 4);
          
          // Checkmark
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(checkboxX + 5, checkboxY + 10);
          ctx.lineTo(checkboxX + 9, checkboxY + 14);
          ctx.lineTo(checkboxX + 15, checkboxY + 6);
          ctx.stroke();
        }

        // Task text
        ctx.fillStyle = task.completed 
          ? (theme === 'light' ? '#666' : '#999')
          : (theme === 'light' ? '#1a1a1a' : '#ffffff');
        ctx.font = task.completed ? '18px Inter, sans-serif' : 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'left';
        
        const maxWidth = contentWidth - 160;
        const text = task.text.length > 40 ? task.text.substring(0, 40) + '...' : task.text;
        ctx.fillText(text, checkboxX + 40, y + 35);
        
        if (task.completed) {
          // Strikethrough
          ctx.strokeStyle = theme === 'light' ? '#999' : '#666';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(checkboxX + 40, y + 30);
          ctx.lineTo(checkboxX + 40 + ctx.measureText(text).width, y + 30);
          ctx.stroke();
        }
      });

      // If no tasks, show empty state
      if (tasks.length === 0) {
        ctx.fillStyle = theme === 'light' ? '#666' : '#999';
        ctx.font = '20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No tasks yet - ready to be productive!', canvas.width / 2, canvas.height / 2);
      }

      // Download the image
      const link = document.createElement('a');
      link.download = `beautiful-tasks-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating screenshot:', error);
    }
  };

  return (
    <div ref={todoListRef} className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="ghost"
            size="sm"
            className="btn-ghost"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="btn-icon"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
              <DropdownMenuItem 
                onClick={() => toggleTheme('light')}
                className="flex items-center gap-3 cursor-pointer hover:bg-accent/60 transition-colors py-2.5"
              >
                <Sunrise className="w-4 h-4 text-amber-500" />
                Light Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleTheme('dark')}
                className="flex items-center gap-3 cursor-pointer hover:bg-accent/60 transition-colors py-2.5"
              >
                <Moon className="w-4 h-4 text-slate-400" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={generateScreenshot}
                className="flex items-center gap-3 cursor-pointer hover:bg-accent/60 transition-colors border-t border-border/30 mt-1 pt-3"
              >
                <Camera className="w-4 h-4 text-emerald-500" />
                Screenshot (JPEG)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Task Input */}
      {isAddingTask && (
        <div className="mb-6 p-5 timer-card animate-fade-in">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter task name..."
            className="mb-4 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all duration-200 rounded-lg"
            autoFocus
          />
          <div className="flex gap-3">
            <Button onClick={addTask} className="btn-primary flex-1">
              Add Task
            </Button>
            <Button 
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskText('');
              }} 
              className="btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`timer-card p-5 transition-all duration-300 hover-scale animate-fade-in group ${
              activeTaskId === task.id 
                ? 'border-primary/50 bg-gradient-to-r from-primary/8 to-primary/4 shadow-lg shadow-primary/10' 
                : 'hover:border-border/60 hover:shadow-md'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleTaskClick(task)}
                className="flex items-center gap-3 flex-1 text-left group/button"
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  activeTaskId === task.id 
                    ? 'bg-primary/15 text-primary' 
                    : 'bg-secondary/40 text-muted-foreground group-hover/button:bg-primary/10 group-hover/button:text-primary'
                }`}>
                  <Play className="w-3.5 h-3.5" />
                </div>
                <span className={`text-sm font-medium break-words flex-1 transition-all duration-200 ${
                  activeTaskId === task.id ? 'text-primary' : 'text-foreground'
                } ${task.completed ? 'line-through opacity-60' : ''} group-hover/button:text-primary`}>
                  {task.text}
                </span>
              </button>
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="p-2 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
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
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  task.completed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                  {task.completed ? '✨ Completed' : 'Mark as done'}
                </span>
              </div>
              
              {activeTaskId === task.id && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 animate-fade-in">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary font-medium">Active Session</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !isAddingTask && (
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <div className="mb-6 opacity-60">
            <div className="w-20 h-20 mx-auto bg-secondary/30 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-10 h-10" />
            </div>
          </div>
          <p className="text-base mb-2 font-medium">No tasks yet</p>
          <p className="text-sm mb-8 opacity-70 max-w-64 mx-auto">Get started by adding your first task to begin tracking your pomodoro sessions</p>
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="outline"
            className="border-border/50 hover:border-border hover:bg-accent/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first task
          </Button>
        </div>
      )}
    </div>
  );
}