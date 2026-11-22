import React from 'react';
import { ShieldAlert, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../services/soundService';

export default function Header({ activeTabLabel, subtitle }) {
  const { isDark, toggleTheme, isAudioMuted, toggleAudio } = useTheme();

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between px-8 py-5 border-b backdrop-blur-md transition-colors ${
      isDark
        ? 'border-slate-800/80 bg-[#050816]/90'
        : 'border-slate-200/90 bg-white/90 shadow-sm'
    }`}>
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>KRATOS</span>
          <span>/</span>
          <span className={isDark ? 'text-cyan-400 font-semibold' : 'text-sky-600 font-semibold'}>
            {activeTabLabel}
          </span>
        </div>
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center space-x-2 mt-0.5 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <span>{activeTabLabel}</span>
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right Controls: Theme Toggle, Audio Toggle, Status Pill */}
      <div className="flex items-center space-x-3.5">
        {/* Synthetic Dataset Transparency Badge */}
        <div className={`hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="font-mono text-[11px]">SYNTHETIC DATASET &bull; ILLUSTRATIVE ANALYSIS</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => {
            toggleAudio();
            sound.playClick();
          }}
          onMouseEnter={() => sound.playHover()}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-700/60 text-slate-300 hover:text-cyan-300'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-sky-600'
          }`}
          title={isAudioMuted ? "Unmute UI Sound Effects" : "Mute Sound Effects"}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />}
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => sound.playHover()}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-700/60 text-amber-400 hover:text-amber-300'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
          title={isDark ? "Switch to Civic Quartz Light Mode" : "Switch to Obsidian Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Real-time System Status Pill */}
        <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono ${
          isDark
            ? 'bg-cyan-950/40 border-cyan-400/30 text-cyan-300 shadow-glow-cyan'
            : 'bg-sky-50 border-sky-200 text-sky-700'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isDark ? 'bg-cyan-400' : 'bg-sky-500'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isDark ? 'bg-cyan-500' : 'bg-sky-600'
            }`}></span>
          </span>
          <span>LIVE ML MINING</span>
        </div>
      </div>
    </header>
  );
}
