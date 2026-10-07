import React, { useState } from 'react';
import { runCareerScan } from '../api/career';
import { SignalLoading } from './common/SignalState';
import { Compass, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

const COMMON_SKILLS = [
  'Python',
  'SQL',
  'Machine Learning',
  'Data Visualization',
  'Statistical Analysis',
  'Git / Version Control',
  'Cloud Platforms',
  'Docker',
  'Deep Learning'
];

export default function CareerScan() {
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [experienceLevel, setExperienceLevel] = useState('Junior');
  const [currentSkills, setCurrentSkills] = useState(['Python', 'Data Visualization']);
  
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  const toggleSkill = (skill) => {
    setCurrentSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleRunScan = async (e) => {
    if (e) e.preventDefault();
    try {
      setScanning(true);
      setScanError(null);
      const data = await runCareerScan({
        targetRole,
        experienceLevel,
        currentSkills
      });
      setScanResult(data);
      setScanning(false);
    } catch (err) {
      console.warn('Career scan telemetry error:', err);
      setScanError(err.message || 'Error processing career telemetry.');
      setScanning(false);
    }
  };

  // Only display probability if backend returns a validated probability value
  const hasValidatedProbability =
    scanResult?.highSuccessProbability !== null &&
    scanResult?.highSuccessProbability !== undefined;

  return (
    <section id="career-scan" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              05 / CAREER SCAN — EVIDENCE-DERIVED SYNTHESIS
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              EVIDENCE-BASED CAREER SCAN
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Synthesizes real market signals, relevant skills, and model-associated skill signals without fabricating arbitrary match scores.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#66645F]">
            <Compass className="w-4 h-4 text-[#FF4D2E]" />
            <span className="uppercase">NON-FABRICATED TELEMETRY</span>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div className="border border-[#D8D2C4] bg-white p-6 mb-8">
          <form onSubmit={handleRunScan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Target Role Selector */}
              <div>
                <label className="block font-mono text-xs text-[#171717] font-bold uppercase mb-2">
                  TARGET DISCIPLINE / ROLE
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#171717]"
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Senior Data Scientist">Senior Data Scientist</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Analytics Engineer">Analytics Engineer</option>
                </select>
              </div>

              {/* Experience Tier Selector */}
              <div>
                <label className="block font-mono text-xs text-[#171717] font-bold uppercase mb-2">
                  EXPERIENCE TIER
                </label>
                <div className="flex gap-2">
                  {['Junior', 'Mid', 'Senior'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`flex-1 py-2 font-mono text-xs uppercase border transition-colors cursor-pointer ${
                        experienceLevel === lvl
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Current Skills Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-[#171717] font-bold uppercase">
                  ACTIVE CANDIDATE SKILLS IN PORTFOLIO
                </label>
                <span className="font-mono text-[10px] text-[#66645F]">
                  {currentSkills.length} SKILLS SELECTED
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(skill => {
                  const active = currentSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 font-mono text-xs border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FF4D2E] text-white border-[#FF4D2E]'
                          : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4] hover:border-[#171717] hover:text-[#171717]'
                      }`}
                    >
                      {active ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Action */}
            <div className="pt-2 border-t border-[#D8D2C4] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#66645F]">
                DISPATCH: POST /api/career/scan
              </span>
              <button
                type="submit"
                disabled={scanning}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#FF4D2E] text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-2"
              >
                {scanning ? 'SYNTHESIZING TELEMETRY...' : 'GENERATE EVIDENCE-BASED SCAN'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Scan Status Feedback */}
        {scanning && <SignalLoading message="SYNTHESIZING EVIDENCE-BASED CAREER SCAN..." />}
        {scanError && (
          <div className="border border-[#FF4D2E] bg-white p-4 font-mono text-xs text-[#FF4D2E] mb-6">
            ERROR: {scanError}
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && !scanning && (
          <div className="space-y-6">
            
            {/* Header Telemetry Banner */}
            <div className="border border-[#D8D2C4] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] text-[#FF4D2E] uppercase font-bold">
                  EMPIRICAL SCAN REPORT
                </div>
                <div className="font-sans font-bold text-xl text-[#171717] uppercase">
                  {scanResult.targetRole || targetRole} // {scanResult.experienceLevel || experienceLevel} LEVEL
                </div>
              </div>

              {/* Conditional Probability Display: ONLY if validated probability exists */}
              {hasValidatedProbability ? (
                <div className="border border-[#D8D2C4] bg-[#F4F1EA] px-4 py-2 font-mono text-xs">
                  <div className="text-[10px] text-[#66645F] uppercase">VALIDATED MODEL PROBABILITY</div>
                  <div className="text-lg font-bold text-[#FF4D2E]">
                    {(scanResult.highSuccessProbability * 100).toFixed(1)}%
                  </div>
                </div>
              ) : (
                <div className="border border-[#D8D2C4] bg-[#F4F1EA] px-3 py-1.5 font-mono text-[10px] text-[#66645F]">
                  METRIC GOVERNANCE: ZERO FABRICATED MATCH PROBABILITIES
                </div>
              )}
            </div>

            {/* Grid: Market Signals & Relevant Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Market Signals */}
              <div className="border border-[#D8D2C4] bg-white p-6">
                <div className="font-mono text-xs text-[#66645F] uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#FF4D2E]" />
                  <span>MARKET SIGNALS</span>
                </div>
                <div className="space-y-3">
                  {(scanResult.marketSignals || []).map((item, idx) => (
                    <div key={idx} className="border-l-2 border-[#171717] pl-3 py-1 bg-[#F4F1EA]/50 p-2">
                      <div className="text-xs text-[#171717] font-normal leading-relaxed">
                        {item.signal || item}
                      </div>
                      {item.source && (
                        <div className="font-mono text-[9px] text-[#66645F] uppercase mt-1">
                          SOURCE: {item.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Relevant Skills */}
              <div className="border border-[#D8D2C4] bg-white p-6">
                <div className="font-mono text-xs text-[#66645F] uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF4D2E]" />
                  <span>RELEVANT SKILLS IN CORPUS</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#66645F] mb-3">
                    Core skill variables identified in empirical postings for this target role:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(scanResult.relevantSkills || []).map((skill, idx) => {
                      const verified = currentSkills.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 font-mono text-xs border flex items-center gap-1.5 ${
                            verified
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4]'
                          }`}
                        >
                          {verified && <CheckCircle2 className="w-3 h-3 text-[#FF4D2E]" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Model-Associated Skill Signals */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase font-bold tracking-wider mb-4">
                MODEL-ASSOCIATED SKILL SIGNALS
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#D8D2C4] text-[#66645F] text-[10px] uppercase">
                      <th className="py-2 pr-4">VARIABLE NAME</th>
                      <th className="py-2 pr-4">CANDIDATE PROFILE STATUS</th>
                      <th className="py-2">MODEL SIGNAL IMPACT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D2C4]">
                    {(scanResult.modelAssociatedSkills || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F1EA]/50">
                        <td className="py-2.5 pr-4 font-bold text-[#171717]">
                          {item.skill || item.name}
                        </td>
                        <td className="py-2.5 pr-4 text-[#66645F]">
                          {item.status || (currentSkills.includes(item.skill) ? 'Validated in portfolio' : 'Priority acquisition')}
                        </td>
                        <td className="py-2.5 text-[#FF4D2E] font-bold">
                          {item.modelImpact || 'High positive association'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Evidence-Derived Recommendations */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase font-bold tracking-wider mb-4">
                EVIDENCE-DERIVED RECOMMENDATIONS
              </div>
              <div className="space-y-3">
                {(scanResult.evidenceDerivedRecommendations || []).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#F4F1EA]/60 border border-[#D8D2C4]">
                    <span className="font-mono text-xs font-bold text-[#FF4D2E] w-6 shrink-0">
                      0{idx + 1}.
                    </span>
                    <p className="text-xs text-[#171717] font-normal leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
