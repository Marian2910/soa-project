import React from 'react';

const CircularTimer = ({ timeLeft, maxTime, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (timeLeft / maxTime) * circumference;
  
  // Color logic: Green -> Yellow -> Red
  const getColor = () => {
    if (timeLeft > maxTime * 0.5) return 'text-brand-teal'; // #26A69A
    if (timeLeft > maxTime * 0.2) return 'text-brand-yellow'; // #FFD400
    return 'text-red-500';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${getColor()}`}
        />
      </svg>
      {/* Time Text */}
      <div className="absolute text-2xl font-bold font-mono text-gray-700">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default CircularTimer;