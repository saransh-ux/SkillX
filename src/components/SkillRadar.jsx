import React, { useState, useEffect } from 'react';
import { getTopSkills, getEmergingSkills } from '../api/skills';
import { SignalLoading, SignalError, SignalEmpty } from './common/SignalState';
import { Filter } from 'lucide-react';

export default function SkillRadar() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('emergence'); // 'emergence' | 'growth'

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Call GET /api/skills/top with fallback
        let data = await getTopSkills(20);
        if (!data || data.length === 0) {
          data = await getEmergingSkills();
        }
        if (isMounted) {
          setSkills(data);
          setSelectedSkill(data[0] || null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to acquire skill radar signals');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const categories = ['ALL', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = skills
    .filter(s => filterCategory === 'ALL' || s.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'emergence') return b.emergenceScore - a.emergenceScore;
      return b.growthValue - a.growthValue;
    });

  // Calculate coordinates for radial scatter
  // Center: 240, 240. Radius max: 190.
  const centerX = 240;
  const centerY = 240;

  const radarPoints = skills.map((skill, index) => {
    const angle = (index * (360 / (skills.length || 1)) - 90) * (Math.PI / 180);
    const radius = (skill.emergenceScore / 100) * 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...skill, x, y, angle };
  });

  const signalPeak = skills.length ? Math.max(...skills.map(s => s.emergenceScore)) : 87;

  return (
    <section id="skill-radar" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              01 / MARKET PULSE — TOP SKILL DEMAND
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              MARKET PULSE & DEMAND RADAR
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              Empirical market pulse tracking top skill demand volume, YoY acceleration, and co-occurrence cluster dynamics.
            </p>
          </div>

          {/* Filtering and Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-[#66645F] uppercase mr-1">SORT:</span>
            <button
              onClick={() => setSortBy('emergence')}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                sortBy === 'emergence'
                  ? 'bg-[#171717] text-[#F4F1EA] border-[#171717]'
                  : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
              }`}
            >
              BY EMERGENCE
            </button>
            <button
              onClick={() => setSortBy('growth')}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                sortBy === 'growth'
                  ? 'bg-[#171717] text-[#F4F1EA] border-[#171717]'
                  : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
              }`}
            >
              BY GROWTH %
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-8 border-b border-[#D8D2C4]/60 scrollbar-none font-mono text-xs">
          <span className="text-[#66645F] mr-2 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> DOMAIN:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 uppercase whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#171717] text-[#F4F1EA] font-semibold'
                  : 'text-[#66645F] hover:text-[#171717] hover:bg-[#ECE7DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Custom SVG Radial Vector Radar */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center border border-[#D8D2C4] bg-[#ECE7DE]/30 p-6 lg:p-8 relative">
            
            {/* Top lab badge */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#66645F] border-b border-[#D8D2C4] pb-2 mb-4">
              <span>RADIAL_POLAR_PLOT // v3</span>
              <span className="text-[#FF4D2E] font-semibold">SIGNAL PEAK: {signalPeak}</span>
            </div>

            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 480 480" className="w-full h-full overflow-visible">
                {/* Background Concentric Radar Rings */}
                {[45, 90, 135, 180].map((radius, i) => (
                  <g key={radius}>
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={radius}
                      fill="none"
                      stroke="#D8D2C4"
                      strokeWidth="1"
                      strokeDasharray={i === 3 ? "none" : "2,3"}
                    />
                    <text
                      x={centerX + 4}
                      y={centerY - radius + 12}
                      fill="#8E8B83"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                    >
                      {radius === 180 ? '100' : Math.round((radius / 180) * 100)}
                    </text>
                  </g>
                ))}

                {/* Radar Crosshairs */}
                <line x1={centerX - 190} y1={centerY} x2={centerX + 190} y2={centerY} stroke="#D8D2C4" strokeWidth="1" />
                <line x1={centerX} y1={centerY - 190} x2={centerX} y2={centerY + 190} stroke="#D8D2C4" strokeWidth="1" />
                <line x1={centerX - 134} y1={centerY - 134} x2={centerX + 134} y2={centerY + 134} stroke="#D8D2C4" strokeWidth="0.8" strokeDasharray="3,3" />
                <line x1={centerX - 134} y1={centerY + 134} x2={centerX + 134} y2={centerY - 134} stroke="#D8D2C4" strokeWidth="0.8" strokeDasharray="3,3" />

                {/* Outer Boundary Marker Ticks */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = centerX + 180 * Math.cos(rad);
                  const y1 = centerY + 180 * Math.sin(rad);
                  const x2 = centerX + 188 * Math.cos(rad);
                  const y2 = centerY + 188 * Math.sin(rad);
                  return (
                    <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#171717" strokeWidth="1.5" />
                  );
                })}

                {/* Connecting Web of Top Emerging Skills */}
                <polygon
                  points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(255, 77, 46, 0.07)"
                  stroke="#FF4D2E"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />

                {/* Radar Nodes */}
                {radarPoints.map((point) => {
                  const isSelected = selectedSkill && selectedSkill.id === point.id;
                  const isHighSignal = point.emergenceScore >= 80;
                  const isDimmed = filterCategory !== 'ALL' && point.category !== filterCategory;

                  return (
                    <g
                      key={point.id}
                      onClick={() => setSelectedSkill(point)}
                      className="cursor-pointer group transition-opacity duration-200"
                      opacity={isDimmed ? 0.25 : 1}
                    >
                      {/* Selection Aura */}
                      {isSelected && (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="16"
                          fill="none"
                          stroke="#FF4D2E"
                          strokeWidth="1"
                          strokeDasharray="3,2"
                        />
                      )}

                      {/* Line from center to point on hover/selection */}
                      {isSelected && (
                        <line
                          x1={centerX}
                          y1={centerY}
                          x2={point.x}
                          y2={point.y}
                          stroke="#FF4D2E"
                          strokeWidth="1"
                        />
                      )}

                      {/* Main Node Point */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? "6" : isHighSignal ? "5" : "4"}
                        fill={isHighSignal ? "#FF4D2E" : "#171717"}
                        stroke="#F4F1EA"
                        strokeWidth="2"
                        className="transition-transform duration-150 group-hover:scale-125"
                      />

                      {/* Precision Label */}
                      <text
                        x={point.x + (point.x > centerX ? 10 : -10)}
                        y={point.y + (point.y > centerY ? 12 : -8)}
                        textAnchor={point.x > centerX ? "start" : "end"}
                        fill={isSelected ? "#FF4D2E" : "#171717"}
                        fontSize="10"
                        fontWeight={isSelected || isHighSignal ? "700" : "500"}
                        fontFamily="JetBrains Mono"
                        className="pointer-events-none select-none"
                      >
                        {point.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar Legend & Coordinates */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#66645F] mt-4 pt-3 border-t border-[#D8D2C4]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#FF4D2E] inline-block"></span>
                  RISING SIGNAL (&gt;80)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#171717] inline-block"></span>
                  STABLE/SURGE
                </span>
              </div>
              <span>SCALE: 0–100 EMERGENCE</span>
            </div>

          </div>

          {/* Right: Editorial Data Table & Telemetry */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Continuous Editorial Table */}
            <div className="border border-[#D8D2C4] divide-y divide-[#D8D2C4] bg-[#F4F1EA]">
              
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 text-[10px] font-mono text-[#66645F] bg-[#ECE7DE]/50 py-2.5 px-4 tracking-wider uppercase">
                <div className="col-span-1">#</div>
                <div className="col-span-4">SKILL IDENTIFIER</div>
                <div className="col-span-2 text-right">GROWTH %</div>
                <div className="col-span-3 text-center">EMERGENCE SCORE</div>
                <div className="col-span-2 text-right">TREND SIGNAL</div>
              </div>

              {/* Rows */}
              {loading && skills.length === 0 && (
                <div className="p-4">
                  <SignalLoading message="ANALYZING RADAR SIGNALS..." />
                </div>
              )}

              {error && skills.length === 0 && (
                <div className="p-4">
                  <SignalError message={error} />
                </div>
              )}

              {!loading && filteredSkills.length === 0 && (
                <div className="p-4">
                  <SignalEmpty message="NO SIGNAL DETECTED FOR THIS DOMAIN" />
                </div>
              )}

              {filteredSkills.map((skill, index) => {
                const isSelected = selectedSkill && selectedSkill.id === skill.id;
                const isTopSignal = skill.emergenceScore >= 80;

                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`grid grid-cols-12 items-center py-3.5 px-4 transition-colors duration-150 cursor-pointer text-xs font-mono ${
                      isSelected
                        ? 'bg-[#ECE7DE] border-l-4 border-l-[#FF4D2E]'
                        : 'hover:bg-[#ECE7DE]/40'
                    }`}
                  >
                    {/* Index */}
                    <div className="col-span-1 text-[#66645F] font-mono">
                      0{index + 1}
                    </div>

                    {/* Skill Name */}
                    <div className="col-span-4">
                      <div className="font-bold text-[#171717] flex items-center gap-2">
                        <span>{skill.name}</span>
                        {isTopSignal && (
                          <span className="w-1.5 h-1.5 bg-[#FF4D2E] inline-block"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#66645F] truncate">{skill.category}</div>
                    </div>

                    {/* Growth % */}
                    <div className="col-span-2 text-right font-bold">
                      <span className={isTopSignal ? 'text-[#FF4D2E]' : 'text-[#171717]'}>
                        {skill.growth}
                      </span>
                    </div>

                    {/* Emergence Score & Bar */}
                    <div className="col-span-3 px-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#66645F]">INDEX</span>
                        <span className="font-bold text-[#171717]">{skill.emergenceScore}</span>
                      </div>
                      {/* Editorial Progress Line */}
                      <div className="w-full h-1.5 bg-[#D8D2C4] overflow-hidden">
                        <div
                          className={`h-full ${isTopSignal ? 'bg-[#FF4D2E]' : 'bg-[#171717]'}`}
                          style={{ width: `${skill.emergenceScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="col-span-2 text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 border ${
                        isTopSignal
                          ? 'border-[#FF4D2E] text-[#FF4D2E] bg-[#FF4D2E]/5 font-bold'
                          : 'border-[#D8D2C4] text-[#66645F] bg-[#ECE7DE]'
                      }`}>
                        {skill.signalStrength}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Selected Skill Telemetry Dossier */}
            {selectedSkill && (
              <div className="border border-[#D8D2C4] bg-[#ECE7DE]/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D2C4] pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#66645F] uppercase tracking-wider">
                      ACTIVE DOSSIER // {selectedSkill.id.toUpperCase()}
                    </span>
                    <h3 className="font-sans font-bold text-lg text-[#171717]">
                      {selectedSkill.fullName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[#66645F]">POSTINGS:</span>
                    <span className="font-bold text-[#171717]">{selectedSkill.postingsVolume}</span>
                  </div>
                </div>

                <p className="text-xs text-[#171717] leading-relaxed">
                  {selectedSkill.description}
                </p>

                {/* Co-occurring skills strip */}
                <div className="pt-2 border-t border-[#D8D2C4]/70 flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-[#66645F] text-[10px] uppercase">CO-OCCURRENCE CLUSTER:</span>
                  {selectedSkill.coOccurring.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717] text-[11px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
