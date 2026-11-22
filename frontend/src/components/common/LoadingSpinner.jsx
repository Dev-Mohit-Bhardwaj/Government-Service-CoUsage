import React from 'react';

export default function LoadingSpinner({ message = "Analysing service relationships..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[350px]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping opacity-35" />
        {/* Rotating Cyan Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" />
        {/* Inner Violet Counter-Rotating Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-400 border-l-violet-400 animate-spin-slow" />
        {/* Core Glowing Dot */}
        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
      </div>

      <p className="mt-5 text-sm font-mono tracking-wider text-cyan-300 animate-pulse">
        {message}
      </p>
      <span className="text-xs text-slate-400 mt-1">KRATOS Intelligence Engine Active</span>
    </div>
  );
}
