import React, { useState } from 'react';
import { genomeNetwork } from '../data/mockSkills';
import { Network, Zap, Info, Maximize2, Share2 } from 'lucide-react';

export default function SkillGenome() {
  const [activeNodeId, setActiveNodeId] = useState('agents');
  const [activeCluster, setActiveCluster] = useState('all');

  const { nodes, links } = genomeNetwork;

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  // Find connected links and neighbor node IDs
  const connectedLinks = links.filter(
    l => l.source === activeNodeId || l.target === activeNodeId
  );
  const neighborIds = new Set(
    connectedLinks.map(l => (l.source === activeNodeId ? l.target : l.source))
  );
  neighborIds.add(activeNodeId);

  // Helper to get node position by id
  const getNodePos = (id) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <section id="skill-genome" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              02 / SKILL GENOME
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              SKILL GENOME NETWORK
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              “Skills rarely evolve alone.” Topological graph mapping co-occurrence weight and cluster convergence across modern job architectures.
            </p>
          </div>

          {/* Cluster Filter Toggles */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[#66645F] uppercase mr-2 hidden sm:inline">VIEW:</span>
            {[
              { id: 'all', label: 'FULL GRAPH' },
              { id: 'triad', label: 'EMERGING TRIAD' },
              { id: 'cloud', label: 'CLOUD & INFRA' }
            ].map(cluster => (
              <button
                key={cluster.id}
                onClick={() => {
                  setActiveCluster(cluster.id);
                  if (cluster.id === 'triad') setActiveNodeId('agents');
                  if (cluster.id === 'cloud') setActiveNodeId('k8s');
                }}
                className={`px-3 py-1 border transition-colors cursor-pointer ${
                  activeCluster === cluster.id
                    ? 'bg-[#171717] text-[#F4F1EA] border-[#171717]'
                    : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
                }`}
              >
                {cluster.label}
              </button>
            ))}
          </div>
        </div>

        {/* Network Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#D8D2C4] bg-[#ECE7DE]/20 p-4 sm:p-8 relative">
          
          {/* Top Label & Coordinate Header */}
          <div className="lg:col-span-12 flex flex-wrap items-center justify-between border-b border-[#D8D2C4] pb-3 text-xs font-mono text-[#66645F]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#171717]">GRAPH_ID: GENOME_V3.8</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>NODES: {nodes.length}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>EDGES: {links.length}</span>
              <span className="text-[#D8D2C4]">/</span>
              <span>DENSITY: 0.74</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 bg-[#FF4D2E] inline-block"></span>
              <span className="text-[#171717] font-semibold">CO-EMERGENT TRIAD ACTIVE</span>
            </div>
          </div>

          {/* Left / Center: Interactive SVG Knowledge Graph */}
          <div className="lg:col-span-8 relative min-h-[440px] sm:min-h-[500px] flex items-center justify-center overflow-hidden border border-[#D8D2C4] bg-[#F4F1EA]">
            
            {/* Editorial Background Grid Lines */}
            <div className="absolute inset-0 editorial-grid pointer-events-none opacity-60"></div>

            {/* Emerging Cluster Editorial Annotation Box */}
            <div className="absolute top-4 left-4 z-10 bg-[#F4F1EA]/95 border-l-2 border-l-[#FF4D2E] border border-[#D8D2C4] p-3 text-xs max-w-xs shadow-none">
              <div className="font-mono text-[9px] text-[#FF4D2E] font-bold tracking-widest uppercase">
                EMERGING CLUSTER / 01
              </div>
              <div className="font-mono font-bold text-xs text-[#171717] mt-0.5">
                AI AGENTS × RAG × VECTOR DATABASES
              </div>
              <div className="text-[10px] text-[#66645F] mt-1 font-mono flex items-center gap-2">
                <span>STRENGTH: <strong className="text-[#171717]">0.94</strong></span>
                <span>•</span>
                <span>CORRELATION: <strong className="text-[#FF4D2E]">+42% YoY</strong></span>
              </div>
            </div>

            {/* SVG Network Map */}
            <svg
              viewBox="0 0 700 440"
              className="w-full h-full select-none"
              style={{ minHeight: '440px' }}
            >
              <defs>
                {/* Arrow markers if needed */}
                <marker
                  id="signal-arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF4D2E" />
                </marker>
              </defs>

              {/* Edge Connections */}
              {links.map((link, index) => {
                const s = getNodePos(link.source);
                const t = getNodePos(link.target);

                const isHighlight = link.highlight;
                const isConnectedToActive =
                  link.source === activeNodeId || link.target === activeNodeId;
                const isDimmed =
                  activeCluster === 'triad'
                    ? !link.emergent
                    : activeNodeId && !isConnectedToActive && !isHighlight;

                let strokeColor = '#D8D2C4';
                let strokeWidth = Math.max(1, link.weight * 2.2);

                if (isHighlight) {
                  strokeColor = '#FF4D2E';
                  strokeWidth = 2.4;
                } else if (isConnectedToActive) {
                  strokeColor = '#171717';
                  strokeWidth = 1.8;
                }

                return (
                  <g key={`${link.source}-${link.target}-${index}`}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={isDimmed ? 0.25 : 1}
                      strokeDasharray={isHighlight ? "none" : link.weight < 0.7 ? "3,3" : "none"}
                      className="transition-all duration-200"
                    />

                    {/* Weight indicator on highlighted lines */}
                    {isHighlight && (
                      <circle
                        cx={(s.x + t.x) / 2}
                        cy={(s.y + t.y) / 2}
                        r="2.5"
                        fill="#FF4D2E"
                      />
                    )}
                  </g>
                );
              })}

              {/* Node Rendering: Typography + Small Anchor Circles */}
              {nodes.map((node) => {
                const isSelected = activeNodeId === node.id;
                const isNeighbor = neighborIds.has(node.id);
                const isTriad = ['rag', 'agents', 'vector'].includes(node.id);
                const isDimmed =
                  activeCluster === 'triad'
                    ? !isTriad
                    : activeNodeId && !isSelected && !isNeighbor;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setActiveNodeId(node.id)}
                    className="cursor-pointer group"
                    opacity={isDimmed ? 0.3 : 1}
                  >
                    {/* Anchor Circle */}
                    <circle
                      r={isSelected ? 6 : isTriad ? 5 : 4}
                      fill={isTriad ? "#FF4D2E" : isSelected ? "#171717" : "#66645F"}
                      stroke="#F4F1EA"
                      strokeWidth="2"
                      className="transition-transform duration-150 group-hover:scale-150"
                    />

                    {/* Outer pulse ring for active/selected */}
                    {isSelected && (
                      <circle
                        r="12"
                        fill="none"
                        stroke="#171717"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Node Typography Label (Swiss International Style) */}
                    <text
                      x={0}
                      y={-12}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                      fontSize={isTriad ? "11" : "10"}
                      fontWeight={isSelected || isTriad ? "700" : "500"}
                      fill={isSelected ? "#171717" : isTriad ? "#FF4D2E" : "#171717"}
                      className="select-none tracking-wider uppercase transition-colors"
                    >
                      {node.label}
                    </text>

                    {/* Micro-score indicator */}
                    <text
                      x={0}
                      y={18}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                      fill="#8E8B83"
                      className="select-none"
                    >
                      [{node.score}]
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Graph Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] font-mono text-[#66645F] bg-[#F4F1EA]/90 px-2 py-1 border border-[#D8D2C4]">
              <span>HOVER OR CLICK NODES TO TRACE PATHS</span>
            </div>

          </div>

          {/* Right: Editorial Node Inspection Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            
            <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-5 space-y-4">
              <div className="border-b border-[#D8D2C4] pb-3">
                <div className="text-[10px] font-mono text-[#FF4D2E] uppercase tracking-wider font-bold">
                  INSPECTION READOUT // NODE
                </div>
                <h3 className="font-mono font-black text-2xl text-[#171717] mt-1">
                  {activeNode.label}
                </h3>
                <div className="text-xs font-mono text-[#66645F] mt-0.5">
                  AFFILIATED CLUSTER: <span className="text-[#171717] font-semibold">{activeNode.cluster.toUpperCase()}</span>
                </div>
              </div>

              {/* Node Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="border border-[#D8D2C4] p-2.5 bg-[#ECE7DE]/50">
                  <div className="text-[10px] text-[#66645F]">NODE WEIGHT</div>
                  <div className="text-lg font-bold text-[#171717] mt-0.5">{activeNode.score} / 100</div>
                </div>
                <div className="border border-[#D8D2C4] p-2.5 bg-[#ECE7DE]/50">
                  <div className="text-[10px] text-[#66645F]">CONNECTIONS</div>
                  <div className="text-lg font-bold text-[#FF4D2E] mt-0.5">{connectedLinks.length} EDGES</div>
                </div>
              </div>

              {/* Edge Relationships */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono text-[#66645F] uppercase font-semibold">
                  STRONGEST CO-OCCURRENCE EDGES:
                </div>
                
                <div className="space-y-1.5 font-mono text-xs">
                  {connectedLinks
                    .sort((a, b) => b.weight - a.weight)
                    .map((link, idx) => {
                      const otherId = link.source === activeNodeId ? link.target : link.source;
                      const otherNode = nodes.find(n => n.id === otherId);

                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveNodeId(otherId)}
                          className="flex items-center justify-between p-2 border border-[#D8D2C4] hover:border-[#171717] bg-[#ECE7DE]/20 cursor-pointer transition-colors"
                        >
                          <span className="font-bold text-[#171717]">{otherNode?.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#D8D2C4]">
                              <div
                                className="h-full bg-[#FF4D2E]"
                                style={{ width: `${link.weight * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[#66645F]">{(link.weight * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Research Finding Annotation */}
            <div className="bg-[#171717] text-[#F4F1EA] p-4 text-xs font-mono space-y-2">
              <div className="text-[10px] text-[#FF4D2E] uppercase font-bold tracking-wider">
                TOPOLOGICAL FINDING
              </div>
              <p className="text-[11px] text-[#D8D2C4] leading-relaxed">
                The triad of <strong className="text-white">AI AGENTS</strong>, <strong className="text-white">RAG</strong>, and <strong className="text-white">VECTOR DATABASES</strong> now forms an indivisible technical nucleus in 74% of frontier AI engineering postings.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
