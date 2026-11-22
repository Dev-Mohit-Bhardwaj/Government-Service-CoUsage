import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Sliders,
  Filter,
  Search,
  X,
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundService';

const CATEGORY_COLORS_DARK = {
  'Education': '#00D9FF',         // Cyan
  'Revenue': '#38BDF8',           // Sky
  'Identity': '#6C63FF',          // Violet
  'Social Welfare': '#A78BFA',    // Purple
  'Food and Civil Supplies': '#F5C76A', // Gold
  'Civil Administration': '#FBBF24',
  'Land and Revenue': '#34D399',  // Emerald
  'Agriculture': '#10B981',       // Green
  'Employment': '#EC4899',        // Pink
  'Healthcare': '#F43F5E',        // Rose
  'Civil Registration': '#60A5FA',
  'Transport': '#818CF8',
  'Utilities': '#94A3B8',
  'Business Services': '#FB923C'
};

const CATEGORY_COLORS_LIGHT = {
  'Education': '#0284C7',         // Sapphire Blue
  'Revenue': '#0284C7',
  'Identity': '#4F46E5',          // Indigo
  'Social Welfare': '#7C3AED',    // Purple
  'Food and Civil Supplies': '#D97706', // Amber
  'Civil Administration': '#B45309',
  'Land and Revenue': '#059669',  // Emerald
  'Agriculture': '#16A34A',       // Green
  'Employment': '#DB2777',        // Pink
  'Healthcare': '#E11D48',        // Rose
  'Civil Registration': '#2563EB',
  'Transport': '#4F46E5',
  'Utilities': '#64748B',
  'Business Services': '#EA580C'
};

export default function ServiceNetworkPage() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [minSupport, setMinSupport] = useState(0.015);
  const [minConfidence, setMinConfidence] = useState(0.35);
  const [minLift, setMinLift] = useState(1.0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Selection
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const { isDark } = useTheme();
  const categoryColors = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const nodePositionsRef = useRef({});

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const res = await api.getNetwork(minSupport, minConfidence, minLift);
      setNetworkData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load service network topology');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
  }, [minSupport, minConfidence, minLift]);

  // Canvas Force & Render Loop
  useEffect(() => {
    if (!networkData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { nodes, edges } = networkData;

    const filteredNodes = nodes.filter((n) => {
      const matchCat = selectedCategory === 'ALL' || n.category === selectedCategory;
      const matchSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    const activeNodeIds = new Set(filteredNodes.map(n => n.id));

    const positions = nodePositionsRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.40;

    filteredNodes.forEach((node, i) => {
      if (!positions[node.id]) {
        const angle = (i / filteredNodes.length) * Math.PI * 2;
        const r = radius * (0.65 + (node.popularity / 60) * 0.45);
        positions[node.id] = {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
          baseAngle: angle,
          r: r
        };
      }
    });

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      filteredNodes.forEach((node) => {
        const p = positions[node.id];
        if (!p) return;
        const wobble = Math.sin(frame * 0.02 + p.baseAngle) * 3;
        p.currentX = p.x + Math.cos(p.baseAngle) * wobble;
        p.currentY = p.y + Math.sin(p.baseAngle) * wobble;
      });

      // 1. Draw Edges
      edges.forEach((edge) => {
        if (!activeNodeIds.has(edge.source) || !activeNodeIds.has(edge.target)) return;

        const p1 = positions[edge.source];
        const p2 = positions[edge.target];
        if (!p1 || !p2) return;

        const isHighlighted =
          (hoveredNode && (edge.source === hoveredNode.id || edge.target === hoveredNode.id)) ||
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id));

        const isDimmed = (hoveredNode || selectedNode) && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(p1.currentX, p1.currentY);
        ctx.lineTo(p2.currentX, p2.currentY);

        if (isHighlighted) {
          ctx.strokeStyle = isDark ? '#00D9FF' : '#0284C7';
          ctx.lineWidth = Math.min(Math.max(edge.lift * 1.5, 2), 5);
          ctx.globalAlpha = 0.95;
        } else if (isDimmed) {
          ctx.strokeStyle = isDark ? '#334155' : '#CBD5E1';
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = 0.15;
        } else {
          ctx.strokeStyle = edge.is_strong
            ? (isDark ? '#6C63FF' : '#4F46E5')
            : (isDark ? '#38BDF8' : '#0EA5E9');
          ctx.lineWidth = Math.min(Math.max(edge.confidence * 3.5, 1.2), 3.5);
          ctx.globalAlpha = isDark ? 0.35 : 0.45;
        }

        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });

      // 2. Draw Nodes
      filteredNodes.forEach((node) => {
        const p = positions[node.id];
        if (!p) return;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isConnected =
          (hoveredNode && edges.some(e => (e.source === hoveredNode.id && e.target === node.id) || (e.target === hoveredNode.id && e.source === node.id))) ||
          (selectedNode && edges.some(e => (e.source === selectedNode.id && e.target === node.id) || (e.target === selectedNode.id && e.source === node.id)));

        const isDimmed = (hoveredNode || selectedNode) && !isHovered && !isSelected && !isConnected;

        const baseRadius = 5 + (node.popularity / 100) * 16;
        const nodeRadius = isHovered || isSelected ? baseRadius * 1.35 : baseRadius;
        const color = categoryColors[node.category] || (isDark ? '#00D9FF' : '#0284C7');

        // Outer Glow Aura
        if (isHovered || isSelected || isConnected) {
          ctx.beginPath();
          ctx.arc(p.currentX, p.currentY, nodeRadius + 10, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? (isDark ? 'rgba(0, 217, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)')
            : (isDark ? 'rgba(108, 99, 255, 0.3)' : 'rgba(99, 102, 241, 0.25)');
          ctx.fill();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? (isDark ? '#1E293B' : '#E2E8F0') : color;
        ctx.globalAlpha = isDimmed ? 0.35 : 1.0;
        ctx.fill();

        // Node Inner Core Dot
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, Math.max(nodeRadius * 0.4, 2), 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Node Label
        if (isHovered || isSelected || node.popularity > 22 || filteredNodes.length <= 16) {
          ctx.font = `${isHovered || isSelected ? 'bold 11px' : '10px'} Inter, sans-serif`;
          ctx.fillStyle = isDimmed
            ? (isDark ? '#475569' : '#94A3B8')
            : (isDark ? '#F1F5F9' : '#0F172A');
          ctx.textAlign = 'center';
          ctx.fillText(node.name, p.currentX, p.currentY + nodeRadius + 14);
        }

        ctx.globalAlpha = 1.0;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [networkData, selectedCategory, searchQuery, hoveredNode, selectedNode, isDark, categoryColors]);

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !networkData) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const positions = nodePositionsRef.current;
    let found = null;

    for (const node of networkData.nodes) {
      const p = positions[node.id];
      if (!p) continue;
      const dx = mouseX - p.currentX;
      const dy = mouseY - p.currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = 18 + (node.popularity / 100) * 14;
      if (dist < hitRadius) {
        found = node;
        break;
      }
    }

    if (found && found.id !== hoveredNode?.id) {
      sound.playHover();
    }

    setHoveredNode(found);
    canvasRef.current.style.cursor = found ? 'pointer' : 'default';
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      sound.playClick();
      setSelectedNode(hoveredNode.id === selectedNode?.id ? null : hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  const selectedNodeConnections = React.useMemo(() => {
    if (!selectedNode || !networkData) return [];
    return networkData.edges
      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
      .map(e => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const otherNode = networkData.nodes.find(n => n.id === otherId);
        return {
          ...e,
          targetNode: otherNode
        };
      })
      .sort((a, b) => b.lift - a.lift);
  }, [selectedNode, networkData]);

  const categories = React.useMemo(() => {
    if (!networkData) return [];
    const set = new Set(networkData.nodes.map(n => n.category));
    return ['ALL', ...Array.from(set)];
  }, [networkData]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Filter & Control Toolbar */}
      <div className="p-6 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-6">
        {/* Sliders */}
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center space-x-2.5">
            <Sliders className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Min Support:
            </span>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-28 cursor-pointer"
            />
            <span className={`text-xs font-mono font-semibold w-10 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
              {(minSupport * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Min Confidence:
            </span>
            <input
              type="range"
              min="0.20"
              max="0.80"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-28 cursor-pointer"
            />
            <span className={`text-xs font-mono font-semibold w-10 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>
              {(minConfidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Min Lift:
            </span>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-28 cursor-pointer"
            />
            <span className={`text-xs font-mono font-semibold w-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {minLift.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Category Filter & Search */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 pr-3 py-2 rounded-xl text-xs w-48 font-sans border focus:outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 shadow-sm'
              }`}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700/60 text-slate-200 focus:border-cyan-400'
                : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500 shadow-sm'
            }`}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <button
            onClick={() => {
              sound.playClick();
              setMinSupport(0.015);
              setMinConfidence(0.35);
              setMinLift(1.0);
              setSelectedCategory('ALL');
              setSearchQuery('');
              setSelectedNode(null);
            }}
            onMouseEnter={() => sound.playHover()}
            title="Reset Filters"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spacious Main Canvas Area (720px tall) */}
      <div className={`relative h-[720px] rounded-3xl glass-panel overflow-hidden border ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {loading && (
          <div className={`absolute inset-0 z-20 backdrop-blur-sm flex items-center justify-center ${
            isDark ? 'bg-[#050816]/75' : 'bg-white/75'
          }`}>
            <LoadingSpinner message="Calculating dynamic topology & association graphs..." />
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Floating Legend */}
        <div className={`absolute bottom-6 left-6 p-4 rounded-2xl border backdrop-blur-md text-xs space-y-2 pointer-events-none max-w-sm ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-300'
            : 'bg-white/90 border-slate-200 text-slate-700 shadow-md'
        }`}>
          <div className={`font-mono font-bold text-xs flex items-center space-x-1.5 ${
            isDark ? 'text-cyan-400' : 'text-sky-600'
          }`}>
            <Layers className="w-4 h-4" />
            <span>TOPOLOGY MAP</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-sky-600'}`}></span>
            <span>Node Size: Journey Co-Occurrence Popularity</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-0.5 ${isDark ? 'bg-cyan-400' : 'bg-sky-600'}`}></span>
            <span>Edge Glow: Lift Synergy &amp; Confidence Strength</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/20">
            Click any service node to inspect its specific co-usage rules.
          </p>
        </div>

        {/* Floating Metrics Badge */}
        {networkData && (
          <div className={`absolute top-6 left-6 flex items-center space-x-3 px-4 py-2 rounded-2xl border text-xs font-mono backdrop-blur-md ${
            isDark
              ? 'bg-slate-900/85 border-slate-800 text-slate-300'
              : 'bg-white/85 border-slate-200 text-slate-700 shadow-sm'
          }`}>
            <span>Nodes: <strong className={isDark ? 'text-cyan-400' : 'text-sky-600'}>{networkData.nodes.length}</strong></span>
            <span className="text-slate-400">|</span>
            <span>Discovered Edges: <strong className={isDark ? 'text-violet-400' : 'text-indigo-600'}>{networkData.edges.length}</strong></span>
          </div>
        )}

        {/* Sliding Side Details Drawer when Node is Selected */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute top-0 right-0 bottom-0 w-96 border-l p-8 backdrop-blur-xl z-30 shadow-2xl flex flex-col justify-between overflow-y-auto ${
                isDark
                  ? 'bg-[#080D1C]/95 border-cyan-500/30'
                  : 'bg-white/95 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                      isDark
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {selectedNode.id} &bull; {selectedNode.category}
                    </span>
                    <h3 className={`text-xl font-bold mt-2.5 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedNode.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Platform: {selectedNode.platform_id} ({selectedNode.platform_name})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedNode(null);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Popularity Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3.5">
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] text-slate-400">Popularity</span>
                    <p className={`text-2xl font-bold font-mono mt-0.5 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`}>
                      {selectedNode.popularity}%
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] text-slate-400">Total Journeys</span>
                    <p className={`text-2xl font-bold font-mono mt-0.5 ${isDark ? 'text-violet-400' : 'text-indigo-600'}`}>
                      {selectedNode.journey_count.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Connected Services List */}
                <div className="mt-8">
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-4 flex items-center justify-between ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>Discovered Associations</span>
                    <span className={isDark ? 'text-cyan-400 font-bold' : 'text-sky-600 font-bold'}>
                      {selectedNodeConnections.length}
                    </span>
                  </h4>

                  {selectedNodeConnections.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No associations meet current threshold filters.</p>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {selectedNodeConnections.map((conn, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-colors ${
                            isDark
                              ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                              : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {conn.targetNode?.name || conn.target}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {conn.targetNode?.category}
                            </span>
                          </div>

                          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[11px] font-mono pt-2 border-t border-slate-200/20">
                            <div>
                              Conf: <span className={isDark ? 'text-cyan-400 font-bold' : 'text-sky-600 font-bold'}>
                                {(conn.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              Lift: <span className="text-amber-500 font-bold">{conn.lift}x</span>
                            </div>
                            <div>
                              Supp: <span className="text-slate-400">{(conn.support * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-8 pt-4 border-t border-slate-200/20 text-[11px] text-slate-400">
                Non-causal co-usage association derived from unsupervised transaction mining.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
