import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Coffee,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CircularProgress from "./CircularProgress";
import { Task } from "./TodoList";

type SessionType = "work" | "break";

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

interface PomodoroTimerProps {
  currentTask?: Task;
  onWorkSessionComplete?: (taskId: string) => void;
}

export default function PomodoroTimer({
  currentTask,
  onWorkSessionComplete,
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<SessionType>("work");
  const { toast } = useToast();

  const currentSessionTime = sessionType === "work" ? WORK_TIME : BREAK_TIME;
  const progress = ((currentSessionTime - timeLeft) / currentSessionTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSessionComplete = useCallback(() => {
    if (sessionType === "work") {
      setSessionCount((prev) => prev + 1);

      // Notify parent about work session completion for task tracking
      if (currentTask && onWorkSessionComplete) {
        onWorkSessionComplete(currentTask.id);
      }

      setSessionType("break");
      setSelectedTab("break");
      setTimeLeft(BREAK_TIME);
      toast({
        title: "🎉 Work Session Complete!",
        description: currentTask
          ? `Great job on "${currentTask.text}"! Time for a break.`
          : "Time for a well-deserved break! Great job staying focused.",
      });
    } else {
      setSessionType("work");
      setSelectedTab("work");
      setTimeLeft(WORK_TIME);
      toast({
        title: "💪 Break Over!",
        description: "Ready for another focused work session? Let's go!",
      });
    }
  }, [sessionType, currentTask, onWorkSessionComplete, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleSessionComplete]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSessionType("work");
    setSelectedTab("work");
    setTimeLeft(WORK_TIME);
  };

  const handleTabChange = (tab: SessionType) => {
    if (isActive) return; // Don't allow tab changes during active session

    setSelectedTab(tab);
    setSessionType(tab);
    setTimeLeft(tab === "work" ? WORK_TIME : BREAK_TIME);
  };

  return (
    <div className="w-full max-w-md">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1.5 rounded-2xl glass-effect">
        <button
          onClick={() => handleTabChange("work")}
          disabled={isActive}
          className={`tab-button flex-1 flex items-center justify-center gap-2 py-3 text-sm ${
            selectedTab === "work" ? "tab-active" : "tab-inactive"
          } ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Zap className="w-4 h-4" />
          <span>Focus</span>
          <span className="text-xs opacity-70">25m</span>
        </button>

        <button
          onClick={() => handleTabChange("break")}
          disabled={isActive}
          className={`tab-button flex-1 flex items-center justify-center gap-2 py-3 text-sm ${
            selectedTab === "break" ? "tab-active" : "tab-inactive"
          } ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Coffee className="w-4 h-4" />
          <span>Break</span>
          <span className="text-xs opacity-70">5m</span>
        </button>
      </div>

      {/* Main Timer Card */}
      <div className="timer-card p-6 text-center">
        {/* Session Status */}
        <div className="mb-4">
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
              backdrop-blur-sm border transition-all duration-500
              ${
                sessionType === "work"
                  ? "bg-purple-500/20 border-purple-400/30 text-purple-300"
                  : "bg-green-500/20 border-green-400/30 text-green-300"
              }
            `}
          >
            {sessionType === "work" ? (
              <>
                <Target className="w-4 h-4" />
                <span className="font-medium">Focus Session</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                <span className="font-medium">Break Time</span>
              </>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-6 flex justify-center">
          <CircularProgress
            progress={progress}
            sessionType={sessionType}
            size={220}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`text-3xl sm:text-4xl font-bold mb-1 transition-all duration-300 ${
                  isActive ? "animate-bounce-gentle" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {isActive ? "In Progress" : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-4">
          <Button
            onClick={handleStartPause}
            className={`btn-primary flex-1 max-w-32 ${
              isActive ? "animate-pulse-glow" : ""
            }`}
            size="default"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="btn-secondary px-4"
            size="default"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Compact Stats */}
        <div className="flex flex-col gap-3 items-left justify-between text-center px-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <div className="flex items-center gap-1">
              <div className="text-lg font-bold gradient-text">
                {sessionCount}
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <div className=" flex  items-center gap-2 text-left">
              <div className="text-sm font-medium text-foreground break-words max-w-full">
                {currentTask
                  ? currentTask.text
                  : // : `${sessionType} ${sessionCount + 1}`
                    "no specific task"}
              </div>
              {/* <div className="text-xs text-muted-foreground">
                {currentTask ? "Current Task" : "No task"}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
