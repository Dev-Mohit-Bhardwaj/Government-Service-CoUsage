import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  Sparkles,
  Network,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import CivicOrbitGlobe from '../components/globe/CivicOrbitGlobe';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function LandingPage({ onEnterApplication }) {
  const [stage, setStage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isDark, toggleTheme, isAudioMuted, toggleAudio } = useTheme();

  useEffect(() => {
    // Sound awakening
    sound.playAwakening();

    // Stage choreography
    const timer1 = setTimeout(() => setStage(2), 700);  // Connectivity
    const timer2 = setTimeout(() => setStage(3), 1500); // Title & Identity
    const timer3 = setTimeout(() => setStage(4), 2200); // Main CTA button

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleEnter = () => {
    sound.playExploreSweep();
    setIsTransitioning(true);
    setTimeout(() => {
      onEnterApplication();
    }, 700);
  };

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 overflow-hidden flex flex-col justify-between ${
      isDark ? 'bg-[#050816] text-white selection:bg-cyan-500/30' : 'bg-[#F8FAFC] text-slate-900 selection:bg-sky-500/20'
    }`}>
      {/* 3D Cinematic Digital Globe Background */}
      <CivicOrbitGlobe isEntering={isTransitioning} />

      {/* Atmospheric Background Gradients */}
      <div className={`absolute inset-0 pointer-events-none z-1 ${
        isDark
          ? 'bg-gradient-to-b from-[#050816]/60 via-transparent to-[#050816]'
          : 'bg-gradient-to-b from-[#F8FAFC]/50 via-transparent to-[#F8FAFC]'
      }`} />

      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none z-1 ${
        isDark ? 'bg-cyan-500/10' : 'bg-sky-400/15'
      }`} />

      {/* Top Brand & Controls Bar */}
      <header className="relative z-10 w-full px-8 py-6 md:px-14 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-3.5"
        >
          <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500/20 to-violet-600/30 border-cyan-400/30 shadow-glow-cyan'
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <Network className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isDark ? 'bg-cyan-400' : 'bg-sky-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isDark ? 'bg-cyan-500' : 'bg-sky-600'
              }`}></span>
            </span>
          </div>
          <div>
            <span className={`text-xl font-extrabold tracking-wider ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              KRATOS
            </span>
            <span className="text-[11px] block text-slate-400 font-mono tracking-wider">
              CIVIC INTELLIGENCE OS
            </span>
          </div>
        </motion.div>

        {/* Right Controls: Theme Toggle, Sound Toggle, Skip */}
        <div className="flex items-center space-x-3">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              toggleAudio();
              sound.playClick();
            }}
            onMouseEnter={() => sound.playHover()}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-cyan-300'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:text-sky-600 shadow-sm'
            }`}
            title={isAudioMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            onMouseEnter={() => sound.playHover()}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/60 border-slate-700/60 text-amber-300 hover:text-amber-200'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:text-indigo-600 shadow-sm'
            }`}
            title={isDark ? "Switch to Civic Quartz Light Mode" : "Switch to Obsidian Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Skip Pill */}
          <button
            onClick={handleEnter}
            onMouseEnter={() => sound.playHover()}
            className={`text-xs font-mono px-4 py-2 rounded-xl border backdrop-blur-md transition-all flex items-center space-x-2 cursor-pointer ${
              isDark
                ? 'border-cyan-500/20 bg-slate-900/60 text-cyan-300 hover:border-cyan-400/50'
                : 'border-slate-200 bg-white/80 text-slate-700 hover:border-sky-400 shadow-sm'
            }`}
          >
            <span>Skip to Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Cinematic Stage Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto my-auto space-y-6">
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-medium tracking-wide backdrop-blur-md ${
                isDark
                  ? 'bg-cyan-950/40 border-cyan-400/30 text-cyan-300 shadow-glow-cyan'
                  : 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-sky-600'} animate-pulse`} />
              <span>DIGITAL GOVERNANCE INFRASTRUCTURE INTELLIGENCE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Title */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-sans">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>
                  PROJECT
                </span>{" "}
                <span className={`bg-clip-text text-transparent ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 drop-shadow-[0_0_35px_rgba(0,217,255,0.45)]'
                    : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700'
                }`}>
                  KRATOS
                </span>
              </h1>

              <p className={`text-lg sm:text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto ${
                isDark ? 'text-slate-200' : 'text-slate-600'
              }`}>
                Government Service Intelligence &amp; Recommendation System
              </p>

              <p className={`text-sm sm:text-base italic tracking-wider ${
                isDark ? 'text-cyan-300/80' : 'text-sky-700/90 font-medium'
              }`}>
                &ldquo;Connecting Services. Discovering Relationships. Empowering Citizens.&rdquo;
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Pills */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700/50 text-slate-300'
                  : 'bg-white/80 border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <Cpu className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
                <span>Association Rule Mining</span>
              </div>
              <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700/50 text-slate-300'
                  : 'bg-white/80 border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
                <span>Citizen Journey Simulator</span>
              </div>
              <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700/50 text-slate-300'
                  : 'bg-white/80 border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span>Cross-Portal Integration Scoring</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 4: Main Action Button */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4"
            >
              <button
                onClick={handleEnter}
                onMouseEnter={() => sound.playHover()}
                disabled={isTransitioning}
                className="group relative inline-flex items-center justify-center px-9 py-4 text-base font-bold text-white tracking-wide rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 transition-all duration-500 group-hover:opacity-95 opacity-100" />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className={`absolute inset-px rounded-[15px] ${isDark ? 'bg-[#080D1C]/40' : 'bg-[#0F172A]/20'} backdrop-blur-sm`} />

                <span className="relative z-10 flex items-center space-x-3 text-white">
                  <span>EXPLORE KRATOS</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 text-cyan-200" />
                  </motion.span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer System Notice */}
      <footer className={`relative z-10 w-full px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-xs border-t transition-colors ${
        isDark
          ? 'text-slate-400 border-slate-800/60 bg-[#050816]/70 backdrop-blur-md'
          : 'text-slate-500 border-slate-200 bg-white/70 backdrop-blur-md'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-cyan-400' : 'bg-sky-500'}`}></span>
          <span className="font-mono">ENGINE STATUS: OPERATIONAL</span>
          <span className="text-slate-400">|</span>
          <span className={isDark ? 'text-amber-400 font-medium' : 'text-amber-700 font-medium'}>
            SYNTHETIC RESEARCH DATASET &bull; ILLUSTRATIVE ANALYSIS
          </span>
        </div>
        <div className="mt-2 sm:mt-0 font-mono">
          PROJECT KRATOS v2.0 &bull; 20,000 SIMULATED JOURNEYS &bull; 30 SERVICES
        </div>
      </footer>
    </div>
  );
}
