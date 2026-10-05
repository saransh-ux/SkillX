import React, { useState } from 'react';
import { mockRoles } from '../data/mockRoles';
import { ArrowRight, ArrowDown, Clock, GitCommit, Layers, Sparkles } from 'lucide-react';

export default function RoleEvolution() {
  const [selectedRoleId, setSelectedRoleId] = useState('software-engineer');
  const role = mockRoles.find(r => r.id === selectedRoleId) || mockRoles[0];

  return (
    <section id="role-evolution" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              03 / ROLE EVOLUTION
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              ROLE TRAJECTORY TIMELINE
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              Longitudinal tracking of skill core requirements across key workforce roles from 2023 through 2026.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
            <span className="text-[#66645F] uppercase mr-2 hidden sm:inline">SELECT ROLE:</span>
            {mockRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  selectedRoleId === r.id
                    ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-semibold'
                    : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717] hover:bg-[#ECE7DE]'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Meta & Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 border border-[#D8D2C4] divide-y md:divide-y-0 md:divide-x divide-[#D8D2C4] bg-[#ECE7DE]/40 mb-10 text-xs font-mono">
          <div className="p-4">
            <span className="text-[#66645F] uppercase text-[10px]">OCCUPATION CODE</span>
            <div className="font-bold text-[#171717] text-sm mt-0.5">{role.code}</div>
          </div>
          <div className="p-4">
            <span className="text-[#66645F] uppercase text-[10px]">SKILL HALF-LIFE</span>
            <div className="font-bold text-[#171717] text-sm mt-0.5">{role.metrics.skillHalfLife}</div>
          </div>
          <div className="p-4">
            <span className="text-[#66645F] uppercase text-[10px]">AI AUGMENTATION RATIO</span>
            <div className="font-bold text-[#FF4D2E] text-sm mt-0.5">{role.metrics.aiAugmentationRatio}</div>
          </div>
          <div className="p-4">
            <span className="text-[#66645F] uppercase text-[10px]">ROLE RE-SKILL VELOCITY</span>
            <div className="font-bold text-[#171717] text-sm mt-0.5">{role.metrics.velocityDelta}</div>
          </div>
        </div>

        {/* Main Horizontal Timeline */}
        <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-6 lg:p-8">
          
          <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-8 text-xs font-mono text-[#66645F]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#171717]">{role.title}</span>
              <span>// 4-YEAR TRANSITION FLOW</span>
            </div>
            <span className="text-[#FF4D2E] font-semibold">2023 → 2026</span>
          </div>

          {/* Horizontal Step Columns with Transition Vectors */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {role.timeline.map((step, idx) => {
              const isFinalYear = step.year === '2026';
              const isFirstYear = step.year === '2023';

              return (
                <div key={step.year} className="relative flex flex-col justify-between">
                  
                  {/* Step Card / Column */}
                  <div className={`p-5 border transition-all h-full flex flex-col justify-between ${
                    isFinalYear
                      ? 'border-[#FF4D2E] bg-[#FF4D2E]/5 shadow-none'
                      : 'border-[#D8D2C4] bg-[#F4F1EA]'
                  }`}>
                    
                    {/* Header: Year & Tag */}
                    <div>
                      <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 mb-3">
                        <span className={`font-mono text-2xl font-black ${
                          isFinalYear ? 'text-[#FF4D2E]' : 'text-[#171717]'
                        }`}>
                          {step.year}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                          isFinalYear
                            ? 'border-[#FF4D2E] text-[#FF4D2E] font-bold'
                            : 'border-[#D8D2C4] text-[#66645F]'
                        }`}>
                          {isFinalYear ? 'FRONTIER' : `PHASE 0${idx + 1}`}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono uppercase text-[#66645F] font-semibold tracking-wider mb-4">
                        {step.period}
                      </div>

                      {/* Skills List in Editorial Monospace format */}
                      <div className="space-y-2 mb-6">
                        <div className="text-[10px] font-mono text-[#8E8B83] uppercase">
                          REQUIRED SKILL VECTOR:
                        </div>
                        {step.skills.map((skill) => (
                          <div
                            key={skill}
                            className={`p-2 font-mono text-xs flex items-center justify-between border ${
                              isFinalYear
                                ? 'bg-[#F4F1EA] border-[#FF4D2E]/40 text-[#171717] font-bold'
                                : 'bg-[#ECE7DE]/50 border-[#D8D2C4] text-[#171717]'
                            }`}
                          >
                            <span>{skill}</span>
                            {isFinalYear && (
                              <span className="w-1.5 h-1.5 bg-[#FF4D2E] inline-block"></span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Paradigm Footnote */}
                    <div className="pt-3 border-t border-[#D8D2C4] text-[11px] font-mono text-[#66645F]">
                      <span className="block text-[9px] uppercase tracking-wider text-[#8E8B83]">PARADIGM:</span>
                      <span className="text-[#171717] font-medium">{step.dominantParadigm}</span>
                    </div>

                  </div>

                  {/* Flow Arrow (Desktop horizontal, Mobile vertical) */}
                  {idx < 3 && (
                    <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-[#171717] text-[#F4F1EA] items-center justify-center shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-[#F4F1EA]" />
                    </div>
                  )}

                  {idx < 3 && (
                    <div className="md:hidden flex justify-center py-2 text-[#66645F]">
                      <ArrowDown className="w-4 h-4 text-[#FF4D2E]" />
                    </div>
                  )}

                </div>
              );
            })}

          </div>

          {/* Editorial Key Insight Callout */}
          <div className="mt-10 border-t border-[#D8D2C4] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#ECE7DE]/30 p-5 border">
            <div className="flex items-start gap-4">
              <span className="px-2 py-1 bg-[#171717] text-[#F4F1EA] text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap">
                RESEARCH INSIGHT
              </span>
              <p className="text-sm font-sans font-medium text-[#171717] leading-relaxed">
                “{role.insight}”
              </p>
            </div>
            <div className="text-xs font-mono text-[#66645F] whitespace-nowrap pl-4 border-l border-[#D8D2C4] hidden lg:block">
              SOURCE: SKILL//X LONGITUDINAL REUTER INDEX
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
