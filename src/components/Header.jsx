import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Activity } from 'lucide-react';

export default function Header({ activeSection, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Format UTC time for data lab aesthetic
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'skill-radar', label: 'SKILL RADAR' },
    { id: 'skill-genome', label: 'SKILL GENOME' },
    { id: 'role-evolution', label: 'ROLE EVOLUTION' },
    { id: 'industry-shift', label: 'INDUSTRY SHIFT' },
    { id: 'the-signal', label: 'THE SIGNAL' },
    { id: 'future-scan', label: 'FUTURE SCAN' }
  ];

  return (
    <header className={`sticky top-0 z-50 bg-[#F4F1EA]/95 backdrop-blur-none border-b border-[#D8D2C4] transition-all duration-200 ${scrolled ? 'py-2.5 shadow-[0_2px_8px_rgba(23,23,23,0.03)]' : 'py-3.5'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-4">
            <a href="#overview" className="group flex flex-col items-start cursor-pointer focus:outline-none">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-2xl tracking-tighter text-[#171717] group-hover:text-[#FF4D2E] transition-colors">
                  SKILL<span className="text-[#FF4D2E]">//</span>X
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ECE7DE] border border-[#D8D2C4] text-[#66645F] uppercase tracking-wider">
                  v1.4b
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#66645F] uppercase mt-0.5">
                Workforce Skill Intelligence Engine
              </span>
            </a>
          </div>

          {/* Minimal Editorial Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none border-t md:border-t-0 border-[#D8D2C4]/50 pt-2 md:pt-0">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-xs font-mono tracking-wider transition-all whitespace-nowrap px-2 py-1 relative cursor-pointer ${
                    isActive
                      ? 'text-[#171717] font-semibold bg-[#ECE7DE]/70'
                      : 'text-[#66645F] hover:text-[#171717] hover:bg-[#ECE7DE]/40'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF4D2E]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side: Year, Data Status & Telemetry */}
          <div className="hidden lg:flex items-center space-x-4 pl-4 border-l border-[#D8D2C4] text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#171717] font-medium">
              <span className="text-[#66645F]">YEAR:</span>
              <span className="px-1.5 py-0.5 bg-[#171717] text-[#F4F1EA] text-[11px] font-bold">2026</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D2E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4D2E]"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-[#171717]">
                DATA STATUS: <span className="text-[#171717]">LIVE</span>
              </span>
            </div>

            <span className="text-[11px] text-[#66645F] hidden xl:inline">
              {currentTime}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
