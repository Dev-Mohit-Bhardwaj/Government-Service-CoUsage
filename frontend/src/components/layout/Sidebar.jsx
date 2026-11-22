import React from 'react';
import {
  LayoutDashboard,
  Share2,
  TrendingUp,
  BarChart3,
  GitFork,
  Compass,
  Workflow,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  Network
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../services/soundService';

export const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Intelligence Overview', icon: LayoutDashboard, badge: null },
  { id: 'network', label: 'Service Network', icon: Share2, badge: 'Interactive' },
  { id: 'popularity', label: 'Service Popularity', icon: TrendingUp, badge: null },
  { id: 'eda', label: 'Exploratory Analysis', icon: BarChart3, badge: null },
  { id: 'rules', label: 'Association Rules', icon: GitFork, badge: 'Apriori / FP' },
  { id: 'simulator', label: 'Journey Simulator', icon: Compass, badge: 'Recommend' },
  { id: 'integration', label: 'Integration Planning', icon: Workflow, badge: 'Strategy' },
  { id: 'system', label: 'Dataset & Integrity', icon: ShieldCheck, badge: '8 Checks' },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onReturnToLanding
}) {
  const { isDark } = useTheme();

  const handleSelect = (tabId) => {
    sound.playClick();
    onSelectTab(tabId);
  };

  return (
    <aside
      className={`relative z-20 flex flex-col justify-between h-screen border-r transition-all duration-300 ease-in-out ${
        isDark
          ? 'border-slate-800/80 bg-[#080D1C]/95 backdrop-blur-xl'
          : 'border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm'
      } ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div
            onClick={() => {
              sound.playClick();
              onReturnToLanding();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
            title="Return to CIVIC ORBIT Landing"
          >
            <div className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
              isDark
                ? 'bg-gradient-to-br from-cyan-500/20 to-violet-600/30 border-cyan-400/30 group-hover:border-cyan-400/70 shadow-glow-cyan'
                : 'bg-sky-50 border-sky-200 group-hover:border-sky-400 shadow-sm'
            }`}>
              <Network className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                isDark ? 'text-cyan-400' : 'text-sky-600'
              }`} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className={`text-base font-bold tracking-wider truncate ${
                  isDark
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400'
                    : 'text-slate-900'
                }`}>
                  KRATOS
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                  GOV INTELLIGENCE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onToggleCollapse();
            }}
            onMouseEnter={() => sound.playHover()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List with Generous Item Padding */}
        <nav className="p-3.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-190px)]">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                onMouseEnter={() => sound.playHover()}
                className={`w-full flex items-center rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 group cursor-pointer relative ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                      : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full ${
                    isDark ? 'bg-cyan-400 shadow-glow-cyan' : 'bg-sky-600'
                  }`} />
                )}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? isDark ? 'text-cyan-400' : 'text-sky-600'
                      : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 ml-3.5 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isActive
                          ? isDark
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-sky-100 text-sky-700 border border-sky-200'
                          : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className={`p-4 border-t space-y-2.5 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => {
            sound.playClick();
            onReturnToLanding();
          }}
          onMouseEnter={() => sound.playHover()}
          className={`w-full flex items-center rounded-xl px-3.5 py-2.5 text-xs font-mono border transition-all cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 border-slate-700/40'
              : 'text-slate-600 hover:text-sky-700 hover:bg-slate-100 border-slate-200'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          title="Return to CIVIC ORBIT Landing View"
        >
          <div className="flex items-center space-x-2">
            <Globe className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
            {!isCollapsed && <span>Civic Orbit Intro</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] text-slate-400 font-mono">3D</span>}
        </button>

        {!isCollapsed && (
          <div className={`px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between ${
            isDark
              ? 'bg-slate-900/40 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FastAPI 2.0</span>
            </span>
            <span className={`font-mono font-semibold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
              READY
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
