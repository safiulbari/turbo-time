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

// Sound utilities
const playSound = (frequency: number, duration: number, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log('Audio not supported');
  }
};

const playStartSound = () => {
  // Uplifting start sound - ascending notes
  playSound(440, 0.15); // A4
  setTimeout(() => playSound(554, 0.15), 100); // C#5
  setTimeout(() => playSound(659, 0.2), 200); // E5
};

const playResetSound = () => {
  // Neutral reset sound - single note
  playSound(523, 0.3, 'triangle'); // C5
};

const playBreakSound = () => {
  // Soothing break sound - gentle descending notes
  playSound(523, 0.4, 'sine'); // C5
  setTimeout(() => playSound(466, 0.4, 'sine'), 200); // Bb4
  setTimeout(() => playSound(415, 0.6, 'sine'), 400); // Ab4
};

type SessionType = "work" | "break";

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

interface PomodoroTimerProps {
  currentTask?: Task;
  onWorkSessionComplete?: (taskId: string) => void;
  autoStart?: boolean;
}

export default function PomodoroTimer({
  currentTask,
  onWorkSessionComplete,
  autoStart = false,
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
      
      // Play soothing break sound
      playBreakSound();

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
    if (!isActive) {
      // Play start sound when starting
      playStartSound();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    // Play reset sound
    playResetSound();
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

  // Auto-start timer when a task is selected
  useEffect(() => {
    if (autoStart && currentTask) {
      setIsActive(true);
      setSessionType("work");
      setSelectedTab("work");
      setTimeLeft(WORK_TIME);
    }
  }, [currentTask, autoStart]);

  return (
    <div className="w-full max-w-md">
      {/* Tabs */}
      <div className="flex gap-3 mb-8 p-2 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/30">
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
      <div className="timer-card p-8 text-center">
        {/* Session Status */}
        <div className="mb-6">
          <div
            className={`
              inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium
              backdrop-blur-sm border transition-all duration-300
              ${
                sessionType === "work"
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }
            `}
          >
            {sessionType === "work" ? (
              <>
                <Target className="w-4 h-4" />
                <span>Focus Session</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                <span>Break Time</span>
              </>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8 flex justify-center">
          <CircularProgress
            progress={progress}
            sessionType={sessionType}
            size={240}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`text-4xl sm:text-5xl font-bold mb-2 transition-all duration-200 ${
                  isActive ? "animate-bounce-gentle" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                {isActive ? "In Progress" : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center mb-6">
          <Button
            onClick={handleStartPause}
            className={`btn-primary px-8 py-3 ${
              isActive ? "animate-pulse-glow" : ""
            }`}
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
            size="icon"
            className="w-12 h-12 rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Compact Stats */}
        <div className="flex flex-col gap-4 text-left px-2">
          {sessionCount > 0 && (
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold gradient-text">
                  {sessionCount}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Sessions Completed</div>
              </div>
            </div>
          )}

          {currentTask && (
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground break-words">
                  {currentTask.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Current Task</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
