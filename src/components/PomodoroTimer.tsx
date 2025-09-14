import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CircularProgress from './CircularProgress';

type SessionType = 'work' | 'break';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<SessionType>('work');
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
      setSelectedTab('break');
      setTimeLeft(BREAK_TIME);
      toast({
        title: "🎉 Work Session Complete!",
        description: "Time for a well-deserved break! Great job staying focused.",
      });
    } else {
      setSessionType('work');
      setSelectedTab('work');
      setTimeLeft(WORK_TIME);
      toast({
        title: "💪 Break Over!",
        description: "Ready for another focused work session? Let's go!",
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
    setSelectedTab('work');
    setTimeLeft(WORK_TIME);
  };

  const handleTabChange = (tab: SessionType) => {
    if (isActive) return; // Don't allow tab changes during active session
    
    setSelectedTab(tab);
    setSessionType(tab);
    setTimeLeft(tab === 'work' ? WORK_TIME : BREAK_TIME);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
            FocusFlow
          </h1>
          <p className="text-muted-foreground text-lg">
            Master your productivity with focused work sessions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 p-2 rounded-3xl glass-effect animate-fade-in-up">
          <button
            onClick={() => handleTabChange('work')}
            disabled={isActive}
            className={`tab-button flex-1 flex items-center justify-center gap-2 ${
              selectedTab === 'work' ? 'tab-active' : 'tab-inactive'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className="w-5 h-5" />
            <span>Focus</span>
            <span className="text-sm opacity-70">25min</span>
          </button>
          
          <button
            onClick={() => handleTabChange('break')}
            disabled={isActive}
            className={`tab-button flex-1 flex items-center justify-center gap-2 ${
              selectedTab === 'break' ? 'tab-active' : 'tab-inactive'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Coffee className="w-5 h-5" />
            <span>Break</span>
            <span className="text-sm opacity-70">5min</span>
          </button>
        </div>

        {/* Main Timer Card */}
        <div className="timer-card p-8 md:p-10 text-center animate-float">
          {/* Session Status */}
          <div className="mb-6">
            <div className={`
              inline-flex items-center gap-3 px-6 py-3 rounded-full 
              backdrop-blur-sm border transition-all duration-500
              ${sessionType === 'work' 
                ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' 
                : 'bg-green-500/20 border-green-400/30 text-green-300'
              }
            `}>
              {sessionType === 'work' ? (
                <>
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">Focus Session</span>
                </>
              ) : (
                <>
                  <Coffee className="w-5 h-5" />
                  <span className="font-semibold">Break Time</span>
                </>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="relative mb-8">
            <CircularProgress 
              progress={progress} 
              sessionType={sessionType}
              size={280}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl md:text-6xl font-bold mb-2 transition-all duration-300 ${
                  isActive ? 'animate-bounce-gentle' : ''
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {isActive ? 'In Progress' : 'Ready to Start'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center mb-8">
            <Button
              onClick={handleStartPause}
              className={`btn-primary ${isActive ? 'animate-pulse-glow' : ''}`}
              size="lg"
            >
              {isActive ? (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8 animate-fade-in-up">
          <div className="stats-card text-center">
            <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
            <div className="text-sm text-muted-foreground mb-1">
              Completed Sessions
            </div>
            <div className="text-3xl font-bold gradient-text">
              {sessionCount}
            </div>
          </div>
          
          <div className="stats-card text-center">
            <Target className="w-8 h-8 mx-auto mb-3 text-primary" />
            <div className="text-sm text-muted-foreground mb-1">
              Current Session
            </div>
            <div className="text-lg font-semibold text-foreground capitalize">
              {sessionType} {sessionCount + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}