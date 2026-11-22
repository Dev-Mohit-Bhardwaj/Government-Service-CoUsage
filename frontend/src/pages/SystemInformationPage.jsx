import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Server,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function SystemInformationPage() {
  const [validationData, setValidationData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isDark } = useTheme();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [val, health] = await Promise.all([
          api.getValidation(),
          api.getHealth()
        ]);
        setValidationData(val);
        setHealthData(health);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch dataset integrity report');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Auditing transactional matrix integrity & quality assertions..." />;
  }

  if (error) {
    return (
      <div className={`p-8 max-w-xl mx-auto my-12 rounded-2xl border text-center ${
        isDark ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="text-lg font-bold text-red-500 mb-2">System Audit Error</h3>
        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
      </div>
    );
  }

  const { total_checks, passed_checks, checks, all_passed } = validationData;

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Synthetic Dataset Transparency Alert */}
      <div className={`p-8 rounded-3xl border space-y-3 ${
        isDark
          ? 'bg-gradient-to-r from-amber-950/40 via-[#0B1224] to-[#080D1C] border-amber-500/40'
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-center space-x-2.5 text-amber-500 text-sm font-mono font-bold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>SYNTHETIC RESEARCH DATASET — ILLUSTRATIVE ANALYSIS NOTICE</span>
        </div>
        <p className={`text-xs leading-relaxed max-w-4xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          The dataset utilized by Project KRATOS comprises 20,000 synthetic citizen journeys across 30 catalogued services.
          All analytical findings and recommendations are strictly intended to validate and demonstrate unsupervised data mining methodologies.
          Results do <strong>not</strong> represent empirical citizen behavior, nor official government administrative statistics.
        </p>
      </div>

      {/* Dataset Validation Quality Header (8 Checks) */}
      <div className="p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <FileCheck2 className={`w-7 h-7 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Dataset Quality &amp; Integrity Audit
              </h2>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Rigorous verification performed by <code>data_validator.py</code> across transactional tables.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] text-slate-400 font-mono block">CHECKS PASSED</span>
              <span className="text-xl font-bold font-mono text-emerald-500">
                {passed_checks} / {total_checks}
              </span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] text-slate-400 font-mono block">INTEGRITY STATUS</span>
              <span className={`text-xs font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                {all_passed ? '100% VERIFIED' : 'ANOMALIES FOUND'}
              </span>
            </div>
          </div>
        </div>

        {/* 8 Checks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {checks.map((chk, i) => {
            const isPass = chk.Status === 'PASS';
            return (
              <div
                key={chk.Validation}
                className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isPass
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-emerald-50/70 border-emerald-200'
                    : isDark
                      ? 'bg-red-950/20 border-red-500/30'
                      : 'bg-red-50/70 border-red-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">CHECK #{i + 1}</span>
                    {isPass ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-mono font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-bold mt-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {chk.Validation}
                  </h4>
                  <p className={`text-xs mt-1 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {chk.Details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System & Architecture Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Architecture */}
        <div className="p-8 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center space-x-2.5">
            <Server className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System Architecture
            </h3>
          </div>
          <div className={`space-y-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Framework Layer:</span>
              <span className={isDark ? 'text-cyan-400' : 'text-sky-600'}>FastAPI 2.0 (Uvicorn)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Frontend Stack:</span>
              <span className={isDark ? 'text-cyan-400' : 'text-sky-600'}>React + Vite + Tailwind</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">3D Visualization:</span>
              <span className={isDark ? 'text-cyan-400' : 'text-sky-600'}>Three.js WebGL</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Audio System:</span>
              <span className={isDark ? 'text-cyan-400' : 'text-sky-600'}>Web Audio API Synth</span>
            </div>
          </div>
        </div>

        {/* Machine Learning Core */}
        <div className="p-8 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center space-x-2.5">
            <Cpu className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`} />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Unsupervised ML Engine
            </h3>
          </div>
          <div className={`space-y-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Mining Algorithms:</span>
              <span className={isDark ? 'text-violet-400' : 'text-indigo-600'}>FP-Growth &amp; Apriori</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Library:</span>
              <span className={isDark ? 'text-violet-400' : 'text-indigo-600'}>mlxtend 0.25.0</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Metrics Evaluated:</span>
              <span className={isDark ? 'text-violet-400' : 'text-indigo-600'}>Support, Conf, Lift</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Lift Filtering:</span>
              <span className={isDark ? 'text-violet-400' : 'text-indigo-600'}>Lift &ge; 1.0 (Positive)</span>
            </div>
          </div>
        </div>

        {/* Dataset Metadata */}
        <div className="p-8 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Dataset Footprint
            </h3>
          </div>
          <div className={`space-y-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Total Journeys:</span>
              <span className="text-amber-500">20,000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Total Interactions:</span>
              <span className="text-amber-500">76,765</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Services:</span>
              <span className="text-amber-500">30 Services</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/20">
              <span className="text-slate-400">Categories:</span>
              <span className="text-amber-500">10 Domains</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
