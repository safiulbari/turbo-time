import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CircularProgress from './CircularProgress';
import SessionIndicator from './SessionIndicator';

type SessionType = 'work' | 'break';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const { toast } = useToast();

  const currentSessionTime = sessionType === 'work' ? WORK_TIME : BREAK_TIME;
  const progress = ((currentSessionTime - timeLeft) / currentSessionTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSessionComplete = useCallback(() => {
    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
      setSessionType('break');
      setTimeLeft(BREAK_TIME);
      toast({
        title: "Work Session Complete! 🎉",
        description: "Time for a well-deserved break!",
      });
    } else {
      setSessionType('work');
      setTimeLeft(WORK_TIME);
      toast({
        title: "Break Over! 💪",
        description: "Ready for another focused work session?",
      });
    }
  }, [sessionType, toast]);

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
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSessionType('work');
    setTimeLeft(WORK_TIME);
    setSessionCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="timer-card p-8 md:p-12 max-w-md w-full text-center animate-float">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            FocusFlow
          </h1>
          <p className="text-muted-foreground">
            Session #{sessionCount + 1}
          </p>
        </div>

        {/* Session Indicator */}
        <SessionIndicator sessionType={sessionType} />

        {/* Timer Display */}
        <div className="relative mb-8">
          <CircularProgress 
            progress={progress} 
            sessionType={sessionType}
            size={240}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleStartPause}
            className="btn-primary"
            size="lg"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="btn-secondary"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-white/5">
          <div className="text-sm text-muted-foreground mb-1">
            Completed Sessions
          </div>
          <div className="text-2xl font-bold gradient-text">
            {sessionCount}
          </div>
        </div>
      </div>
    </div>
  );
}