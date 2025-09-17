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
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col gap-4 md:hidden">
          <TodoList onTaskStart={handleTaskStart} activeTaskId={currentTask?.id} />
          <PomodoroTimer currentTask={currentTask} onWorkSessionComplete={handleWorkSessionComplete} onSessionEnd={handleSessionEnd} autoStart={shouldAutoStart} />
        </div>

        {/* Desktop Layout - Centered */}
        <div className="hidden md:flex justify-center items-start min-h-[calc(100vh-2rem)]">
          <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <TodoList onTaskStart={handleTaskStart} activeTaskId={currentTask?.id} />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="w-full max-w-xs">
                <PomodoroTimer currentTask={currentTask} onWorkSessionComplete={handleWorkSessionComplete} onSessionEnd={handleSessionEnd} autoStart={shouldAutoStart} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;