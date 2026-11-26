import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  Search,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Zap,
  Activity
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function AssociationRulesPage() {
  const [rulesData, setRulesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [minSupport, setMinSupport] = useState(0.01);
  const [minConfidence, setMinConfidence] = useState(0.30);
  const [minLift, setMinLift] = useState(1.0);
  const [maxAntecedentLen, setMaxAntecedentLen] = useState('ALL');
  const [removeRedundant, setRemoveRedundant] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('confidence');

  // Comparison State
  const [compareData, setCompareData] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState('cards');

  const { isDark } = useTheme();

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.getRules({
        minSupport,
        minConfidence,
        minLift,
        maxAntecedentLen: maxAntecedentLen === 'ALL' ? null : parseInt(maxAntecedentLen, 10),
        singleConsequentOnly: true,
        removeRedundant
      });
      setRulesData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve association rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [minSupport, minConfidence, minLift, maxAntecedentLen, removeRedundant]);

  const handleRunComparison = async () => {
    sound.playClick();
    try {
      setComparing(true);
      const res = await api.compareAlgorithms({
        minSupport,
        minConfidence,
        minLift,
        includeSweep: true
      });
      setCompareData(res);
      setShowComparison(true);
      sound.playChime(3);
    } catch (err) {
      alert(`Benchmark error: ${err.message}`);
    } finally {
      setComparing(false);
    }
  };

  const filteredRules = React.useMemo(() => {
    if (!rulesData?.rules) return [];
    return rulesData.rules
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.Rule.toLowerCase().includes(q) ||
          r.Antecedent_Names.toLowerCase().includes(q) ||
          r.Consequent_Names.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'confidence') return b.Confidence - a.Confidence;
        if (sortBy === 'lift') return b.Lift - a.Lift;
        return b.Support - a.Support;
      });
  }, [rulesData, search, sortBy]);

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Header & Benchmark CTA */}
      <div className="p-8 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <GitFork className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>Association Rule Explorer</span>
            </h2>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30' : 'bg-sky-50 text-sky-700 border-sky-300'
            }`}>
              APRIORI &bull; FP-GROWTH &bull; H-MINE &bull; ECLAT
            </span>
          </div>
          <p className={`text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Uncover empirical co-usage rules among citizen services. Rules indicate complementary cross-service synergy, not chronological prerequisites.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunComparison}
            onMouseEnter={() => sound.playHover()}
            disabled={comparing}
            className={`px-5 py-3 rounded-2xl border text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
              isDark
                ? 'bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border-violet-500/40 shadow-glow-violet'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{comparing ? 'Benchmarking 4 Algos...' : '4-Algorithm Benchmark'}</span>
          </button>

          {/* Cards/Table toggle */}
          <div className={`flex items-center space-x-1.5 p-1 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('cards');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                viewMode === 'cards'
                  ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('table');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                viewMode === 'table'
                  ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* 4-Algorithm Benchmark Modal/Panel */}
      <AnimatePresence>
        {showComparison && compareData && (() => {
          const algoList = compareData.algorithms || [
            compareData.apriori,
            compareData.fpgrowth,
            compareData.hmine,
            compareData.eclat
          ].filter(Boolean);

          const maxRuntime = Math.max(...algoList.map(a => a.execution_time_seconds || 0), 0.0001);
          const maxMemory = Math.max(...algoList.map(a => a.peak_memory_kb || 0), 1);

          const algoPalette = {
            apriori: {
              text: isDark ? 'text-violet-400' : 'text-indigo-600',
              bar: 'bg-violet-500',
              badge: isDark ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
              stroke: '#8b5cf6'
            },
            fpgrowth: {
              text: isDark ? 'text-cyan-400' : 'text-sky-600',
              bar: 'bg-cyan-500',
              badge: isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-sky-100 text-sky-700 border-sky-200',
              stroke: '#06b6d4'
            },
            hmine: {
              text: isDark ? 'text-emerald-400' : 'text-emerald-600',
              bar: 'bg-emerald-500',
              badge: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
              stroke: '#10b981'
            },
            eclat: {
              text: isDark ? 'text-amber-400' : 'text-amber-600',
              bar: 'bg-amber-500',
              badge: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200',
              stroke: '#f59e0b'
            }
          };

          const sweepRows = compareData.support_sweep || [];
          const maxSweepTime = sweepRows.length
            ? Math.max(...sweepRows.flatMap(r => ['apriori', 'fpgrowth', 'hmine', 'eclat'].map(k => r[k] || 0)), 0.001)
            : 1;

          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-8 rounded-3xl border space-y-6 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-br from-[#0B1224] to-[#120F2E] border-violet-500/40 shadow-glass'
                  : 'bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/60 border-indigo-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-200/30 pb-4">
                <div className="flex items-center space-x-3">
                  <Cpu className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      4-Algorithm Empirical Benchmark Comparison
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      {compareData.parameters?.transaction_count?.toLocaleString()} journeys &times; {compareData.parameters?.service_count} services &bull; min_sup {(compareData.parameters?.min_support * 100).toFixed(1)}% &bull; min_conf {(compareData.parameters?.min_confidence * 100).toFixed(0)}% &bull; min_lift {compareData.parameters?.min_lift?.toFixed(1)}x
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowComparison(false);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close Panel &times;
                </button>
              </div>

              {/* Equivalence & Winner Summary Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  compareData.identical_results
                    ? isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-red-950/30 border-red-500/30' : 'bg-red-50 border-red-200'
                }`}>
                  <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${compareData.identical_results ? 'text-emerald-500' : 'text-red-500'}`} />
                  <div>
                    <span className="text-slate-400 block text-[10px]">MATHEMATICAL EQUIVALENCE (4/4)</span>
                    <span className={`text-sm font-bold ${compareData.identical_results ? 'text-emerald-500' : 'text-red-500'}`}>
                      {compareData.identical_results ? '100% IDENTICAL ITEMSETS & RULES' : 'DISCREPANCY DETECTED'}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <Zap className="w-6 h-6 flex-shrink-0 text-amber-500" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">FASTEST ENGINE</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {compareData.fastest_algorithm_name} ({compareData.max_speedup_vs_apriori}x vs Apriori)
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <Activity className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
                  <div>
                    <span className="text-slate-400 block text-[10px]">SHARED OUTPUT VOLUME</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {compareData.apriori?.itemset_count} Itemsets &rarr; {compareData.apriori?.rules_generated_count} Rules
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Algorithm Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                {algoList.map((algo) => {
                  const palette = algoPalette[algo.key] || algoPalette.apriori;
                  const isFastest = algo.key === compareData.fastest_algorithm;
                  const timePct = Math.max(((algo.execution_time_seconds || 0) / maxRuntime) * 100, 4);
                  const memPct = Math.max(((algo.peak_memory_kb || 0) / maxMemory) * 100, 4);

                  return (
                    <div
                      key={algo.key}
                      className={`p-5 rounded-2xl border space-y-3 relative ${
                        isFastest
                          ? isDark ? 'bg-slate-900/95 border-emerald-500/50 shadow-glow-cyan' : 'bg-white border-emerald-300 shadow-md'
                          : isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {algo.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                          isFastest
                            ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : palette.badge
                        }`}>
                          #{algo.rank_by_speed}{isFastest ? ' FASTEST' : ''}
                        </span>
                      </div>

                      <div>
                        <p className={`text-2xl font-bold ${palette.text}`}>
                          {algo.execution_time_seconds.toFixed(4)}s
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {(algo.execution_time_seconds * 1000).toFixed(1)} ms &bull; {algo.speedup_vs_apriori}x vs Apriori
                        </span>
                      </div>

                      {/* Relative Runtime Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Runtime Share</span>
                          <span>{(algo.execution_time_seconds * 1000).toFixed(1)} ms</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${palette.bar}`} style={{ width: `${timePct}%` }} />
                        </div>
                      </div>

                      {/* Relative Memory Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Peak Memory</span>
                          <span>{algo.peak_memory_kb.toFixed(1)} KB</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full opacity-75 ${palette.bar}`} style={{ width: `${memPct}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/15 flex justify-between text-[10px] text-slate-400">
                        <span>{algo.itemset_count} itemsets</span>
                        <span>{algo.rules_generated_count} rules</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side-by-Side Comparison Matrix */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
              }`}>
                <div className="px-5 py-3 border-b border-slate-200/15 flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Parameter-by-Parameter Algorithmic Matrix
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    All 4 algorithms evaluated on identical boolean matrix
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`font-mono text-[11px] uppercase border-b ${
                      isDark ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Algorithm</th>
                        <th className="py-3 px-4">Data Layout</th>
                        <th className="py-3 px-4">Search Strategy</th>
                        <th className="py-3 px-4">Candidate Gen</th>
                        <th className="py-3 px-4">DB Scans</th>
                        <th className="py-3 px-4 text-right">Runtime (s)</th>
                        <th className="py-3 px-4 text-right">Speedup</th>
                        <th className="py-3 px-4 text-right">Peak RAM (KB)</th>
                        <th className="py-3 px-4 text-right">Itemsets</th>
                        <th className="py-3 px-4 text-right">Rules (Lift &ge; {compareData.parameters?.min_lift})</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/70 text-slate-200' : 'divide-slate-100 text-slate-700'}`}>
                      {algoList.map((algo) => {
                        const palette = algoPalette[algo.key] || algoPalette.apriori;
                        return (
                          <tr key={algo.key} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                            <td className={`py-3 px-4 font-bold ${palette.text}`}>{algo.name}</td>
                            <td className="py-3 px-4">{algo.data_layout}</td>
                            <td className="py-3 px-4">{algo.search_strategy}</td>
                            <td className="py-3 px-4">{algo.candidate_generation}</td>
                            <td className="py-3 px-4 font-mono">{algo.dataset_scans}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold">{algo.execution_time_seconds.toFixed(4)}s</td>
                            <td className="py-3 px-4 text-right font-mono">{algo.speedup_vs_apriori}x</td>
                            <td className="py-3 px-4 text-right font-mono">{algo.peak_memory_kb.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right font-mono">{algo.itemset_count}</td>
                            <td className="py-3 px-4 text-right font-mono">
                              {algo.rules_generated_count} ({algo.surviving_rules_count})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Support Threshold Scalability Sweep */}
              {sweepRows.length > 0 && (
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Threshold Scalability Sweep (Execution Time vs. Min Support)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Lower minimum support yields exponentially more frequent itemsets, testing candidate-generation vs. tree/pointer/vertical scaling.
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] font-mono">
                      {algoList.map((algo) => (
                        <span key={algo.key} className="flex items-center space-x-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${algoPalette[algo.key]?.bar}`} />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{algo.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {sweepRows.map((row) => (
                      <div
                        key={row.min_support}
                        className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                            {(row.min_support * 100).toFixed(1)}% sup
                          </span>
                          <span className="text-slate-400">{row.itemset_count} sets</span>
                        </div>
                        <div className="space-y-1.5">
                          {algoList.map((algo) => {
                            const val = row[algo.key] || 0;
                            const pct = Math.max((val / maxSweepTime) * 100, 4);
                            return (
                              <div key={algo.key} className="space-y-0.5">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                  <span>{algo.name}</span>
                                  <span>{(val * 1000).toFixed(1)} ms</span>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                  <div className={`h-full rounded-full ${algoPalette[algo.key]?.bar}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Filter Controls */}
      <div className="p-6 rounded-3xl glass-panel space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Min Support */}
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Min Support</span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                {(minSupport * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.08"
              step="0.005"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Min Confidence */}
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Min Confidence</span>
              <span className={`font-bold ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Min Lift */}
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Min Lift</span>
              <span className="font-bold text-amber-500">{minLift.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Antecedent Size */}
          <div>
            <span className={`block text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Max Antecedent Items
            </span>
            <select
              value={maxAntecedentLen}
              onChange={(e) => setMaxAntecedentLen(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <option value="ALL">Any Length</option>
              <option value="1">1 Service Only</option>
              <option value="2">Up to 2 Services</option>
              <option value="3">Up to 3 Services</option>
            </select>
          </div>
        </div>

        {/* Second Row: Search, Redundancy, Sort */}
        <div className="pt-4 border-t border-slate-200/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rule services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-8 pr-3 py-2 rounded-xl border focus:outline-none w-56 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                }`}
              />
            </div>

            <label className={`flex items-center space-x-2 cursor-pointer select-none font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={removeRedundant}
                onChange={(e) => {
                  sound.playClick();
                  setRemoveRedundant(e.target.checked);
                }}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span>Prune Redundant Rules</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  sound.playClick();
                  setSortBy(e.target.value);
                }}
                className={`px-3 py-1.5 rounded-xl border cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                <option value="confidence">Confidence (High to Low)</option>
                <option value="lift">Lift (High to Low)</option>
                <option value="support">Support (High to Low)</option>
              </select>
            </div>

            {rulesData && (
              <span className="font-mono text-slate-400">
                Found <strong className={isDark ? 'text-cyan-400' : 'text-sky-600'}>{filteredRules.length}</strong> rules
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Mining frequent itemsets and computing conditional probabilities..." />
      ) : error ? (
        <div className={`p-8 max-w-xl mx-auto rounded-2xl border text-center ${
          isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-lg font-bold text-red-500 mb-2">Mining Engine Notice</h3>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-panel">
          <GitFork className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            No Rules Match Selected Thresholds
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try reducing the minimum support or confidence sliders to reveal broader co-occurrence associations.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visual Rule Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRules.map((rule, idx) => {
            const isHighLift = rule.Lift >= 1.3;
            const isHighConf = rule.Confidence >= 0.50;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.3) }}
                className="p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-3">
                    <span>RULE #{idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      {isHighLift && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          High Synergy
                        </span>
                      )}
                      {isHighConf && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-sky-100 text-sky-800'
                        }`}>
                          Strong Predictive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Graphic Antecedent -> Consequent */}
                  <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Antecedent (If Used)</span>
                      <p className={`text-sm font-bold mt-1 leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rule.Antecedent_Names}
                      </p>
                    </div>

                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border ${
                      isDark ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-sky-100 border-sky-300 text-sky-700'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Consequent (Complement)</span>
                      <p className={`text-sm font-bold mt-1 leading-snug ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                        {rule.Consequent_Names}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Bar */}
                <div className="pt-3 border-t border-slate-200/20 grid grid-cols-3 gap-3 text-center font-mono">
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">CONFIDENCE</span>
                    <span className={`text-base font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {(rule.Confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">LIFT</span>
                    <span className="text-base font-bold text-amber-500">
                      {rule.Lift.toFixed(2)}x
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">SUPPORT</span>
                    <span className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {(rule.Support * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Full Data Table View */
        <div className="rounded-3xl glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`font-mono uppercase tracking-wider border-b ${
                isDark ? 'bg-slate-900/90 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Rule Expression</th>
                  <th className="py-4 px-6 text-right">Confidence</th>
                  <th className="py-4 px-6 text-right">Lift</th>
                  <th className="py-4 px-6 text-right">Support</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-sans ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {filteredRules.map((rule, idx) => (
                  <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className={`py-4 px-6 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {idx + 1}
                    </td>
                    <td className={`py-4 px-6 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rule.Antecedent_Names}
                      </span>
                      <span className="text-cyan-500 mx-2 font-mono">&rarr;</span>
                      <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                        {rule.Consequent_Names}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-right font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {(rule.Confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-amber-500">
                      {rule.Lift.toFixed(2)}x
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-400">
                      {(rule.Support * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
