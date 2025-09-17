import { useState } from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import TodoList, { Task } from "@/components/TodoList";
const Index = () => {
  const [currentTask, setCurrentTask] = useState<Task | undefined>();
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const handleTaskStart = (task: Task) => {
    setCurrentTask(task);
    setShouldAutoStart(true);
    // Reset auto-start flag after a brief delay
    setTimeout(() => setShouldAutoStart(false), 100);
  };
  const handleSessionEnd = () => {
    setCurrentTask(undefined);
  };
  const handleWorkSessionComplete = (taskId: string) => {
    // Update the task's pomodoro count in localStorage
    const savedTasks = localStorage.getItem("pomodoro-tasks");
    if (savedTasks) {
      try {
        const tasks: Task[] = JSON.parse(savedTasks);
        const updatedTasks = tasks.map(task => task.id === taskId ? {
          ...task,
          pomodoroCount: task.pomodoroCount + 1
        } : task);
        localStorage.setItem("pomodoro-tasks", JSON.stringify(updatedTasks));

        // Update current task if it's the active one
        if (currentTask?.id === taskId) {
          setCurrentTask({
            ...currentTask,
            pomodoroCount: currentTask.pomodoroCount + 1
          });
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40">
        
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Timer Section */}
          <div className="lg:order-1 order-2">
            <PomodoroTimer currentTask={currentTask} onWorkSessionComplete={handleWorkSessionComplete} onSessionEnd={handleSessionEnd} autoStart={shouldAutoStart} />
          </div>

          {/* Todo List Section */}
          <div className="lg:order-2 order-1">
            <TodoList onTaskStart={handleTaskStart} activeTaskId={currentTask?.id} />
          </div>
        </div>
      </main>
    </div>;
};
export default Index;