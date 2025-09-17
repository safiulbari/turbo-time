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
    try {
      // Create a beautiful standalone card
      const screenshotContainer = document.createElement('div');
      screenshotContainer.style.cssText = `
        width: 600px;
        padding: 80px 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        top: -9999px;
        left: -9999px;
      `;

      const taskCard = document.createElement('div');
      taskCard.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;

      const title = document.createElement('h2');
      title.textContent = 'My Tasks';
      title.style.cssText = `
        font-size: 32px;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 32px 0;
        text-align: center;
      `;

      const taskList = document.createElement('div');
      taskList.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

      if (tasks.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.textContent = '📝 No tasks yet - ready to get productive!';
        emptyState.style.cssText = `
          text-align: center;
          color: #718096;
          font-size: 18px;
          padding: 40px 0;
        `;
        taskList.appendChild(emptyState);
      } else {
        tasks.forEach(task => {
          const taskItem = document.createElement('div');
          taskItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
          `;

          const checkbox = document.createElement('div');
          checkbox.textContent = task.completed ? '✅' : '☐';
          checkbox.style.cssText = 'font-size: 24px;';

          const taskText = document.createElement('span');
          taskText.textContent = task.text;
          taskText.style.cssText = `
            font-size: 18px;
            color: ${task.completed ? '#718096' : '#2d3748'};
            text-decoration: ${task.completed ? 'line-through' : 'none'};
            flex: 1;
          `;

          taskItem.appendChild(checkbox);
          taskItem.appendChild(taskText);
          taskList.appendChild(taskItem);
        });
      }

      taskCard.appendChild(title);
      taskCard.appendChild(taskList);
      screenshotContainer.appendChild(taskCard);
      document.body.appendChild(screenshotContainer);

      // Generate screenshot
      const canvas = await html2canvas(screenshotContainer, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Clean up
      document.body.removeChild(screenshotContainer);

      // Download
      const link = document.createElement('a');
      link.download = `beautiful-tasks-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
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
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first task
          </Button>
        </div>
      )}
    </div>
  );
}