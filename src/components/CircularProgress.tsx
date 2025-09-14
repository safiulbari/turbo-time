interface CircularProgressProps {
  progress: number;
  sessionType: 'work' | 'break';
  size?: number;
}

export default function CircularProgress({ 
  progress, 
  sessionType, 
  size = 280 
}: CircularProgressProps) {
  const radius = (size - 40) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const strokeColor = sessionType === 'work' 
    ? 'hsl(var(--pomodoro-work))' 
    : 'hsl(var(--pomodoro-break))';

  const gradientId = `gradient-${sessionType}`;

  return (
    <div className="timer-progress relative">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id={`${gradientId}-main`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={sessionType === 'work' ? 'hsl(283 89% 74%)' : 'hsl(142 76% 36%)'} />
            <stop offset="100%" stopColor={sessionType === 'work' ? 'hsl(316 70% 68%)' : 'hsl(158 64% 52%)'} />
          </linearGradient>
          
          <filter id={`shadow-${sessionType}`}>
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="12"
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Background glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient-work)"
          strokeWidth="4"
          fill="transparent"
          className="opacity-10"
          filter="blur(8px)"
        />
        
        {/* Main progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId}-main)`}
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          filter={`url(#shadow-${sessionType})`}
        />
        
        {/* Outer glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="3"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out opacity-60"
          style={{
            filter: `blur(6px)`,
          }}
        />
        
        {/* Progress indicator dot */}
        {progress > 0 && (
          <circle
            cx={size / 2 + radius * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            r="8"
            fill={strokeColor}
            className="animate-pulse"
            filter={`url(#shadow-${sessionType})`}
          />
        )}
      </svg>
      
      {/* Center decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-24 h-24 rounded-full opacity-5 transition-all duration-500 ${
          sessionType === 'work' ? 'bg-purple-500' : 'bg-green-500'
        }`} />
      </div>
    </div>
  );
}