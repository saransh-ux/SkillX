import React, { useState } from 'react';
import { runCareerScan } from '../services/api';
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, TrendingUp, Sparkles, BarChart2 } from 'lucide-react';

export default function FutureScan() {
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [location, setLocation] = useState('Bengaluru');

  // Technical skill ratings (1.0 to 5.0)
  const [skillProfile, setSkillProfile] = useState({
    big_data_skills: 3.8,
    maths_stats_skills: 4.2,
    coding_skills: 4.0,
    ai_and_ml_skills: 4.5,
    dashboard_and_storytelling_skills: 3.5,
  });

  // Big Five personality scores (0.0 to 100.0)
  const [personalityProfile, setPersonalityProfile] = useState({
    neuroticism: 30.0,
    extraversion: 45.0,
    openness_to_experience: 50.0,
    agreeableness: 48.0,
    conscientiousness: 55.0,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const roleOptions = [
    'Data Scientist',
    'Data Analyst',
    'Machine Learning Engineer',
    'Business Analyst',
    'Data Engineer',
  ];

  const locationOptions = [
    'Bengaluru',
    'Mumbai',
    'Pune',
    'Hyderabad',
    'Delhi NCR',
    'Chennai',
  ];

  const handleSkillChange = (key, val) => {
    setSkillProfile(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handlePersonalityChange = (key, val) => {
    setPersonalityProfile(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const payload = {
        target_role: targetRole,
        location: location,
        skill_profile: skillProfile,
        personality_profile: personalityProfile,
      };
      const res = await runCareerScan(payload);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Failed to execute Career Scan synthesis');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section id="future-scan" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="border-b border-[#D8D2C4] pb-6 mb-10">
          <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
            05 / CAREER SCAN
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
            MULTI-LAYER EVIDENCE SYNTHESIS
          </h2>
          <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
            Synthesizes current Market Demand (Analytics Jobs), Junior Success Models (JDS), and Senior Success Classifiers (SDS). No speculative future forecasting.
          </p>
        </div>

        {/* Interactive Parameter Control Terminal */}
        <div className="border border-[#D8D2C4] bg-[#F4F1EA] divide-y divide-[#D8D2C4]">
          
          {/* Header Bar */}
          <div className="bg-[#ECE7DE]/60 px-6 py-3 flex items-center justify-between text-xs font-mono text-[#66645F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#171717] inline-block"></span>
              <span className="font-bold text-[#171717] uppercase">CAREER PROFILE INPUT MATRIX</span>
            </div>
            <span>EVIDENCE LAYERS: 3 INDEPENDENT DATASETS</span>
          </div>

          {/* Form Controls */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Row 1: Target Role & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                  TARGET DESIGNATION (ANALYTICS MARKET)
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                  TARGET METROPOLITAN HUB (LOCATION)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Technical Skill Traits (JDS Layer: 1.0 - 5.0) */}
            <div className="space-y-3 pt-2 border-t border-[#D8D2C4]/60">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#171717] uppercase">
                  1. TECHNICAL PROFICIENCY RATINGS (JDS COHORT // 1.0 TO 5.0)
                </span>
                <span className="text-[#8E8B83]">FEEDS CAREER SUCCESS MODEL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { key: 'big_data_skills', label: 'Big Data' },
                  { key: 'maths_stats_skills', label: 'Maths & Stats' },
                  { key: 'coding_skills', label: 'Coding / Dev' },
                  { key: 'ai_and_ml_skills', label: 'AI & ML' },
                  { key: 'dashboard_and_storytelling_skills', label: 'Storytelling' },
                ].map(({ key, label }) => (
                  <div key={key} className="p-3 bg-[#ECE7DE]/30 border border-[#D8D2C4] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#66645F] uppercase font-bold">{label}</span>
                      <span className="text-[#171717] font-black">{skillProfile[key].toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={skillProfile[key]}
                      onChange={(e) => handleSkillChange(key, e.target.value)}
                      className="w-full accent-[#FF4D2E] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Personality Traits (SDS Layer: 0.0 - 100.0) */}
            <div className="space-y-3 pt-2 border-t border-[#D8D2C4]/60">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#171717] uppercase">
                  2. PSYCHOMETRIC BIG FIVE TRAITS (SDS COHORT // 0.0 TO 100.0)
                </span>
                <span className="text-[#8E8B83]">FEEDS SENIOR SUCCESS MODEL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { key: 'neuroticism', label: 'Neuroticism' },
                  { key: 'extraversion', label: 'Extraversion' },
                  { key: 'openness_to_experience', label: 'Openness' },
                  { key: 'agreeableness', label: 'Agreeableness' },
                  { key: 'conscientiousness', label: 'Conscientiousness' },
                ].map(({ key, label }) => (
                  <div key={key} className="p-3 bg-[#ECE7DE]/30 border border-[#D8D2C4] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#66645F] uppercase font-bold">{label}</span>
                      <span className="text-[#171717] font-black">{personalityProfile[key].toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="10.0"
                      max="90.0"
                      step="1.0"
                      value={personalityProfile[key]}
                      onChange={(e) => handlePersonalityChange(key, e.target.value)}
                      className="w-full accent-[#171717] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Button Bar */}
          <div className="p-6 bg-[#ECE7DE]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#66645F]">
              <span>ACTIVE TARGET: </span>
              <strong className="text-[#171717]">{targetRole}</strong> in <strong className="text-[#171717]">{location}</strong>
            </div>

            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF4D2E] hover:bg-[#E53E20] text-white text-xs font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-none disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SYNTHESIZING MULTI-LAYER DOSSIER...</span>
                </>
              ) : (
                <>
                  <span>RUN CAREER SCAN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 border border-[#FF4D2E]/30 bg-[#FF4D2E]/5 p-4 text-xs font-mono text-[#FF4D2E] flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>ERROR: {error}</span>
          </div>
        )}

        {/* Scan Results Readout Section */}
        {scanResult && (
          <div className="mt-8 border border-[#171717] bg-[#F4F1EA] divide-y divide-[#D8D2C4] animate-fadeIn">
            
            {/* Header Strip */}
            <div className="p-6 bg-[#171717] text-[#F4F1EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FF4D2E] text-white font-bold">
                  CAREER SCAN SYNTHESIS
                </span>
                <span className="px-2 py-0.5 border border-[#444] text-[#F4F1EA] uppercase text-[10px] font-bold">
                  BACKEND-DERIVED SIGNAL
                </span>
                <span className="px-2 py-0.5 border border-[#444] text-[#D8D2C4] uppercase text-[10px]">
                  EMPIRICAL DATASET
                </span>
                <span className="ml-2">TARGET: {targetRole} ({location})</span>
              </div>
              <div className="text-[#8E8B83]">
                GROUNDED IN THREE EMPIRICAL CORPUSES (15,841 POSTINGS // JDS n=139 // SDS n=161)
              </div>
            </div>

            {/* Evidence Layer 1: Market Demand Evidence */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                <span>LAYER 1: OBSERVED MARKET DEMAND EVIDENCE (ANALYTICS JOBS)</span>
                <span className="text-[#66645F]">N=15,841 POSTINGS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResult.market_evidence?.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#ECE7DE]/30 border border-[#D8D2C4] font-mono text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#171717] uppercase">{item.title}</span>
                      <span className="text-[#FF4D2E] font-black">{item.prevalence_pct}%</span>
                    </div>
                    <div className="text-[#66645F] text-[11px]">{item.summary}</div>
                    <div className="text-[10px] text-[#8E8B83] pt-1">
                      Volume: {item.posting_count.toLocaleString()} observed listings
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Layers 2 & 3: Supervised Machine Learning Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D8D2C4]">
              
              {/* Junior Career Model (JDS) */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span>LAYER 2: JDS CAREER SUCCESS MODEL</span>
                  <span className="text-[#FF4D2E]">{scanResult.career_model?.model}</span>
                </div>

                <div className="p-4 bg-[#ECE7DE]/50 border border-[#D8D2C4] space-y-2">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-[#66645F] uppercase">PREDICTED HIKE CLASS:</span>
                    <span className="text-2xl font-black text-[#171717] uppercase">
                      {scanResult.career_model?.predicted_label} HIKE
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#66645F]">High-Hike Probability:</span>
                    <strong className="text-[#FF4D2E]">
                      {(scanResult.career_model?.probability_high * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-[#66645F] font-mono leading-relaxed">
                  {scanResult.career_model?.interpretation}
                </p>

                {/* Evidence traits */}
                <div className="space-y-1 pt-2 font-mono text-[11px]">
                  <div className="text-[#8E8B83] text-[10px] uppercase font-bold">TOP CONTRIBUTING SKILL TRAITS:</div>
                  {scanResult.career_model?.evidence?.slice(0, 3).map((ev) => (
                    <div key={ev.feature} className="flex justify-between py-0.5 border-b border-[#D8D2C4]/40">
                      <span className="text-[#171717]">{ev.display_name}</span>
                      <span className="text-[#66645F] font-semibold">{ev.impact_direction} impact</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senior Success Model (SDS) */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span>LAYER 3: SDS SENIOR SUCCESS MODEL</span>
                  <span className="text-[#FF4D2E]">{scanResult.senior_model?.model}</span>
                </div>

                <div className="p-4 bg-[#ECE7DE]/50 border border-[#D8D2C4] space-y-2">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-[#66645F] uppercase">PREDICTED SUCCESS CLASS:</span>
                    <span className="text-2xl font-black text-[#171717] uppercase">
                      {scanResult.senior_model?.predicted_label} SUCCESS
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#66645F]">High-Success Probability:</span>
                    <strong className="text-[#FF4D2E]">
                      {(scanResult.senior_model?.probability_high * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-[#66645F] font-mono leading-relaxed">
                  {scanResult.senior_model?.interpretation}
                </p>

                {/* Evidence traits */}
                <div className="space-y-1 pt-2 font-mono text-[11px]">
                  <div className="text-[#8E8B83] text-[10px] uppercase font-bold">TOP PERSONALITY INFLUENCES:</div>
                  {scanResult.senior_model?.evidence?.slice(0, 3).map((ev) => (
                    <div key={ev.feature} className="flex justify-between py-0.5 border-b border-[#D8D2C4]/40">
                      <span className="text-[#171717]">{ev.display_name}</span>
                      <span className="text-[#66645F] font-semibold">{ev.impact_direction} impact</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Priority Skills Breakdown */}
            {scanResult.priority_skills && scanResult.priority_skills.length > 0 && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span>GROUNDED PRIORITY SKILLS (CROSS-REFERENCED WITH MARKET POSTINGS)</span>
                  <span className="text-[#8E8B83]">DEMAND × MODEL LEVERAGE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanResult.priority_skills.map((ps) => (
                    <div key={ps.canonical_name} className="p-4 bg-[#ECE7DE]/30 border border-[#D8D2C4] font-mono text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[#171717] text-sm uppercase">{ps.skill_name}</span>
                        <span className="text-[10px] px-1 bg-[#F4F1EA] border border-[#D8D2C4] text-[#FF4D2E] font-bold">
                          {ps.priority_tier}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#66645F]">
                        <span>Market Prevalence:</span>
                        <strong className="text-[#171717]">{ps.market_prevalence_pct}%</strong>
                      </div>
                      <div className="text-[11px] text-[#66645F] font-sans pt-1 leading-snug">
                        {ps.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grounded Recommendations */}
            {scanResult.recommendations && scanResult.recommendations.length > 0 && (
              <div className="p-6 sm:p-8 space-y-4 bg-[#ECE7DE]/20">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase border-b border-[#D8D2C4] pb-2">
                  DETERMINISTIC EVIDENCE RECOMMENDATIONS
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {scanResult.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-[#F4F1EA] border-l-4 border-l-[#FF4D2E] border border-[#D8D2C4] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171717] uppercase">{rec.title}</span>
                        <span className="text-[10px] text-[#8E8B83]">DATASET: {rec.source_dataset}</span>
                      </div>
                      <p className="text-[#171717] font-sans text-xs leading-relaxed">
                        {rec.actionable_guidance}
                      </p>
                      <div className="text-[10px] text-[#66645F] pt-1">
                        <strong>Evidence:</strong> {rec.evidence} (N={rec.sample_size})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Caveats Banner */}
            <div className="p-6 bg-[#ECE7DE]/50 space-y-2 text-xs font-mono text-[#66645F]">
              <div className="text-[#171717] font-bold uppercase flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#FF4D2E]" />
                <span>METHODOLOGICAL CAVEATS</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside">
                {scanResult.caveats?.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
