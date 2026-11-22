import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Workflow,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function IntegrationPlanningPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Criteria Weights
  const [weightConf, setWeightConf] = useState(0.30);
  const [weightLift, setWeightLift] = useState(0.25);
  const [weightSupp, setWeightSupp] = useState(0.15);
  const [weightPlat, setWeightPlat] = useState(0.15);
  const [weightCat, setWeightCat] = useState(0.15);

  const [minConf, setMinConf] = useState(0.30);
  const [minLift, setMinLift] = useState(1.05);

  const { isDark } = useTheme();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegration({
        minConfidence: minConf,
        minLift,
        topN: 50,
        weights: {
          confidence: weightConf,
          lift: weightLift,
          support: weightSupp,
          cross_platform: weightPlat,
          cross_category: weightCat
        }
      });
      setOpportunities(res.opportunities || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load strategic integration opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [weightConf, weightLift, weightSupp, weightPlat, weightCat, minConf, minLift]);

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Header & Simulated Platform Mapping Notice */}
      <div className="p-8 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Workflow className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>Government Service Integration Opportunities</span>
            </h2>
            <p className={`text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Identify and prioritize high-value cross-departmental and cross-portal digital integrations
              driven by multi-criteria empirical co-usage evaluations.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block">PRIORITIZED CANDIDATES</span>
            <span className={`text-2xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
              {opportunities.length} Opportunities
            </span>
          </div>
        </div>

        {/* Platform Mapping Disclaimer */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
          isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Illustrative Simulated Platform Mappings:</strong> Platform identifiers (e.g. P01, P02) are synthetic placeholders used to model cross-portal fragmentation and API interoperability. They do <em>not</em> represent verified live government systems.
          </p>
        </div>
      </div>

      {/* Multi-Criteria Weighting Controls */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-2 ${
            isDark ? 'text-cyan-400' : 'text-sky-600'
          }`}>
            <Sliders className="w-4 h-4" />
            <span>Strategic Opportunity Multi-Criteria Weights</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            Total Normalized: {(weightConf + weightLift + weightSupp + weightPlat + weightCat).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 pt-2">
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Confidence</span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>{weightConf.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weightConf}
              onChange={(e) => setWeightConf(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Directional Predictability</span>
          </div>

          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Lift Synergy</span>
              <span className={`font-bold ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>{weightLift.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weightLift}
              onChange={(e) => setWeightLift(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Statistical Co-Usage Boost</span>
          </div>

          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Support Volume</span>
              <span className="font-bold text-slate-400">{weightSupp.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weightSupp}
              onChange={(e) => setWeightSupp(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Citizen Journey Reach</span>
          </div>

          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Cross-Platform</span>
              <span className="font-bold text-amber-500">{weightPlat.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weightPlat}
              onChange={(e) => setWeightPlat(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Inter-Portal Need</span>
          </div>

          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>Cross-Category</span>
              <span className="font-bold text-emerald-500">{weightCat.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weightCat}
              onChange={(e) => setWeightCat(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Inter-Ministerial Need</span>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <LoadingSpinner message="Evaluating cross-category & cross-portal integration candidates..." />
      ) : error ? (
        <div className={`p-8 max-w-xl mx-auto rounded-2xl border text-center ${
          isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-lg font-bold text-red-500 mb-2">Integration Analysis Notice</h3>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-panel">
          <Workflow className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            No Integration Candidates Found
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try relaxing minimum confidence or lift parameters to discover broader opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp, idx) => {
            const isCrossCat = opp.Is_Cross_Category;
            const isCrossPlat = opp.Is_Cross_Platform;

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
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                      isDark ? 'bg-slate-800 text-cyan-300 border-slate-700' : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      RANK #{opp.Rank || idx + 1}
                    </span>

                    <div className="flex items-center space-x-2">
                      {isCrossCat && (
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                          isDark
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          Cross-Departmental
                        </span>
                      )}
                      {isCrossPlat && (
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                          isDark
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          Inter-Portal API
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Pair */}
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">INITIATING SERVICE</span>
                        <p className={`font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {opp.Antecedent_Services}
                        </p>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                          Domain: {opp.Antecedent_Categories} (Platform: {opp.Antecedent_Platforms})
                        </span>
                      </div>

                      <div className="flex-shrink-0 px-2 text-cyan-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">TARGET INTEGRATION</span>
                        <p className={`font-bold mt-1 ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                          {opp.Consequent_Services}
                        </p>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>
                          Domain: {opp.Consequent_Categories} (Platform: {opp.Consequent_Platforms})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Rationale */}
                  <p className={`mt-3 text-xs leading-relaxed italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    &ldquo;{opp.Strategic_Rationale}&rdquo;
                  </p>
                </div>

                {/* Score & Metrics Bar */}
                <div className="pt-3 border-t border-slate-200/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span>Conf: <strong className={isDark ? 'text-cyan-400' : 'text-sky-600'}>{(opp.Confidence * 100).toFixed(0)}%</strong></span>
                    <span>Lift: <strong className="text-amber-500">{opp.Lift.toFixed(2)}x</strong></span>
                    <span>Supp: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{(opp.Support * 100).toFixed(1)}%</strong></span>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {opp.Opportunity_Score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">SCORE / 100</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
