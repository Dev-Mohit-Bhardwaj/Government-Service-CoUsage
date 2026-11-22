import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  GitMerge,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function ExploratoryAnalysisPage() {
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pairs');

  const { isDark } = useTheme();

  useEffect(() => {
    async function fetchEDA() {
      try {
        setLoading(true);
        const data = await api.getEDA();
        setEdaData(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load exploratory data analysis');
      } finally {
        setLoading(false);
      }
    }
    fetchEDA();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synthesizing multi-variable exploratory patterns..." />;
  }

  if (error) {
    return (
      <div className={`p-8 max-w-xl mx-auto my-12 rounded-2xl border text-center ${
        isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="text-lg font-bold text-red-500 mb-2">Error Loading EDA Insights</h3>
        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
      </div>
    );
  }

  const { service_distribution, journey_length_distribution, frequent_pairs, category_distribution, synthetic_pattern_distribution } = edaData;

  const maxPairCount = Math.max(...frequent_pairs.map(p => p.Journey_Count), 1);
  const maxSvcCount = Math.max(...service_distribution.map(s => s.Journey_Count), 1);

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-8 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <BarChart3 className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>Exploratory Data Analysis</span>
            </h2>
            <p className={`text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Statistical properties, co-occurrence distributions, and demographic structures across the citizen journeys.
            </p>
          </div>

          {/* Navigation Pills */}
          <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'pairs', label: 'Frequent Pairs' },
              { id: 'distribution', label: 'Service Distribution' },
              { id: 'categories', label: 'Category Breakdown' },
              { id: 'synthetic', label: 'Synthetic Archetypes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                      : 'bg-white text-sky-700 border border-slate-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: Frequent Service Pairs */}
      {activeTab === 'pairs' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border text-xs flex items-center space-x-3 ${
            isDark ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}>
            <GitMerge className="w-5 h-5 flex-shrink-0" />
            <span className="leading-relaxed">
              <strong>Top 25 Pairwise Co-Occurrences:</strong> Services frequently utilized within the same citizen journey prior to rule directionality.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {frequent_pairs.map((pair, idx) => {
              const barWidth = ((pair.Journey_Count / maxPairCount) * 100).toFixed(1);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                  className="p-5 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`font-mono font-bold w-6 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                        #{idx + 1}
                      </span>
                      <span className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {pair.Service_1}
                      </span>
                      <span className="text-slate-400">&harr;</span>
                      <span className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {pair.Service_2}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ml-2 flex-shrink-0 ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                      {pair.Journey_Count.toLocaleString()}
                    </span>
                  </div>

                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                          : 'bg-gradient-to-r from-sky-500 to-indigo-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Service Distribution */}
      {activeTab === 'distribution' && (
        <div className="p-8 rounded-3xl glass-panel space-y-5">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Full Catalogue Service Share
          </h3>
          <div className="space-y-4">
            {service_distribution.map((svc, i) => {
              const barWidth = ((svc.Journey_Count / maxSvcCount) * 100).toFixed(1);
              return (
                <div key={svc.Service_ID} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className={`font-mono font-bold w-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                        #{i + 1}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {svc.Service_Name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {svc.Category}
                      </span>
                    </div>
                    <div className="font-mono text-xs">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {svc.Journey_Count.toLocaleString()} journeys
                      </span>
                      <span className={`ml-2 font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                        ({svc.Percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        isDark
                          ? 'bg-gradient-to-r from-sky-400 to-cyan-500'
                          : 'bg-gradient-to-r from-sky-500 to-blue-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Category Distribution */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category_distribution.map((cat, i) => (
            <div
              key={cat.Category}
              className="p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  CATEGORY #{i + 1}
                </span>
                <h4 className={`text-xl font-bold mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {cat.Category}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Contains {cat.Number_of_Services} catalogued digital government services.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/20 flex items-center justify-between">
                <span className="text-xs text-slate-400">Catalogue Share</span>
                <span className={`text-lg font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                  {((cat.Number_of_Services / 30) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Synthetic Archetypes */}
      {activeTab === 'synthetic' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border text-xs flex items-start space-x-3 ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-sm mb-1">Dataset Design &amp; Architectural Transparency</p>
              <p className="leading-relaxed">
                The <strong>Journey_Type_Synthetic</strong> attribute represents generator assumption metadata used to populate the simulation.
                It is treated strictly as exploratory metadata and is <strong>never</strong> fed as an input feature into the unsupervised association mining pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {synthetic_pattern_distribution.map((pat) => (
              <div
                key={pat.Journey_Type}
                className="p-6 rounded-3xl glass-panel glass-panel-hover flex items-center justify-between"
              >
                <div>
                  <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {pat.Journey_Type.replace('_', ' ')}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Simulated Persona Group
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-amber-500">
                    {pat.Journey_Count.toLocaleString()}
                  </span>
                  <p className="text-xs text-slate-400 font-mono">
                    {((pat.Journey_Count / 20000) * 100).toFixed(1)}% of dataset
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
