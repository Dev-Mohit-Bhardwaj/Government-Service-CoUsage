import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Plus,
  X,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
  Zap,
  GraduationCap,
  Sprout,
  HeartHandshake,
  Home,
  Briefcase
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

const PERSONA_PRESETS = [
  {
    id: 'scholar',
    name: 'Higher Education Scholar',
    icon: GraduationCap,
    serviceIds: ['S01', 'S03'], // Scholarship + Income Certificate
    badge: 'Education & Revenue'
  },
  {
    id: 'farmer',
    name: 'Rural Agriculture Support',
    icon: Sprout,
    serviceIds: ['S15', 'S16', 'S17'], // Farmer Reg + Crop Insurance + Soil Health
    badge: 'Agriculture Domain'
  },
  {
    id: 'senior',
    name: 'Senior Pensioner Care',
    icon: HeartHandshake,
    serviceIds: ['S07', 'S08', 'S05'], // Pension + Life Cert + Aadhaar
    badge: 'Social Welfare & Identity'
  },
  {
    id: 'property',
    name: 'Property & Land Registry',
    icon: Home,
    serviceIds: ['S12', 'S13'], // Land Records + Property Registration
    badge: 'Land & Revenue'
  },
  {
    id: 'employment',
    name: 'Employment & Skilling',
    icon: Briefcase,
    serviceIds: ['S18', 'S19'], // Employment Reg + Skill Development
    badge: 'Workforce Development'
  }
];

export default function JourneySimulatorPage() {
  const [allServices, setAllServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Selected Basket
  const [selectedServiceIds, setSelectedServiceIds] = useState(['S01', 'S03']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Engine Settings
  const [rankingMetric, setRankingMetric] = useState('confidence');
  const [minConfidence, setMinConfidence] = useState(0.20);
  const [minLift, setMinLift] = useState(1.0);
  const [maxRecs, setMaxRecs] = useState(5);

  // Cinematic Discovery State
  const [recommendations, setRecommendations] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState(0); // 0: idle, 1: scanning, 2: ranking, 3: completed
  const [expandedRecId, setExpandedRecId] = useState(null);

  const { isDark } = useTheme();

  useEffect(() => {
    async function loadCatalogue() {
      try {
        setLoadingServices(true);
        const list = await api.getServices();
        setAllServices(list);
      } catch (err) {
        console.error('Failed to load services catalogue', err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadCatalogue();
  }, []);

  // Trigger Recommendations with Cinematic Staging & Chimes
  const handleDiscoverRecommendations = async () => {
    if (selectedServiceIds.length === 0) return;

    sound.playClick();
    setEvaluating(true);
    setEvaluationStage(1);
    sound.playScanTick();

    const stageTimer1 = setTimeout(() => {
      setEvaluationStage(2);
      sound.playScanTick();
    }, 450);

    try {
      const res = await api.getRecommendations({
        selectedServiceIds,
        maxRecommendations: maxRecs,
        minConfidence,
        minLift,
        rankingMetric
      });

      // Small deliberate theatrical pause for telemetry scanning feel
      setTimeout(() => {
        setRecommendations(res.recommendations);
        setEvaluationStage(3);
        setEvaluating(false);

        // Play ascending musical chimes as cards land
        if (res.recommendations && res.recommendations.length > 0) {
          res.recommendations.forEach((_, idx) => {
            setTimeout(() => {
              sound.playChime(idx);
            }, idx * 140);
          });
        }
      }, 850);

    } catch (err) {
      alert(`Recommendation engine error: ${err.message}`);
      setEvaluating(false);
      setEvaluationStage(0);
    }

    return () => clearTimeout(stageTimer1);
  };

  // Initial auto-recommendation on first mount
  useEffect(() => {
    if (allServices.length > 0 && selectedServiceIds.length > 0 && !recommendations) {
      handleDiscoverRecommendations();
    }
  }, [allServices]);

  const toggleService = (sid) => {
    sound.playHover();
    if (selectedServiceIds.includes(sid)) {
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== sid));
    } else {
      setSelectedServiceIds([...selectedServiceIds, sid]);
    }
  };

  const applyPreset = (preset) => {
    sound.playClick();
    setSelectedServiceIds(preset.serviceIds);
  };

  const categories = React.useMemo(() => {
    const cats = new Set(allServices.map(s => s.Category));
    return ['ALL', ...Array.from(cats)];
  }, [allServices]);

  const filteredCatalogue = React.useMemo(() => {
    return allServices.filter(s => {
      const matchCat = selectedCategory === 'ALL' || s.Category === selectedCategory;
      const matchSearch =
        s.Service_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.Service_ID.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allServices, selectedCategory, searchQuery]);

  const selectedServicesObjects = React.useMemo(() => {
    return selectedServiceIds
      .map(id => allServices.find(s => s.Service_ID === id))
      .filter(Boolean);
  }, [selectedServiceIds, allServices]);

  return (
    <div className="space-y-10 pb-28 max-w-7xl mx-auto">
      {/* Header & Transparency Notice */}
      <div className="p-8 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Compass className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>Citizen Journey Simulator</span>
            </h2>
            <p className={`text-sm mt-1 max-w-2xl leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Explore complementary government services based on observed co-usage patterns.
              Select services already accessed to discover empirically associated complementary offerings.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">Ranking:</span>
            <select
              value={rankingMetric}
              onChange={(e) => {
                sound.playClick();
                setRankingMetric(e.target.value);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500 shadow-sm'
              }`}
            >
              <option value="confidence">Confidence (Predictability)</option>
              <option value="lift">Lift (Synergy)</option>
              <option value="composite">Composite Score (50-30-20)</option>
            </select>
          </div>
        </div>

        {/* Ethical Non-Causal Framing Disclaimer */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
          isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Non-Causal Co-Usage Framing:</strong> Without longitudinal citizen event logs, KRATOS discovers <em>complementary co-occurrences</em> across distributed portals, not sequential predictive timelines. Services are recommended as complementary opportunities, not mandatory prerequisites.
          </p>
        </div>
      </div>

      {/* 1-Click Citizen Persona Quick Presets */}
      <div className="space-y-3">
        <span className={`text-xs font-mono uppercase tracking-wider block ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Quick-Start Citizen Personas (1-Click Templates)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {PERSONA_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isMatch =
              preset.serviceIds.every(id => selectedServiceIds.includes(id)) &&
              preset.serviceIds.length === selectedServiceIds.length;

            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                onMouseEnter={() => sound.playHover()}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isMatch
                    ? isDark
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-glow-cyan'
                      : 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm'
                    : isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-sky-300 text-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isMatch ? (isDark ? 'text-cyan-400' : 'text-sky-600') : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Basket Chips Panel */}
      <div className={`p-6 rounded-3xl glass-panel space-y-4 border ${
        isDark ? 'border-cyan-500/30' : 'border-sky-200 shadow-md'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-2 ${
            isDark ? 'text-cyan-400' : 'text-sky-600'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Citizen Basket ({selectedServiceIds.length} Selected)</span>
          </span>

          {selectedServiceIds.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                setSelectedServiceIds([]);
              }}
              onMouseEnter={() => sound.playHover()}
              className="text-xs text-slate-400 hover:text-red-500 font-mono flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Selection</span>
            </button>
          )}
        </div>

        {selectedServicesObjects.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No services currently selected. Pick services from the catalogue below to simulate a citizen journey.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {selectedServicesObjects.map((svc) => (
              <span
                key={svc.Service_ID}
                className={`inline-flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border shadow-sm ${
                  isDark
                    ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-200 shadow-glow-cyan'
                    : 'bg-sky-50 border-sky-300 text-sky-800'
                }`}
              >
                <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                  {svc.Service_ID}
                </span>
                <span>{svc.Service_Name}</span>
                <button
                  onClick={() => toggleService(svc.Service_ID)}
                  className="hover:text-red-400 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Discovery Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDiscoverRecommendations}
            onMouseEnter={() => sound.playHover()}
            disabled={evaluating || selectedServiceIds.length === 0}
            className={`px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
              selectedServiceIds.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isDark
                  ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-glow-cyan'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sky-600/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{evaluating ? 'Matching Association Rules...' : 'Discover Related Services'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Cinematic Telemetry Scanner Pipeline Banner when evaluating */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark
                ? 'bg-gradient-to-r from-[#080D1C] via-[#0F172A] to-[#080D1C] border-cyan-500/40 shadow-glow-cyan'
                : 'bg-gradient-to-r from-sky-50 via-white to-sky-50 border-sky-300 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400">
                <Zap className="w-4 h-4 animate-bounce" />
                <span>ASSOCIATION INFERENCE ENGINE &bull; ACTIVE SCAN</span>
              </div>
              <span className="text-xs font-mono text-slate-400 animate-pulse">
                {evaluationStage === 1 && 'Scanning 527 Rules...'}
                {evaluationStage === 2 && 'Scoring Cross-Platform Synergy...'}
                {evaluationStage === 3 && 'Synthesizing Explainable Insights...'}
              </span>
            </div>

            {/* Glowing Pipeline Bar */}
            <div className="relative w-full h-3 rounded-full bg-slate-800/80 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.0, ease: 'linear' }}
                className="w-1/3 h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 shadow-glow-cyan"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split Grid: Catalogue (Left) & Recommendations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Service Catalogue Selector (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Service Catalogue
            </h3>
            <span className="text-xs text-slate-400 font-mono">30 Services</span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:border-cyan-400'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 shadow-sm'
                }`}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700/60 text-slate-200 focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500 shadow-sm'
              }`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Service Cards Scroll List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredCatalogue.map((svc) => {
              const isSelected = selectedServiceIds.includes(svc.Service_ID);
              return (
                <div
                  key={svc.Service_ID}
                  onClick={() => toggleService(svc.Service_ID)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 shadow-glow-cyan'
                        : 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 hover:border-sky-300 text-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {svc.Service_ID}
                    </span>
                    <div className="truncate">
                      <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {svc.Service_Name}
                      </p>
                      <span className="text-[10px] text-slate-400">{svc.Category}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isSelected ? (
                      <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recommendations Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-4 rounded-2xl glass-panel flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <h3 className={`text-sm font-bold font-mono uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Complementary Recommendations
              </h3>
            </div>
            {recommendations && (
              <span className="text-xs font-mono text-slate-400">
                Found <strong className={isDark ? 'text-cyan-400' : 'text-sky-600'}>{recommendations.length}</strong> qualified services
              </span>
            )}
          </div>

          {evaluating ? (
            <LoadingSpinner message="Scanning 500+ association rules and evaluating antecedent coverage..." />
          ) : !recommendations || recommendations.length === 0 ? (
            <div className="p-16 text-center rounded-3xl glass-panel">
              <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                No Complementary Matches Found
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select additional services from the catalogue or lower the minimum confidence threshold to broaden matching.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {recommendations.map((rec, idx) => {
                const isExpanded = expandedRecId === rec.recommended_service_id;
                const exp = rec.explanation || {};

                return (
                  <motion.div
                    key={rec.recommended_service_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.12 }}
                    className="p-6 rounded-3xl glass-panel glass-panel-hover space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                            isDark
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                              : 'bg-sky-50 text-sky-700 border-sky-300'
                          }`}>
                            RECOMMENDATION #{rec.rank}
                          </span>
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rec.recommended_category}
                          </span>
                        </div>
                        <h4 className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {rec.recommended_service_name}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          Platform: {rec.recommended_platform}
                        </span>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">SYNERGY SCORE</span>
                        <span className={`text-2xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                          {rec.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </span>
                      </div>
                    </div>

                    {/* Trigger Antecedent Note */}
                    <div className={`text-xs p-3.5 rounded-2xl border ${
                      isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span className="text-slate-400">Triggered by your basket: </span>
                      <strong className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-sky-700'}`}>
                        {rec.trigger_service_names?.join(' & ') || 'Selected Services'}
                      </strong>
                    </div>

                    {/* Core Metric Pills */}
                    <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs pt-1">
                      <div className={`p-3 rounded-2xl border ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">CONFIDENCE</span>
                        <span className={`text-base font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                          {rec.confidence_pct}%
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl border ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">LIFT</span>
                        <span className="text-base font-bold text-amber-500">
                          {rec.lift}x
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl border ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">SUPPORT</span>
                        <span className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {rec.support_pct}%
                        </span>
                      </div>
                    </div>

                    {/* Structured Explainability Accordion */}
                    <div className="pt-2 border-t border-slate-200/20">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setExpandedRecId(isExpanded ? null : rec.recommended_service_id);
                        }}
                        onMouseEnter={() => sound.playHover()}
                        className={`w-full flex items-center justify-between text-xs font-mono py-1.5 cursor-pointer ${
                          isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-800'
                        }`}
                      >
                        <span>Explainable Rationale &amp; Administrative Insights</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-3 space-y-3 text-xs p-4 rounded-2xl border ${
                              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div>
                              <strong className={`block text-[11px] font-mono uppercase ${
                                isDark ? 'text-cyan-400' : 'text-sky-700'
                              }`}>
                                Empirical Summary
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{exp.summary}</p>
                            </div>

                            <div>
                              <strong className={`block text-[11px] font-mono uppercase ${
                                isDark ? 'text-violet-400' : 'text-indigo-700'
                              }`}>
                                Quantitative Metric Rationale
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{exp.metric_rationale}</p>
                            </div>

                            <div>
                              <strong className="text-amber-500 block text-[11px] font-mono uppercase">
                                Administrative Governance Insight
                              </strong>
                              <p className="mt-0.5 leading-relaxed">{exp.governance_insight}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/20 text-[10px] text-slate-400 font-mono">
                              {exp.disclaimer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
