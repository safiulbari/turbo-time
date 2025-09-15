import { useState, useEffect } from 'react';
import { Plus, X, Play, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Task {
  id: string;
  text: string;
  pomodoroCount: number;
  isActive?: boolean;
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
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updatePomodoroCount = (id: string, increment: number) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, pomodoroCount: Math.max(0, task.pomodoroCount + increment) }
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <Button
          onClick={() => setIsAddingTask(true)}
          variant="outline"
          size="sm"
          className="btn-secondary p-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
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
                } group-hover:text-primary transition-colors`}>
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
            
            {/* Pomodoro Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => updatePomodoroCount(task.id, -1)}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                  disabled={task.pomodoroCount === 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">🍅</span>
                  <span className="text-sm font-bold gradient-text min-w-[1.5rem] text-center">
                    {task.pomodoroCount}
                  </span>
                </div>
                
                <Button
                  onClick={() => updatePomodoroCount(task.id, 1)}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3 h-3" />
                </Button>
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