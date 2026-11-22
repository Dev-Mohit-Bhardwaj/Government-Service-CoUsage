import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  Sliders,
  Search,
  ArrowRight,
  Cpu,
  Table as TableIcon
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
      const res = await api.compareAlgorithms(minSupport);
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
              FP-GROWTH / APRIORI
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
            <span>{comparing ? 'Benchmarking...' : 'Benchmark: Apriori vs FP-Growth'}</span>
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

      {/* Algorithm Benchmark Modal/Panel */}
      <AnimatePresence>
        {showComparison && compareData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-8 rounded-3xl border space-y-5 shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-[#0B1224] to-[#120F2E] border-violet-500/40 shadow-glass'
                : 'bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/60 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-indigo-200/30 pb-4">
              <div className="flex items-center space-x-2">
                <Cpu className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Empirical Mining Benchmark Comparison
                </h3>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowComparison(false);
                }}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Close Panel &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-slate-400">FP-Growth Execution</span>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                  {compareData.fpgrowth.execution_time_seconds}s
                </p>
                <span className="text-[11px] text-slate-400">{compareData.fpgrowth.itemset_count} itemsets</span>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-slate-400">Apriori Execution</span>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>
                  {compareData.apriori.execution_time_seconds}s
                </p>
                <span className="text-[11px] text-slate-400">{compareData.apriori.itemset_count} itemsets</span>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-slate-400">Speedup Factor</span>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  {compareData.speedup_factor}x faster
                </p>
                <span className="text-[11px] text-slate-400">FP-Tree compression advantage</span>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-slate-400">Mathematical Equivalence</span>
                <p className="text-2xl font-bold text-teal-500 mt-1">
                  {compareData.identical_results ? '100% MATCH' : 'DISCREPANCY'}
                </p>
                <span className="text-[11px] text-slate-400">Identical itemsets verified</span>
              </div>
            </div>
          </motion.div>
        )}
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
