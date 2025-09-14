import { Coffee, Zap } from 'lucide-react';

interface SessionIndicatorProps {
  sessionType: 'work' | 'break';
}

export default function SessionIndicator({ sessionType }: SessionIndicatorProps) {
  const isWork = sessionType === 'work';
  
  return (
    <div className="mb-6">
      <div className={`
        inline-flex items-center gap-3 px-6 py-3 rounded-full 
        backdrop-blur-sm border transition-all duration-300
        ${isWork 
          ? 'bg-purple-500/20 border-purple-400/30 text-purple-300' 
          : 'bg-green-500/20 border-green-400/30 text-green-300'
        }
      `}>
        {isWork ? (
          <>
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Focus Time</span>
          </>
        ) : (
          <>
            <Coffee className="w-5 h-5" />
            <span className="font-semibold">Break Time</span>
          </>
        )}
      </div>
    </div>
  );
}