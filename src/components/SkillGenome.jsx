import React, { useState, useEffect } from 'react';
import { getSkillGenome } from '../api/genome';
import { getSkillDetail } from '../api/skills';
import BackendConnectionError from './common/BackendConnectionError';
import { RefreshCw, Search, Layers, Compass } from 'lucide-react';

export default function SkillGenome() {
  const [focalSkill, setFocalSkill] = useState('Python');
  const [searchInput, setSearchInput] = useState('');
  const [genomeData, setGenomeData] = useState({ nodes: [], edges: [], metadata: null });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeSkillDetail, setActiveSkillDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const focalPresets = [
    { label: 'Python (Focal)', value: 'Python' },
    { label: 'SQL', value: 'SQL' },
    { label: 'Machine Learning', value: 'Machine Learning' },
    { label: 'R', value: 'R' },
    { label: 'Analytics', value: 'Analytics' },
    { label: 'ALL SKILLS', value: '' },
  ];

  const fetchGenome = async (focal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getSkillGenome({
        focal_skill: focal || undefined,
        limit_nodes: 24,
        limit_edges: 36,
        min_support: focal ? 5 : 10,
      });
      setGenomeData(resp);
      if (resp.nodes && resp.nodes.length > 0) {
        // Set active node to focal skill if available, else first node
        const focalNode = resp.nodes.find(
          n => n.label.toLowerCase() === (focal || '').toLowerCase() || n.id.toLowerCase() === (focal || '').toLowerCase()
        );
        setActiveNodeId(focalNode ? focalNode.id : resp.nodes[0].id);
      } else {
        setActiveNodeId(null);
      }
    } catch (err) {
      setError({
        message: err.message || 'Failed to load Skill Genome network from /api/skill-genome',
        status: err.status ?? (err.isNetworkError ? 0 : 500),
        endpoint: err.endpoint || '/api/skill-genome'
      });
      setGenomeData({ nodes: [], edges: [], metadata: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenome(focalSkill);
  }, [focalSkill]);

  // When active node changes, load full relationship profile via GET /api/skills/{skill_name}
  useEffect(() => {
    if (!activeNodeId) {
      setActiveSkillDetail(null);
      return;
    }
    let isMounted = true;
    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const detail = await getSkillDetail(activeNodeId);
        if (isMounted) setActiveSkillDetail(detail);
      } catch {
        if (isMounted) setActiveSkillDetail(null);
      }
    };
    loadDetail();
    return () => { isMounted = false; };
  }, [activeNodeId]);

  const { nodes, edges, metadata } = genomeData;
  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  // Layout node positions deterministically on SVG canvas (680 x 460)
  const width = 680;
  const height = 460;
  const centerX = width / 2;
  const centerY = height / 2;

  const positionedNodes = nodes.map((node, idx) => {
    // If focal node matches, place near center
    if (focalSkill && node.label.toLowerCase() === focalSkill.toLowerCase()) {
      return { ...node, x: centerX, y: centerY };
    }
    // Arrange in concentric rings
    const ring = idx < 8 ? 1 : 2;
    const ringRadius = ring === 1 ? 130 : 210;
    const countInRing = ring === 1 ? Math.min(nodes.length, 8) : Math.max(1, nodes.length - 8);
    const ringIndex = ring === 1 ? idx : idx - 8;
    const angle = (ringIndex * (360 / countInRing) - 90) * (Math.PI / 180);
    const x = centerX + ringRadius * Math.cos(angle);
    const y = centerY + ringRadius * Math.sin(angle);
    return { ...node, x, y };
  });

  const getNodePos = (id) => {
    const node = positionedNodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: centerX, y: centerY };
  };

  // Connected edges and neighbors for active node
  const connectedEdges = edges.filter(
    e => e.source === activeNodeId || e.target === activeNodeId
  );
  const neighborIds = new Set(
    connectedEdges.map(e => (e.source === activeNodeId ? e.target : e.source))
  );
  if (activeNodeId) neighborIds.add(activeNodeId);

  return (
    <section id="skill-genome" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              02 / SKILL GENOME — CO-OCCURRENCE TOPOLOGY
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              SKILL GENOME
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              Empirical co-occurrence topology computed directly from Analytics Jobs.key_skills. Normalized via Jaccard association metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-[#171717] text-[#F4F1EA] uppercase font-bold tracking-wider">
              EMPIRICAL DATASET
            </span>
            <span className="px-2.5 py-1 border border-[#D8D2C4] text-[#171717] uppercase">
              SAMPLE: {metadata ? metadata.sample_size.toLocaleString() : '15,841'} POSTINGS
            </span>
          </div>
        </div>

        {/* Focal Skill Selector Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-8 border-b border-[#D8D2C4]/60 font-mono text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[#66645F] uppercase mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> FOCAL SKILL:
            </span>
            {focalPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                  setFocalSkill(preset.value);
                  setSearchInput(preset.value);
                }}
                className={`px-3 py-1 border transition-colors cursor-pointer whitespace-nowrap ${
                  focalSkill === preset.value
                    ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-semibold'
                    : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717] hover:bg-[#ECE7DE]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Skill Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                setFocalSkill(searchInput.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Custom focal skill (e.g. Python, SQL)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#ECE7DE]/50 border border-[#D8D2C4] px-3 py-1 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-[#171717] text-[#F4F1EA] hover:bg-[#FF4D2E] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>EXPLORE</span>
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <BackendConnectionError
            endpoint={typeof error === 'object' ? error.endpoint : '/api/skill-genome'}
            status={typeof error === 'object' ? error.status : null}
            message={typeof error === 'object' ? error.message : error}
            onRetry={() => fetchGenome(focalSkill)}
          />
        )}

        {/* Network Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#D8D2C4] bg-[#ECE7DE]/20 p-4 sm:p-8 relative">
          
          {/* Top Label & Coordinate Header */}
          <div className="lg:col-span-12 flex flex-wrap items-center justify-between border-b border-[#D8D2C4] pb-3 text-xs font-mono text-[#66645F]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#171717]">CORPUS: {metadata ? metadata.dataset : 'Analytics Jobs'}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>SAMPLE SIZE: {metadata ? metadata.sample_size.toLocaleString() : '15,841'}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>NODES: {nodes.length}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>EDGES: {edges.length}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>METRIC: {metadata ? metadata.association_metric.toUpperCase() : 'JACCARD'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 bg-[#FF4D2E] inline-block"></span>
              <span className="text-[#171717] font-semibold">MIN SUPPORT &ge; 5 POSTINGS</span>
            </div>
          </div>

          {/* Left / Center: Interactive SVG Knowledge Graph */}
          <div className="lg:col-span-8 relative min-h-[440px] sm:min-h-[500px] flex items-center justify-center overflow-hidden border border-[#D8D2C4] bg-[#F4F1EA]">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#66645F]">
                <RefreshCw className="w-5 h-5 animate-spin text-[#171717]" />
                <span>BUILDING TOPOLOGICAL GRAPH FROM /api/skill-genome...</span>
              </div>
            ) : nodes.length === 0 ? (
              <div className="font-mono text-xs text-[#66645F]">
                NO CO-OCCURRENCE NODES MATCHING CRITERIA.
              </div>
            ) : (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
                {/* SVG Co-occurrence Edges */}
                {edges.map((edge) => {
                  const p1 = getNodePos(edge.source);
                  const p2 = getNodePos(edge.target);
                  const isConnected = activeNodeId && (edge.source === activeNodeId || edge.target === activeNodeId);
                  const strokeWidth = Math.max(1, edge.association * 6);

                  return (
                    <line
                      key={`${edge.source}-${edge.target}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isConnected ? '#FF4D2E' : 'var(--border-line, #D8D2C4)'}
                      strokeWidth={isConnected ? strokeWidth + 1 : strokeWidth}
                      strokeOpacity={isConnected ? 0.9 : 0.5}
                      className="transition-colors duration-200"
                    />
                  );
                })}

                {/* SVG Nodes */}
                {positionedNodes.map((node) => {
                  const isActive = node.id === activeNodeId;
                  const isNeighbor = neighborIds.has(node.id);
                  const radius = Math.min(16, Math.max(7, Math.sqrt(node.count || 10) * 1.5));

                  return (
                    <g
                      key={node.id}
                      onClick={() => setActiveNodeId(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Aura when active */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 8}
                          fill="none"
                          stroke="#FF4D2E"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={isActive ? '#FF4D2E' : isNeighbor ? 'var(--text-ink, #171717)' : 'var(--text-muted, #8E8B83)'}
                        stroke="var(--bg-paper, #F4F1EA)"
                        strokeWidth="2"
                        className="transition-transform duration-150 group-hover:scale-125"
                      />

                      {/* Node Label */}
                      <text
                        x={node.x}
                        y={node.y + radius + 11}
                        textAnchor="middle"
                        fill={isActive ? '#FF4D2E' : 'var(--text-ink, #171717)'}
                        fontSize="10"
                        fontWeight={isActive ? '700' : '500'}
                        fontFamily="JetBrains Mono"
                        className="pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Right: Active Node Detail Dossier */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            {activeNode ? (
              <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#66645F] uppercase tracking-wider">
                      SELECTED NODE // {activeNode.id}
                    </span>
                    <button
                      onClick={() => {
                        setFocalSkill(activeNode.label);
                        setSearchInput(activeNode.label);
                      }}
                      className="px-2 py-0.5 bg-[#171717] hover:bg-[#FF4D2E] text-white text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      title="Center the genome network around this skill"
                    >
                      <Compass className="w-3 h-3" />
                      <span>SET AS FOCAL</span>
                    </button>
                  </div>
                  <h3 className="font-sans font-bold text-2xl text-[#171717]">
                    {activeNode.label}
                  </h3>
                  <div className="mt-2 text-xs font-mono text-[#66645F] flex items-center justify-between">
                    <span>POSTINGS VOL:</span>
                    <strong className="text-[#171717]">
                      {activeNode.count ? activeNode.count.toLocaleString() : (activeSkillDetail?.posting_count?.toLocaleString() || 'N/A')}
                    </strong>
                  </div>
                </div>

                {/* Connected Edges Breakdown */}
                <div className="pt-4 border-t border-[#D8D2C4] space-y-3">
                  <div className="text-[10px] font-mono text-[#66645F] uppercase tracking-wider">
                    VERIFIED CO-OCCURRENCE ASSOCIATIONS:
                  </div>

                  {connectedEdges.length === 0 ? (
                    <div className="text-xs font-mono text-[#66645F]">
                      No co-occurrences above minimum support threshold for this node.
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-mono max-h-60 overflow-y-auto pr-1">
                      {connectedEdges.map((e) => {
                        const partnerId = e.source === activeNodeId ? e.target : e.source;
                        const partner = nodes.find(n => n.id === partnerId);
                        const partnerLabel = partner ? partner.label : partnerId;

                        return (
                          <div
                            key={`${e.source}-${e.target}`}
                            onClick={() => setActiveNodeId(partnerId)}
                            className="p-2 border border-[#D8D2C4] bg-[#ECE7DE]/50 hover:bg-[#ECE7DE] cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-bold text-[#171717]">{partnerLabel}</span>
                            <div className="text-right">
                              <span className="text-[#FF4D2E] font-bold">Jaccard: {e.association.toFixed(3)}</span>
                              <span className="text-[#66645F] text-[10px] block">({e.cooccurrence} co-occurrences)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Methodology Note */}
                <div className="pt-3 border-t border-[#D8D2C4] text-[10px] font-mono text-[#66645F] space-y-1">
                  <div>ASSOCIATION METRIC: JACCARD SIMILARITY</div>
                  <div className="text-[#8E8B83]">J(A,B) = count(A &cap; B) / (count(A) + count(B) - count(A &cap; B))</div>
                </div>
              </div>
            ) : (
              <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-6 text-xs font-mono text-[#66645F]">
                Click on any node in the graph to inspect co-occurrences.
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
