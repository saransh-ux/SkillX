import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function IntelligenceStrip({ onMetricClick }) {
  const metrics = [
    {
      id: "emerging-skills",
      targetId: "skill-radar",
      code: "METRIC / 01",
      number: "15,841",
      label: "TOTAL POSTINGS ANALYZED",
      subtext: "Analytics Jobs corpus",
      delta: "100% REAL",
      badge: "GROUNDED"
    },
    {
      id: "skill-combinations",
      targetId: "skill-genome",
      code: "METRIC / 02",
      number: "20",
      label: "CANONICAL HUBS",
      subtext: "Skill Genome co-occurrence network",
      delta: "JACCARD",
      badge: "TOPOLOGY"
    },
    {
      id: "roles-evolving",
      targetId: "the-signal",
      code: "METRIC / 03",
      number: "85.8%",
      label: "CAREER MODEL BALANCED ACC",
      subtext: "JDS Skill Traits (Logistic Regression)",
      delta: "N=692",
      badge: "VALIDATED"
    },
    {
      id: "industries-analyzed",
      targetId: "industry-shift",
      code: "METRIC / 04",
      number: "92.8%",
      label: "SENIOR MODEL BALANCED ACC",
      subtext: "SDS Personality (Random Forest)",
      delta: "N=805",
      badge: "VALIDATED"
    }
  ];

  return (
    <section className="border-b border-[#D8D2C4] bg-[#F4F1EA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Continuous Editorial Statistics Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8D2C4] border-x border-[#D8D2C4]">
          {metrics.map((item) => (
            <div
              key={item.id}
              onClick={() => onMetricClick && onMetricClick(item.targetId)}
              className="p-6 sm:p-7 group hover:bg-[#ECE7DE]/50 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
            >
              {/* Row 1: Code and Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#66645F] mb-4">
                <span className="font-semibold tracking-wider text-[#171717]">{item.code}</span>
                <span className="text-[10px] px-1.5 py-0.5 border border-[#D8D2C4] bg-[#F4F1EA] group-hover:border-[#171717] transition-colors">
                  {item.badge}
                </span>
              </div>

              {/* Row 2: Massive Number & Jump icon */}
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-black text-4xl sm:text-5xl text-[#171717] tracking-tight group-hover:text-[#FF4D2E] transition-colors">
                  {item.number}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#66645F] opacity-0 group-hover:opacity-100 group-hover:text-[#FF4D2E] transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Row 3: Label */}
              <div className="mt-4 pt-3 border-t border-[#D8D2C4]/60">
                <div className="font-mono text-xs font-bold text-[#171717] tracking-wider uppercase">
                  {item.label}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-[#66645F] font-mono">
                  <span>{item.subtext}</span>
                  <span className="text-[#FF4D2E] font-semibold">{item.delta}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
