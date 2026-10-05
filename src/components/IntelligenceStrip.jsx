import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function IntelligenceStrip({ onMetricClick }) {
  const metrics = [
    {
      id: "emerging-skills",
      targetId: "skill-radar",
      code: "METRIC / 01",
      number: "24",
      label: "EMERGING SKILLS",
      subtext: "+6 identified this cycle",
      delta: "+25.0%",
      badge: "EXPONENTIAL"
    },
    {
      id: "skill-combinations",
      targetId: "skill-genome",
      code: "METRIC / 02",
      number: "18",
      label: "RISING SKILL COMBINATIONS",
      subtext: "Triad & dyad active clusters",
      delta: "+44.1%",
      badge: "CO-OCCURRING"
    },
    {
      id: "roles-evolving",
      targetId: "role-evolution",
      code: "METRIC / 03",
      number: "31",
      label: "ROLES EVOLVING",
      subtext: "Across engineering & product",
      delta: "+31.8%",
      badge: "STRUCTURAL"
    },
    {
      id: "industries-analyzed",
      targetId: "industry-shift",
      code: "METRIC / 04",
      number: "12",
      label: "INDUSTRIES ANALYZED",
      subtext: "Cross-sector longitudinal tracking",
      delta: "GLOBAL",
      badge: "EXPANDED"
    }
  ];

  return (
    <section className="border-b border-[#D8D2C4] bg-[#F4F1EA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Continuous Editorial Statistics Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8D2C4] border-x border-[#D8D2C4]">
          {metrics.map((item, index) => (
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
                <span className="font-mono font-black text-5xl sm:text-6xl text-[#171717] tracking-tight group-hover:text-[#FF4D2E] transition-colors">
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
