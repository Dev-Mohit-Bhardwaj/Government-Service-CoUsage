import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Grid,
  Layers,
  Activity,
  GitFork,
  ShieldCheck,
  TrendingUp,
  Compass,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import MetricCountUp from '../components/common/MetricCountUp';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function OverviewPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const result = await api.getOverview();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to connect to KRATOS backend service');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating government intelligence metrics..." />;
  }

  if (error) {
    return (
      <div className={`p-8 max-w-xl mx-auto my-12 rounded-2xl border text-center ${
        isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="text-lg font-bold text-red-500 mb-2">Backend Connection Alert</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
        <p className="text-xs text-slate-400 font-mono">Ensure FastAPI backend is running at http://127.0.0.1:8000</p>
      </div>
    );
  }

  const { kpis, top_services, category_distribution, journey_length_distribution, pattern_distribution } = data;

  const kpiCards = [
    {
      title: "Total Citizen Journeys",
      value: kpis.total_journeys,
      icon: Users,
      color: isDark ? "from-cyan-500/20 to-blue-600/20" : "from-sky-100 to-blue-100",
      textColor: isDark ? "text-cyan-400" : "text-sky-600",
      description: "Unique citizen journey paths simulated across 30 services",
      decimals: 0
    },
    {
      title: "Catalogued Services",
      value: kpis.total_services,
      icon: Grid,
      color: isDark ? "from-violet-500/20 to-purple-600/20" : "from-indigo-100 to-purple-100",
      textColor: isDark ? "text-violet-400" : "text-indigo-600",
      description: "Distributed across 10 functional civic categories",
      decimals: 0
    },
    {
      title: "Service Interactions",
      value: kpis.total_interactions,
      icon: Layers,
      color: isDark ? "from-indigo-500/20 to-cyan-600/20" : "from-blue-100 to-sky-100",
      textColor: isDark ? "text-indigo-400" : "text-blue-600",
      description: "Total cross-service transaction touchpoints recorded",
      decimals: 0
    },
    {
      title: "Mean Services / Journey",
      value: kpis.avg_services_per_journey,
      icon: Activity,
      color: isDark ? "from-amber-500/20 to-yellow-600/20" : "from-amber-100 to-orange-100",
      textColor: isDark ? "text-amber-400" : "text-amber-600",
      description: `Median: ${kpis.median_services_per_journey} (Range: ${kpis.min_services_per_journey} – ${kpis.max_services_per_journey})`,
      decimals: 2
    },
    {
      title: "Frequent Itemsets Mined",
      value: kpis.frequent_itemsets_count,
      icon: TrendingUp,
      color: isDark ? "from-sky-500/20 to-cyan-600/20" : "from-sky-100 to-cyan-100",
      textColor: isDark ? "text-sky-400" : "text-sky-700",
      description: "FP-Growth co-occurring service combinations",
      decimals: 0
    },
    {
      title: "Association Rules",
      value: kpis.rules_generated_count,
      icon: GitFork,
      color: isDark ? "from-purple-500/20 to-pink-600/20" : "from-purple-100 to-pink-100",
      textColor: isDark ? "text-purple-400" : "text-purple-700",
      description: "Calculated at min support 0.01 & confidence 0.20",
      decimals: 0
    },
    {
      title: "Lift Surviving Rules",
      value: kpis.surviving_rules_count,
      icon: Sparkles,
      color: isDark ? "from-emerald-500/20 to-teal-600/20" : "from-emerald-100 to-teal-100",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      description: "Rules with Lift ≥ 1.0 exhibiting positive association",
      decimals: 0
    },
    {
      title: "Lift Survival Share",
      value: kpis.lift_survival_percentage,
      icon: ShieldCheck,
      color: isDark ? "from-teal-500/20 to-cyan-600/20" : "from-teal-100 to-cyan-100",
      textColor: isDark ? "text-teal-400" : "text-teal-700",
      suffix: "%",
      description: "Empirically significant rules filtered for policy use",
      decimals: 1
    }
  ];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative overflow-hidden rounded-3xl p-8 md:p-12 border ${
          isDark
            ? 'border-cyan-500/20 bg-gradient-to-r from-[#080D1C] via-[#0B1224] to-[#080D1C] shadow-glass'
            : 'border-slate-200 bg-gradient-to-r from-white via-sky-50/50 to-white shadow-md'
        }`}
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono ${
            isDark
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-sky-100 border-sky-300 text-sky-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI GOVERNANCE INTELLIGENCE PLATFORM</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Government Service Intelligence
          </h2>

          <p className={`text-base sm:text-lg leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Discover co-usage patterns, explore inter-departmental service relationships, and identify high-value integration opportunities for a seamlessly connected citizen experience.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('network');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-[#050816] shadow-glow-cyan'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
              }`}
            >
              <span>Explore Service Network</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('simulator');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl border font-medium text-sm transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border-cyan-500/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              }`}
            >
              <Compass className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>Launch Journey Simulator</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Background Glows */}
        <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-cyan-500/10' : 'bg-sky-400/20'
        }`} />
      </motion.div>

      {/* KPI Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h3 className={`text-xs font-mono tracking-wider uppercase flex items-center space-x-2 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Activity className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
          <span>Core Analytical Metrics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {kpi.title}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                    <Icon className={`w-4 h-4 ${kpi.textColor}`} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${kpi.textColor}`}>
                    <MetricCountUp
                      value={kpi.value}
                      decimals={kpi.decimals}
                      suffix={kpi.suffix || ''}
                    />
                  </div>
                  <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {kpi.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Section: Most Popular Services & Journey Length Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Top Services Card */}
        <div className="p-8 rounded-3xl glass-panel space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Most Utilized Services
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Services occurring in the highest percentage of citizen journeys
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('popularity');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`text-xs font-mono flex items-center space-x-1 cursor-pointer ${
                isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-800'
              }`}
            >
              <span>View All 30</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {top_services.map((svc, i) => (
              <div key={svc.Service_ID} className="group space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono font-bold w-6 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      #{i + 1}
                    </span>
                    <span className={`font-medium transition-colors ${
                      isDark ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-sky-700'
                    }`}>
                      {svc.Service_Name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {svc.Category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {svc.Journey_Count.toLocaleString()} journeys
                    </span>
                    <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                      {svc.Popularity_Percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${svc.Popularity_Percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                    className={`h-full rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-glow-cyan'
                        : 'bg-gradient-to-r from-sky-500 to-blue-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Length Distribution */}
        <div className="p-8 rounded-3xl glass-panel space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Journey Complexity Distribution
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Histogram of services utilized per individual citizen journey
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('eda');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`text-xs font-mono flex items-center space-x-1 cursor-pointer ${
                isDark ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-600 hover:text-indigo-800'
              }`}
            >
              <span>EDA Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {journey_length_distribution.map((dist, idx) => {
              const maxCount = Math.max(...journey_length_distribution.map(d => d.Journey_Count));
              const pct = ((dist.Journey_Count / maxCount) * 100);
              const journeyShare = ((dist.Journey_Count / kpis.total_journeys) * 100).toFixed(1);

              return (
                <div key={dist.Number_of_Services} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {dist.Number_of_Services} {dist.Number_of_Services === 1 ? 'Service' : 'Services'}
                    </span>
                    <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {dist.Journey_Count.toLocaleString()} journeys ({journeyShare}%)
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: idx * 0.08 }}
                      className={`h-full rounded-full ${
                        isDark
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-400'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section: Category Distribution & Synthetic Patterns Notice */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel space-y-4">
          <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Catalogued Service Categories
          </h4>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Distribution of government services across 10 functional civic areas
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-2">
            {category_distribution.map((cat) => (
              <div
                key={cat.Category}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <span className={`text-xs font-semibold truncate ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`} title={cat.Category}>
                  {cat.Category}
                </span>
                <span className={`text-xl font-mono font-bold mt-3 ${
                  isDark ? 'text-cyan-400' : 'text-sky-600'
                }`}>
                  {cat.Number_of_Services} <span className="text-[10px] font-normal text-slate-400">services</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Synthetic Journey Patterns */}
        <div className="p-8 rounded-3xl glass-panel flex flex-col justify-between space-y-4">
          <div>
            <div className={`flex items-center space-x-2 text-xs font-mono mb-2 ${
              isDark ? 'text-amber-400' : 'text-amber-700'
            }`}>
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>EXPLORATORY METADATA</span>
            </div>
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Synthetic Archetypes
            </h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Used strictly for validation, not as an input feature for mining.
            </p>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 mt-4">
              {pattern_distribution.map((pat) => (
                <div key={pat.Journey_Type} className={`flex items-center justify-between text-xs py-1.5 border-b ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <span className={`truncate max-w-[170px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={pat.Journey_Type}>
                    {pat.Journey_Type.replace('_', ' ')}
                  </span>
                  <span className={`font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {pat.Journey_Count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`pt-4 border-t text-[11px] font-mono ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            20,000 synthetic citizen paths verified.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
