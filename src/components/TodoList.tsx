import { useState, useEffect, useRef } from 'react';
import { Plus, X, Play, MoreVertical, Moon, Sun, Camera } from 'lucide-react';
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
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
              <DropdownMenuItem 
                onClick={() => toggleTheme('dark')}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent"
              >
                <Moon className="w-4 h-4" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleTheme('night')}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent"
              >
                <Moon className="w-4 h-4" />
                Night Mode
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={generateScreenshot}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent"
              >
                <Camera className="w-4 h-4" />
                Screenshot (JPEG)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Task Input */}
      {isAddingTask && (
        <div className="mb-4 p-3 timer-card">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter task name..."
            className="mb-2 bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={addTask} size="sm" className="btn-primary flex-1">
              Add
            </Button>
            <Button 
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskText('');
              }} 
              variant="outline" 
              size="sm"
              className="btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`timer-card p-3 transition-all duration-300 ${
              activeTaskId === task.id 
                ? 'border-primary/50 bg-primary/10' 
                : 'hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => handleTaskClick(task)}
                className="flex items-center gap-2 flex-1 text-left group"
              >
                <Play className="w-3 h-3 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className={`text-sm font-medium ${
                  activeTaskId === task.id ? 'text-primary' : 'text-foreground'
                } ${task.completed ? 'line-through opacity-60' : ''} group-hover:text-primary transition-colors`}>
                  {task.text}
                </span>
              </button>
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Completion Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed || false}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-muted-foreground">
                  {task.completed ? 'Completed' : 'Mark as done'}
                </span>
              </div>
              
              {activeTaskId === task.id && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary font-medium">Active</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !isAddingTask && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm mb-2">No tasks yet</p>
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="outline"
            size="sm"
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first task
          </Button>
        </div>
      )}
    </div>
  );
}