interface CircularProgressProps {
  progress: number;
  sessionType: 'work' | 'break';
  size?: number;
}

export default function CircularProgress({ 
  progress, 
  sessionType, 
  size = 240 
}: CircularProgressProps) {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const strokeColor = sessionType === 'work' 
    ? 'hsl(var(--pomodoro-work))' 
    : 'hsl(var(--pomodoro-break))';

  return (
    <div className="timer-progress">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="8"
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
          style={{
            filter: `drop-shadow(0 0 10px ${strokeColor}40)`,
          }}
        />
        
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="2"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out opacity-60"
          style={{
            filter: `blur(4px)`,
          }}
        />
      </svg>
    </div>
  );
}