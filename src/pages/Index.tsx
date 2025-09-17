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

  const handleWorkSessionComplete = (taskId: string) => {
    // Update the task's pomodoro count in localStorage
    const savedTasks = localStorage.getItem("pomodoro-tasks");
    if (savedTasks) {
      try {
        const tasks: Task[] = JSON.parse(savedTasks);
        const updatedTasks = tasks.map((task) =>
          task.id === taskId
            ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
            : task
        );
        localStorage.setItem("pomodoro-tasks", JSON.stringify(updatedTasks));

        // Update current task if it's the active one
        if (currentTask?.id === taskId) {
          setCurrentTask({
            ...currentTask,
            pomodoroCount: currentTask.pomodoroCount + 1,
          });
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-8xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Timer Section */}
          <div className="flex-shrink-0 w-full lg:w-[400px]">
            <PomodoroTimer
              currentTask={currentTask}
              onWorkSessionComplete={handleWorkSessionComplete}
              autoStart={shouldAutoStart}
            />
          </div>

          {/* Todo List Section */}
          <div className="flex-shrink-0 w-full lg:w-80">
            <TodoList
              onTaskStart={handleTaskStart}
              activeTaskId={currentTask?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
