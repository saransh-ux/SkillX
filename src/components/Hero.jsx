import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Hero({ onExplore }) {
  return (
    <section id="overview" className="border-b border-[#D8D2C4] bg-[#F4F1EA] pt-12 pb-16 lg:pt-16 lg:pb-20 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Top Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#D8D2C4] pb-3 mb-10 text-xs font-mono text-[#66645F] gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#171717] tracking-wider">LAB DISPATCH // ISSUE 48</span>
            <span className="text-[#D8D2C4]">/</span>
            <span>SAMPLE: 4.82M GLOBAL POSTINGS</span>
            <span className="text-[#D8D2C4] hidden sm:inline">/</span>
            <span className="hidden sm:inline">METHOD: GRAPH EMBEDDING v3.4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-[#FF4D2E]"></span>
            <span className="tracking-wider text-[#171717]">SYSTEM_INDEX_STABLE</span>
          </div>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Vertical Signal Tag & Headline */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-start gap-4 sm:gap-6">
              
              {/* Vertical Label - Swiss typography touch */}
              <div className="hidden sm:flex flex-col items-center pt-2">
                <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[10px] tracking-editorial text-[#66645F] uppercase border-r border-[#D8D2C4] pr-2">
                  WORKFORCE SIGNAL / 01
                </span>
                <span className="w-1.5 h-6 bg-[#FF4D2E] mt-3"></span>
              </div>

              <div className="space-y-6 flex-1">
                <div className="sm:hidden font-mono text-[10px] tracking-editorial text-[#FF4D2E] uppercase font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF4D2E]"></span>
                  WORKFORCE SIGNAL / 01
                </div>

                {/* Massive Editorial Headline */}
                <h1 className="font-sans font-black text-4xl sm:text-6xl xl:text-7xl tracking-tighter text-[#171717] leading-[0.92] uppercase">
                  THE SKILL<br />
                  <span className="text-[#171717]">ECOSYSTEM</span><br />
                  <span className="text-[#171717] underline decoration-[#FF4D2E] decoration-4 underline-offset-8">IS CHANGING.</span>
                </h1>

                {/* Subtitle / Positioning Statement */}
                <p className="text-lg sm:text-xl text-[#66645F] font-normal leading-relaxed max-w-2xl pt-2">
                  SKILL//X detects emerging skills, connects them into evolving skill ecosystems, and reveals how work is changing before the shift becomes obvious.
                </p>

                {/* Technical Signals Micro-bar */}
                <div className="pt-4 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-mono text-[#66645F] border-t border-[#D8D2C4]/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[#171717] font-semibold">SIGNAL VELOCITY:</span>
                    <span className="text-[#FF4D2E] font-bold">+37.4% YOY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#171717] font-semibold">PRIMARY CLUSTER:</span>
                    <span className="px-1.5 py-0.5 bg-[#ECE7DE] text-[#171717] font-medium">COMPOUND AI SYSTEMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#171717] font-semibold">OBSOLESCENCE ACCELERATION:</span>
                    <span className="text-[#171717]">1.8× BASELINE</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Side: Editorial Numerical Intelligence Indicator */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#D8D2C4] pt-8 lg:pt-0 lg:pl-10">
            
            <div className="space-y-6">
              {/* Header inside indicator block */}
              <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 text-xs font-mono">
                <span className="text-[#66645F]">AGGREGATE METRIC</span>
                <span className="text-[#FF4D2E] font-semibold">Q3 // 2026</span>
              </div>

              {/* Huge Monospaced Metric */}
              <div className="pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-7xl sm:text-8xl tracking-tight text-[#171717] leading-none">
                    87
                  </span>
                  <span className="text-xl font-mono text-[#66645F]">/ 100</span>
                </div>
                
                <div className="mt-2 font-mono text-sm tracking-widest text-[#171717] uppercase font-bold">
                  EMERGENCE INDEX
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-[#171717]">
                  <span className="text-[#FF4D2E] font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +12.4%
                  </span>
                  <span className="text-[#66645F]">vs previous period</span>
                </div>
              </div>

              {/* Research Annotation */}
              <div className="bg-[#ECE7DE] border border-[#D8D2C4] p-4 text-xs space-y-2">
                <div className="font-mono text-[10px] text-[#66645F] tracking-wider uppercase font-semibold flex items-center justify-between">
                  <span>TELEMETRY SUMMARY</span>
                  <span className="text-[#171717]">99.2% CONF</span>
                </div>
                <p className="text-[#171717] leading-relaxed font-sans text-xs">
                  Market demand shows unprecedented clustering around autonomous execution loops, vector store indexing, and LLM context architecture.
                </p>
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <button
                  onClick={() => onExplore('skill-radar')}
                  className="w-full inline-flex items-center justify-between px-4 py-3 bg-[#171717] hover:bg-[#FF4D2E] text-[#F4F1EA] text-xs font-mono tracking-wider transition-colors duration-150 cursor-pointer"
                >
                  <span>INSPECT RADAR SIGNALS</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
