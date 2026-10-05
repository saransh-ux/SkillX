import React, { useState } from 'react';
import { ArrowRight, Plus, Equal, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SignalInsight() {
  const [activeRecipe, setActiveRecipe] = useState([
    'AI AGENTS',
    'RAG',
    'APIs',
    'CLOUD'
  ]);

  const optionalSkills = [
    'VECTOR DATABASES',
    'EVALUATION HARNESSES',
    'eBPF SECURITY',
    'LANGGRAPH'
  ];

  const toggleSkill = (skill) => {
    if (activeRecipe.includes(skill)) {
      if (activeRecipe.length > 2) {
        setActiveRecipe(activeRecipe.filter(s => s !== skill));
      }
    } else {
      setActiveRecipe([...activeRecipe, skill]);
    }
  };

  // Determine synthesized role outcome based on ingredients
  const getSynthesizedRole = () => {
    if (activeRecipe.includes('VECTOR DATABASES') && activeRecipe.includes('EVALUATION HARNESSES')) {
      return {
        title: "AUTONOMOUS SYSTEM ORCHESTRATOR",
        rarity: "FRONTIER ELITE (TOP 2%)",
        salaryPremium: "+42.5%",
        coOccurrenceIndex: "11.2×",
        status: "MAXIMUM VELOCITY"
      };
    }
    if (activeRecipe.includes('VECTOR DATABASES')) {
      return {
        title: "RETRIEVAL & AGENT SYSTEMS ENGINEER",
        rarity: "HIGH DEMAND (TOP 5%)",
        salaryPremium: "+38.0%",
        coOccurrenceIndex: "9.8×",
        status: "EXPANDING FAST"
      };
    }
    return {
      title: "COMPOUND AI SYSTEMS ARCHITECT",
      rarity: "EMERGING CORE (TOP 8%)",
      salaryPremium: "+34.5%",
      coOccurrenceIndex: "8.4×",
      status: "STRUCTURAL SHIFT"
    };
  };

  const synthesized = getSynthesizedRole();

  return (
    <section id="the-signal" className="border-b border-[#D8D2C4] bg-[#ECE7DE]/40 py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Research Finding Dispatch Tag */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#FF4D2E] font-bold tracking-editorial uppercase mb-4">
          <span className="w-2 h-2 bg-[#FF4D2E]"></span>
          FEATURED RESEARCH FINDING // THE SIGNAL
        </div>

        {/* Large Editorial Headline */}
        <div className="max-w-4xl space-y-4 mb-12">
          <h2 className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-[#171717] leading-[0.95] uppercase">
            “AI AGENTS ARE NOT GROWING ALONE.”
          </h2>
          <p className="text-lg sm:text-xl font-sans text-[#66645F] leading-relaxed pt-2">
            Across emerging job descriptions, AI Agents increasingly appear alongside RAG, APIs, cloud infrastructure and data systems.
          </p>
        </div>

        {/* The Equation / Synthesis Visual */}
        <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-6 lg:p-10 mb-12">
          
          <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-8 text-xs font-mono text-[#66645F]">
            <span>COMPOUND SKILL SYNTHESIZER</span>
            <span className="text-[#FF4D2E] font-semibold">SIGNAL CO-OCCURRENCE MODEL</span>
          </div>

          {/* Equation Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 py-4">
            
            {activeRecipe.map((skill, index) => (
              <React.Fragment key={skill}>
                <div className="px-4 py-3 bg-[#171717] text-[#F4F1EA] font-mono font-bold text-xs sm:text-sm tracking-wider uppercase border border-[#171717] shadow-none flex items-center gap-2">
                  <span>{skill}</span>
                  {activeRecipe.length > 2 && (
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="text-[#8E8B83] hover:text-[#FF4D2E] cursor-pointer ml-1 text-xs"
                      title="Remove component"
                    >
                      ×
                    </button>
                  )}
                </div>

                {index < activeRecipe.length - 1 && (
                  <span className="font-mono font-bold text-xl text-[#FF4D2E] px-1 select-none">
                    +
                  </span>
                )}
              </React.Fragment>
            ))}

            {/* Transition Arrow */}
            <div className="px-3 flex items-center text-[#FF4D2E] select-none">
              <span className="font-mono text-2xl font-bold sm:hidden">↓</span>
              <span className="font-mono text-2xl font-bold hidden sm:inline">→</span>
            </div>

            {/* Synthesized Outcome Box */}
            <div className="px-5 py-3 bg-[#FF4D2E] text-[#F4F1EA] font-mono font-black text-xs sm:text-sm tracking-wider uppercase border border-[#FF4D2E] flex items-center gap-2 shadow-none">
              <span>{synthesized.title}</span>
            </div>

          </div>

          {/* Interactive Component Injector */}
          <div className="mt-8 pt-6 border-t border-[#D8D2C4] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#66645F] uppercase">TEST COMPOUND VARIABLE:</span>
              {optionalSkills.map((opt) => {
                const isIncluded = activeRecipe.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleSkill(opt)}
                    className={`px-2.5 py-1 border transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
                      isIncluded
                        ? 'bg-[#171717] text-[#F4F1EA] border-[#171717]'
                        : 'bg-[#ECE7DE] text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
                    }`}
                  >
                    <span>{isIncluded ? '−' : '+'}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-[#66645F]">
              CLICK TO SIMULATE ROLE RECONFIGURATION
            </div>
          </div>

        </div>

        {/* Editorial Telemetry Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#D8D2C4] divide-y sm:divide-y-0 sm:divide-x divide-[#D8D2C4] bg-[#F4F1EA]">
          <div className="p-6">
            <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
              CO-OCCURRENCE MULTIPLIER
            </div>
            <div className="font-mono font-black text-4xl text-[#171717] mt-2">
              {synthesized.coOccurrenceIndex}
            </div>
            <p className="text-xs text-[#66645F] font-mono mt-1">
              Higher cluster pairing frequency compared to isolated postings.
            </p>
          </div>

          <div className="p-6">
            <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
              ESTIMATED MARKET PREMIUM
            </div>
            <div className="font-mono font-black text-4xl text-[#FF4D2E] mt-2">
              {synthesized.salaryPremium}
            </div>
            <p className="text-xs text-[#66645F] font-mono mt-1">
              Compensatory differential for validated multi-skill systems engineers.
            </p>
          </div>

          <div className="p-6">
            <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
              DEPENDENCY CORRELATION
            </div>
            <div className="font-mono font-black text-4xl text-[#171717] mt-2">
              68.4%
            </div>
            <p className="text-xs text-[#66645F] font-mono mt-1">
              Of agent job listings explicitly mandate vector index architecture.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
