import React, { useState, useEffect } from 'react';
import { getIndustryShifts } from '../api/industries';
import { SignalLoading, SignalError } from './common/SignalState';

export default function IndustryShift() {
  const [datasets, setDatasets] = useState([]);
  const [selectedSkillKey, setSelectedSkillKey] = useState('ai-agents');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getIndustryShifts();
        if (isMounted) {
          setDatasets(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load industry shifts');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const currentDataset =
    datasets.find(item => item.skillKey === selectedSkillKey) ||
    datasets[0] || {
      skillKey: 'ai-agents',
      skillLabel: 'AI AGENTS',
      definition: 'Autonomous execution frameworks',
      medianAdoption: '60.0%',
      sectors: []
    };

  const sortedSectors = [...(currentDataset.sectors || [])].sort((a, b) => b.adoptionRate - a.adoptionRate);
  const leadingSector = sortedSectors[0] || { name: 'TECHNOLOGY', adoptionRate: 88 };
  const trailingSector = sortedSectors[sortedSectors.length - 1] || { name: 'RETAIL', adoptionRate: 35 };
  const ratio = (leadingSector.adoptionRate / (trailingSector.adoptionRate || 1)).toFixed(1);

  return (
    <section id="industry-shift" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              04 / INDUSTRY SHIFT
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              CROSS-SECTOR ADOPTION
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              Comparative analysis of emerging skill penetration across five key industrial verticals.
            </p>
          </div>

          {/* Interactive Skill Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
            <span className="text-[#66645F] uppercase mr-2 hidden sm:inline">SKILL METRIC:</span>
            {datasets.map((item) => (
              <button
                key={item.skillKey}
                onClick={() => setSelectedSkillKey(item.skillKey)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  selectedSkillKey === item.skillKey
                    ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-semibold'
                    : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717] hover:bg-[#ECE7DE]'
                }`}
              >
                {item.skillLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Data Container */}
        <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-6 lg:p-10 space-y-8">
          
          {loading && datasets.length === 0 && (
            <SignalLoading message="ANALYZING CROSS-SECTOR SIGNALS..." />
          )}

          {error && datasets.length === 0 && (
            <SignalError message={error} />
          )}
          
          {/* Metadata bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D2C4] pb-4 text-xs font-mono text-[#66645F] gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[#171717] font-bold tracking-wider uppercase">
                TARGET: {currentDataset.skillLabel}
              </span>
              <span className="text-[#D8D2C4]">/</span>
              <span>MEDIAN CROSS-INDUSTRY ADOPTION: <strong className="text-[#171717]">{currentDataset.medianAdoption}</strong></span>
            </div>
            <div className="text-[11px] text-[#66645F]">
              NORMALIZED SCALE: 0% TO 100% PENETRATION
            </div>
          </div>

          {/* Scale Axis Markers */}
          <div className="hidden sm:grid grid-cols-12 text-[10px] font-mono text-[#8E8B83] border-b border-[#D8D2C4] pb-2">
            <div className="col-span-3">VERTICAL SECTOR</div>
            <div className="col-span-6 relative">
              <div className="flex justify-between">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="col-span-1 text-right">INDEX</div>
            <div className="col-span-2 text-right">YOY DELTA</div>
          </div>

          {/* Continuous Editorial Bar Visualization Rows */}
          <div className="space-y-6 pt-2">
            {currentDataset.sectors.map((sec, idx) => {
              const isLeader = idx === 0;
              const isTechnology = sec.code === 'TECH';

              return (
                <div
                  key={sec.code}
                  className="group relative p-3 sm:p-4 border border-transparent hover:border-[#D8D2C4] hover:bg-[#ECE7DE]/30 transition-all duration-150"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    
                    {/* Industry Title & Metadata */}
                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#8E8B83]">{sec.rank}</span>
                        <span className="font-sans font-bold text-sm sm:text-base text-[#171717] tracking-tight uppercase">
                          {sec.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#66645F] mt-0.5 truncate">
                        {sec.primaryUseCases}
                      </div>
                    </div>

                    {/* Horizontal Bar with Precision Ticks and Dots */}
                    <div className="sm:col-span-6 flex items-center py-2 sm:py-0">
                      <div className="relative w-full h-7 bg-[#ECE7DE] border border-[#D8D2C4] flex items-center px-1">
                        
                        {/* Background scale guide lines */}
                        <div className="absolute inset-0 flex justify-between px-0 pointer-events-none opacity-40">
                          <span className="h-full border-r border-[#D8D2C4]"></span>
                          <span className="h-full border-r border-[#D8D2C4]"></span>
                          <span className="h-full border-r border-[#D8D2C4]"></span>
                          <span className="h-full border-r border-[#D8D2C4]"></span>
                        </div>

                        {/* Filled Segment */}
                        <div
                          className={`h-4 transition-all duration-500 relative flex items-center justify-end ${
                            isLeader || isTechnology ? 'bg-[#FF4D2E]' : 'bg-[#171717]'
                          }`}
                          style={{ width: `${sec.adoptionRate}%` }}
                        >
                          {/* Precise dot indicator at edge */}
                          <div className="w-2 h-2 rounded-none bg-[#F4F1EA] border border-[#171717] -mr-1 shadow-sm"></div>
                        </div>

                      </div>
                    </div>

                    {/* Numerical Metric */}
                    <div className="sm:col-span-1 text-right font-mono font-black text-lg text-[#171717]">
                      {sec.adoptionRate}%
                    </div>

                    {/* YoY Delta */}
                    <div className="sm:col-span-2 text-right font-mono text-xs flex items-center justify-end gap-1">
                      <span className="font-bold text-[#FF4D2E]">{sec.yoyGrowth}</span>
                      <span className="text-[10px] text-[#66645F]">YoY</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Editorial Comparative Note */}
          <div className="border-t border-[#D8D2C4] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[#66645F] gap-2">
            <div>
              OBSERVATION: <strong className="text-[#171717]">{leadingSector.name}</strong> leads {currentDataset.skillLabel} deployment velocity by {ratio}× over <strong className="text-[#171717]">{trailingSector.name}</strong>.
            </div>
            <div className="text-[#171717] font-semibold">
              DIFFUSION COEFFICIENT: 0.68 (FAST PROPAGATION)
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
