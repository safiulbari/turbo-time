interface CircularProgressProps {
  progress: number;
  sessionType: 'work' | 'break';
  size?: number;
}

export default function CircularProgress({ 
  progress, 
  sessionType, 
  size = 220 
}: CircularProgressProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const strokeColor = sessionType === 'work' 
    ? 'hsl(var(--pomodoro-work))' 
    : 'hsl(var(--pomodoro-break))';

  const gradientId = `gradient-${sessionType}`;
  const center = size / 2;

  return (
    <div className="timer-progress">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id={`${gradientId}-main`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={sessionType === 'work' ? 'hsl(283 89% 74%)' : 'hsl(142 76% 36%)'} />
            <stop offset="100%" stopColor={sessionType === 'work' ? 'hsl(316 70% 68%)' : 'hsl(158 64% 52%)'} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Main progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId}-main)`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor}40)`,
          }}
        />
        
        {/* Subtle glow effect */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth="2"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out opacity-40"
          style={{
            filter: `blur(4px)`,
          }}
        />
      </svg>
    </div>
  );
}