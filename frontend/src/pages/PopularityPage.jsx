import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  ArrowUpDown,
  Filter,
  BarChart2,
  Table as TableIcon
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

export default function PopularityPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortField, setSortField] = useState('Journey_Count');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState('cards');

  const { isDark } = useTheme();

  useEffect(() => {
    async function fetchPopularity() {
      try {
        setLoading(true);
        const data = await api.getPopularity('all');
        setServices(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load service popularity data');
      } finally {
        setLoading(false);
      }
    }
    fetchPopularity();
  }, []);

  const categories = React.useMemo(() => {
    const cats = new Set(services.map(s => s.Category));
    return ['ALL', ...Array.from(cats)];
  }, [services]);

  const filteredAndSorted = React.useMemo(() => {
    return services
      .filter(s => {
        const matchesCategory = categoryFilter === 'ALL' || s.Category === categoryFilter;
        const matchesSearch =
          s.Service_Name.toLowerCase().includes(search.toLowerCase()) ||
          s.Service_ID.toLowerCase().includes(search.toLowerCase()) ||
          s.Category.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [services, categoryFilter, search, sortField, sortAsc]);

  if (loading) {
    return <LoadingSpinner message="Calculating journey frequency rankings across catalogue..." />;
  }

  if (error) {
    return (
      <div className={`p-8 max-w-xl mx-auto my-12 rounded-2xl border text-center ${
        isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="text-lg font-bold text-red-500 mb-2">Error Loading Popularity Data</h3>
        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
      </div>
    );
  }

  const handleSort = (field) => {
    sound.playClick();
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const maxCount = Math.max(...services.map(s => s.Journey_Count), 1);

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Control Header & Toolbar */}
      <div className="p-8 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <TrendingUp className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span>Service Popularity Analysis</span>
          </h2>
          <p className={`text-sm mt-1 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Empirical frequency of individual services observed across 20,000 citizen journeys.
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center space-x-1.5 p-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('cards');
            }}
            onMouseEnter={() => sound.playHover()}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Visual Cards</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('table');
            }}
            onMouseEnter={() => sound.playHover()}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              viewMode === 'table'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Data Table</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 shadow-sm'
              }`}
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                sound.playClick();
                setCategoryFilter(e.target.value);
              }}
              className={`px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-pointer ${
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
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing <strong className={isDark ? 'text-cyan-400' : 'text-sky-600'}>{filteredAndSorted.length}</strong> of 30 services
        </span>
      </div>

      {/* Visual Rankings Card View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAndSorted.map((svc, idx) => {
            const barWidth = ((svc.Journey_Count / maxCount) * 100).toFixed(1);
            return (
              <motion.div
                key={svc.Service_ID}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                className="p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs font-bold border ${
                        isDark ? 'bg-slate-800 text-cyan-400 border-slate-700' : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {svc.Service_Name}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          {svc.Service_ID} &bull; {svc.Category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                        {svc.Popularity_Percentage.toFixed(1)}%
                      </span>
                      <p className="text-[11px] font-mono text-slate-400">
                        {svc.Journey_Count.toLocaleString()} journeys
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Frequency Bar */}
                  <div className={`mt-4 w-full h-2.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-glow-cyan'
                          : 'bg-gradient-to-r from-sky-500 to-blue-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="rounded-3xl glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`font-mono uppercase tracking-wider border-b ${
                isDark ? 'bg-slate-900/90 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Journey_Count')}>
                    <div className="flex items-center space-x-1.5">
                      <span>Rank</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Service_ID')}>
                    <div className="flex items-center space-x-1.5">
                      <span>Service ID</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Service_Name')}>
                    <div className="flex items-center space-x-1.5">
                      <span>Service Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Category')}>
                    <div className="flex items-center space-x-1.5">
                      <span>Category</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Journey_Count')}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Journey Count</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right cursor-pointer hover:text-cyan-500" onClick={() => handleSort('Popularity_Percentage')}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Popularity Share</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y font-sans ${
                isDark ? 'divide-slate-800/60' : 'divide-slate-100'
              }`}>
                {filteredAndSorted.map((svc, i) => (
                  <tr key={svc.Service_ID} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`py-4 px-6 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      #{i + 1}
                    </td>
                    <td className="py-4 px-6 font-mono">{svc.Service_ID}</td>
                    <td className={`py-4 px-6 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {svc.Service_Name}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {svc.Category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono">
                      {svc.Journey_Count.toLocaleString()}
                    </td>
                    <td className={`py-4 px-6 text-right font-mono font-bold ${
                      isDark ? 'text-cyan-400' : 'text-sky-600'
                    }`}>
                      {svc.Popularity_Percentage.toFixed(2)}%
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
