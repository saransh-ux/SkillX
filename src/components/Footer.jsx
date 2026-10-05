import React from 'react';

export default function Footer({ onNavigate }) {
  const currentYear = 2026;

  return (
    <footer className="bg-[#ECE7DE]/50 border-t border-[#D8D2C4] py-16 text-[#171717]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#D8D2C4]">
          
          {/* Identity & Motto */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-2xl tracking-tighter text-[#171717]">
                SKILL<span className="text-[#FF4D2E]">//</span>X
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F4F1EA] border border-[#D8D2C4] text-[#66645F] uppercase">
                RESEARCH LAB
              </span>
            </div>

            <div className="font-mono text-xs font-semibold text-[#171717] tracking-widest uppercase">
              WORKFORCE SKILL INTELLIGENCE ENGINE
            </div>

            <p className="font-serif italic text-base text-[#66645F] pt-1">
              “Detect. Connect. Evolve.”
            </p>

            <p className="text-xs text-[#66645F] font-mono max-w-md leading-relaxed pt-2">
              SKILL//X continuously ingests and models longitudinal labour market data to anticipate skill shifts, role reorganizations, and cluster emergences.
            </p>
          </div>

          {/* Quick Section Links */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <div className="text-[10px] font-bold text-[#8E8B83] tracking-widest uppercase mb-2">
              INTELLIGENCE MODULES
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('skill-radar')}
                  className="hover:text-[#FF4D2E] transition-colors cursor-pointer text-left"
                >
                  01 // SKILL RADAR
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('skill-genome')}
                  className="hover:text-[#FF4D2E] transition-colors cursor-pointer text-left"
                >
                  02 // SKILL GENOME
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('role-evolution')}
                  className="hover:text-[#FF4D2E] transition-colors cursor-pointer text-left"
                >
                  03 // ROLE EVOLUTION
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('industry-shift')}
                  className="hover:text-[#FF4D2E] transition-colors cursor-pointer text-left"
                >
                  04 // INDUSTRY SHIFT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('future-scan')}
                  className="hover:text-[#FF4D2E] transition-colors cursor-pointer text-left"
                >
                  05 // FUTURE SCAN
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Metadata Dossier */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <div className="text-[10px] font-bold text-[#8E8B83] tracking-widest uppercase mb-2">
              SYSTEM TELEMETRY
            </div>
            <div className="space-y-2 text-[#66645F] text-[11px]">
              <div>DATA CORPUS: <span className="text-[#171717] font-semibold">4.82M JOB POSTINGS</span></div>
              <div>MODEL ARCH: <span className="text-[#171717] font-semibold">SKILL-GRAPH EMBED-V3.4</span></div>
              <div>BACKEND INTERFACE: <span className="text-[#171717] font-semibold">FASTAPI / PYTHON ML</span></div>
              <div>TEMPORAL BASELINE: <span className="text-[#171717] font-semibold">2021 — 2026</span></div>
              <div>PIPELINE LATENCY: <span className="text-[#171717] font-semibold">14ms GRAPH QUERY</span></div>
            </div>
          </div>

        </div>

        {/* Bottom Year and Notice Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#66645F] gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#171717]">{currentYear}</span>
            <span>•</span>
            <span>SKILL//X INTELLIGENCE SYSTEM</span>
            <span>•</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 bg-[#FF4D2E] inline-block"></span>
            <span>ENGINE RUNNING IN PROTOTYPE EVALUATION MODE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
