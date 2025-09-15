import { useState } from 'react';
import PomodoroTimer from '@/components/PomodoroTimer';
import TodoList, { Task } from '@/components/TodoList';

const Index = () => {
  const [currentTask, setCurrentTask] = useState<Task | undefined>();

  const handleTaskStart = (task: Task) => {
    setCurrentTask(task);
  };

  const handleWorkSessionComplete = (taskId: string) => {
    // Update the task's pomodoro count in localStorage
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    if (savedTasks) {
      try {
        const tasks: Task[] = JSON.parse(savedTasks);
        const updatedTasks = tasks.map(task => 
          task.id === taskId 
            ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
            : task
        );
        localStorage.setItem('pomodoro-tasks', JSON.stringify(updatedTasks));
        
        // Update current task if it's the active one
        if (currentTask?.id === taskId) {
          setCurrentTask({ ...currentTask, pomodoroCount: currentTask.pomodoroCount + 1 });
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center min-h-screen p-4">
      {/* Timer Section */}
      <div className="flex-shrink-0">
        <PomodoroTimer 
          currentTask={currentTask}
          onWorkSessionComplete={handleWorkSessionComplete}
        />
      </div>
      
      {/* Todo List Section */}
      <div className="flex-shrink-0 w-full lg:w-auto">
        <TodoList 
          onTaskStart={handleTaskStart}
          activeTaskId={currentTask?.id}
        />
      </div>
    </div>
  );
};

export default Index;
