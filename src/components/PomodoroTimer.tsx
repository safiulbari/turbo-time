import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Zap, Coffee, Target, Trophy } from "lucide-react";
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
  onSessionEnd?: () => void;
  autoStart?: boolean;
}
export default function PomodoroTimer({
  currentTask,
  onWorkSessionComplete,
  onSessionEnd,
  autoStart = false
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<SessionType>("work");
  const {
    toast
  } = useToast();
  const currentSessionTime = sessionType === "work" ? WORK_TIME : BREAK_TIME;
  const progress = (currentSessionTime - timeLeft) / currentSessionTime * 100;

  // Sound functions
  const playStartSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };
  const playCompleteSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = [523, 659, 784, 1047]; // C, E, G, C

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
      oscillator.start(audioContext.currentTime + index * 0.15);
      oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
    });
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const handleSessionComplete = useCallback(() => {
    playCompleteSound();
    if (sessionType === "work") {
      setSessionCount(prev => prev + 1);

      // Notify parent about work session completion for task tracking
      if (currentTask && onWorkSessionComplete) {
        onWorkSessionComplete(currentTask.id);
      }
      setSessionType("break");
      setSelectedTab("break");
      setTimeLeft(BREAK_TIME);
      toast({
        title: "🎉 Work Session Complete!",
        description: currentTask ? `Great job on "${currentTask.text}"! Time for a break.` : "Time for a well-deserved break! Great job staying focused."
      });

      // Clear current task after work session
      if (onSessionEnd) {
        onSessionEnd();
      }
    } else {
      setSessionType("work");
      setSelectedTab("work");
      setTimeLeft(WORK_TIME);
      toast({
        title: "💪 Break Over!",
        description: "Ready for another focused work session? Let's go!"
      });
    }
  }, [sessionType, currentTask, onWorkSessionComplete, onSessionEnd, toast]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleSessionComplete]);
  const handleStartPause = () => {
    if (!isActive) {
      playStartSound();
    }
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

  // Auto-start timer when a task is selected
  useEffect(() => {
    if (autoStart && currentTask) {
      setIsActive(true);
      setSessionType("work");
      setSelectedTab("work");
      setTimeLeft(WORK_TIME);
    }
  }, [currentTask, autoStart]);
  return <div className="w-full">
      {/* Card Header */}
      <div className="mb-6">
        
        {currentTask && <p className="text-sm text-muted-foreground">
            Working on: <span className="font-medium text-foreground">{currentTask.text}</span>
          </p>}
      </div>

      {/* Timer Card */}
      <div className="timer-card p-6">
        {/* Session Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg bg-secondary/30">
          <button onClick={() => handleTabChange("work")} disabled={isActive} className={`tab-button flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-md transition-all ${selectedTab === "work" ? "tab-active" : "tab-inactive"} ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}>
            <Zap className="w-4 h-4" />
            <span>Focus</span>
            <span className="text-xs opacity-70">25m</span>
          </button>

          <button onClick={() => handleTabChange("break")} disabled={isActive} className={`tab-button flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-md transition-all ${selectedTab === "break" ? "tab-active" : "tab-inactive"} ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}>
            <Coffee className="w-4 h-4" />
            <span>Break</span>
            <span className="text-xs opacity-70">5m</span>
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-6 flex justify-center">
          <CircularProgress progress={progress} sessionType={sessionType} size={200} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {isActive ? "In Progress" : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-4">
          <Button onClick={handleStartPause} className="btn-primary px-6 py-2" size="sm">
            {isActive ? <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </> : <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>}
          </Button>

          <Button onClick={handleReset} className="btn-secondary px-4 py-2" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Stats */}
        {sessionCount > 0 && <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{sessionCount}</span> sessions completed
            </span>
          </div>}
      </div>
    </div>;
}