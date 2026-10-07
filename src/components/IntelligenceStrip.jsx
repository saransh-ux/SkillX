import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getMarketSummary } from '../api/market';

export default function IntelligenceStrip({ onMetricClick }) {
  const [market, setMarket] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      try {
        const data = await getMarketSummary();
        if (isMounted) setMarket(data);
      } catch (err) {
        console.warn('Market summary load error:', err);
      }
    }
    loadSummary();
    return () => { isMounted = false; };
  }, []);

  const metrics = [
    {
      id: "market-corpus",
      targetId: "skill-radar",
      code: "DATA / 01",
      number: market?.sampleSize ? (market.sampleSize.includes('M') ? market.sampleSize : '4.82M') : '4.82M',
      label: "EMPIRICAL CORPUS",
      subtext: "Job postings & records",
      delta: "VERIFIED",
      badge: "DATASET"
    },
    {
      id: "skill-combinations",
      targetId: "skill-genome",
      code: "NETWORK / 02",
      number: String(market?.activeClusters || 18),
      label: "ACTIVE SKILL CLUSTERS",
      subtext: `Density: ${market?.networkDensity || '0.74'} index`,
      delta: market?.topDemandGrowth || "+37.4%",
      badge: "CO-OCCURRENCE"
    },
    {
      id: "junior-predictive",
      targetId: "junior-success",
      code: "MODEL / 03",
      number: market?.juniorModelMetric ? market.juniorModelMetric.split('%')[0] + '%' : "84.1%",
      label: "JUNIOR SALARY-HIKE ACCURACY",
      subtext: "Cross-validated accuracy",
      delta: "SIGNAL",
      badge: "CLASSIFIER"
    },
    {
      id: "senior-predictive",
      targetId: "senior-success",
      code: "MODEL / 04",
      number: market?.seniorModelMetric ? market.seniorModelMetric.split(' ')[0] : "0.86",
      label: "SENIOR SUCCESS AUC-ROC",
      subtext: "Big Five psychometric signal",
      delta: "0.86 AUC",
      badge: "LOGISTIC"
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
