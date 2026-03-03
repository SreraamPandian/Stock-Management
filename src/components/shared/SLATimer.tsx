import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const SLATimer = ({ deadline }: { deadline: number }) => {
  const [timeLeft, setTimeLeft] = useState(deadline - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(deadline - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const isBreached = timeLeft <= 0;

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isBreached) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 text-xs font-bold animate-pulse border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        SLA BREACHED
      </div>
    );
  }

  const isWarning = timeLeft < 3600000; // Less than 1 hour

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
      isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      {formatTime(timeLeft)}
    </div>
  );
};
