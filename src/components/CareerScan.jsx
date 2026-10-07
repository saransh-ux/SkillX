import React, { useState } from 'react';
import { runCareerScan } from '../api/career';
import { SignalLoading, SignalError } from './common/SignalState';
import { Compass, CheckCircle2, ArrowRight, AlertCircle, Layers, ShieldCheck, Activity } from 'lucide-react';

export default function CareerScan() {
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [location, setLocation] = useState('Bengaluru');

  // Technical skill proficiencies (1.0 to 5.0) matching CareerSuccessInput
  const [skillProfile, setSkillProfile] = useState({
    big_data_skills: 3.8,
    maths_stats_skills: 4.2,
    coding_skills: 4.0,
    ai_and_ml_skills: 4.5,
    dashboard_and_storytelling_skills: 3.5,
  });

  // Psychometric Big Five trait scores (0.0 to 100.0) matching SeniorSuccessInput
  const [personalityProfile, setPersonalityProfile] = useState({
    neuroticism: 35.0,
    extraversion: 50.0,
    openness_to_experience: 55.0,
    agreeableness: 50.0,
    conscientiousness: 60.0,
  });

  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

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
    setSkillProfile(prev => ({
      ...prev,
      [key]: Math.round(parseFloat(val) * 10) / 10
    }));
  };

  const handlePersonalityChange = (key, val) => {
    setPersonalityProfile(prev => ({
      ...prev,
      [key]: Math.round(parseFloat(val) * 10) / 10
    }));
  };

  const handleRunScan = async (e) => {
    if (e) e.preventDefault();
    try {
      setScanning(true);
      setScanError(null);

      // Exact backend payload format
      const payload = {
        target_role: targetRole,
        location: location,
        skill_profile: {
          big_data_skills: Number(skillProfile.big_data_skills),
          maths_stats_skills: Number(skillProfile.maths_stats_skills),
          coding_skills: Number(skillProfile.coding_skills),
          ai_and_ml_skills: Number(skillProfile.ai_and_ml_skills),
          dashboard_and_storytelling_skills: Number(skillProfile.dashboard_and_storytelling_skills)
        },
        personality_profile: {
          neuroticism: Number(personalityProfile.neuroticism),
          extraversion: Number(personalityProfile.extraversion),
          openness_to_experience: Number(personalityProfile.openness_to_experience),
          agreeableness: Number(personalityProfile.agreeableness),
          conscientiousness: Number(personalityProfile.conscientiousness)
        }
      };

      const data = await runCareerScan(payload);
      setScanResult(data);
      setScanning(false);
    } catch (err) {
      setScanError({
        message: err.message || 'Error processing career scan synthesis.',
        status: err.status ?? (err.isNetworkError ? 0 : 500),
        endpoint: err.endpoint || '/api/career-scan'
      });
      setScanning(false);
    }
  };

  // Only display probability if backend explicitly returns a validated numeric probability
  const careerProb = scanResult?.career_model?.probability_high;
  const seniorProb = scanResult?.senior_model?.probability_high;
  const hasCareerProbability = typeof careerProb === 'number' && !isNaN(careerProb);
  const hasSeniorProbability = typeof seniorProb === 'number' && !isNaN(seniorProb);

  return (
    <section id="career-scan" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              05 / CAREER SCAN — MULTI-LAYER EVIDENCE SYNTHESIS
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              CAREER SCAN
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Synthesizes real market demand (Analytics Jobs), junior predictive models (JDS), and senior psychometric models (SDS). Strictly derived from empirical datasets without speculative future forecasts or fabricated match scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-[#171717] text-[#F4F1EA] uppercase font-bold tracking-wider">
              BACKEND-DERIVED SIGNAL
            </span>
            <span className="px-2.5 py-1 border border-[#D8D2C4] text-[#171717] uppercase">
              EMPIRICAL DATASET
            </span>
          </div>
        </div>

        {/* Input Parameters Terminal */}
        <div className="border border-[#D8D2C4] bg-white p-6 sm:p-8 mb-8">
          <form onSubmit={handleRunScan} className="space-y-8">
            
            {/* Target Role & Location Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-[#171717] font-bold uppercase mb-2">
                  TARGET DESIGNATION / DISCIPLINE
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#F4F1EA] border border-[#D8D2C4] hover:border-[#171717] text-[#171717] px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:border-[#FF4D2E] cursor-pointer"
                >
                  {roleOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="font-mono text-[10px] text-[#66645F] mt-1.5 uppercase">
                  FILTER: ANALYTICS JOBS CORPUS
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#171717] font-bold uppercase mb-2">
                  TARGET METROPOLITAN CLUSTER (LOCATION)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#F4F1EA] border border-[#D8D2C4] hover:border-[#171717] text-[#171717] px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:border-[#FF4D2E] cursor-pointer"
                >
                  {locationOptions.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <div className="font-mono text-[10px] text-[#66645F] mt-1.5 uppercase">
                  REGIONAL MARKET BOUNDARY
                </div>
              </div>
            </div>

            {/* Technical Skill Profile Inputs (1.0 to 5.0) */}
            <div className="pt-4 border-t border-[#D8D2C4] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-[#171717] uppercase">
                  1. TECHNICAL PROFICIENCY RATINGS (JDS COHORT // 1.0 TO 5.0 SCALE)
                </span>
                <span className="text-[#66645F] text-[11px]">FEEDS JDS CAREER SUCCESS MODEL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { key: 'big_data_skills', label: 'Big Data' },
                  { key: 'maths_stats_skills', label: 'Maths & Stats' },
                  { key: 'coding_skills', label: 'Coding' },
                  { key: 'ai_and_ml_skills', label: 'AI & ML' },
                  { key: 'dashboard_and_storytelling_skills', label: 'Storytelling' }
                ].map(({ key, label }) => (
                  <div key={key} className="p-3 bg-[#F4F1EA]/50 border border-[#D8D2C4] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#66645F] uppercase font-bold">{label}</span>
                      <span className="text-[#FF4D2E] font-bold">{skillProfile[key].toFixed(1)} / 5.0</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={skillProfile[key]}
                      onChange={(e) => handleSkillChange(key, e.target.value)}
                      className="w-full accent-[#FF4D2E] bg-[#D8D2C4] h-1.5 cursor-pointer appearance-none"
                      aria-label={`Calibrate ${label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Psychometric Big Five Inputs (0.0 to 100.0) */}
            <div className="pt-4 border-t border-[#D8D2C4] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-[#171717] uppercase">
                  2. PSYCHOMETRIC BIG FIVE TRAITS (SDS COHORT // 0.0 TO 100.0 SCALE)
                </span>
                <span className="text-[#66645F] text-[11px]">FEEDS SDS SENIOR SUCCESS MODEL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { key: 'neuroticism', label: 'Neuroticism' },
                  { key: 'extraversion', label: 'Extraversion' },
                  { key: 'openness_to_experience', label: 'Openness' },
                  { key: 'agreeableness', label: 'Agreeableness' },
                  { key: 'conscientiousness', label: 'Conscientiousness' }
                ].map(({ key, label }) => (
                  <div key={key} className="p-3 bg-[#F4F1EA]/50 border border-[#D8D2C4] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#66645F] uppercase font-bold">{label}</span>
                      <span className="text-[#171717] font-bold">{personalityProfile[key].toFixed(0)} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="100.0"
                      step="1.0"
                      value={personalityProfile[key]}
                      onChange={(e) => handlePersonalityChange(key, e.target.value)}
                      className="w-full accent-[#171717] bg-[#D8D2C4] h-1.5 cursor-pointer appearance-none"
                      aria-label={`Calibrate ${label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#D8D2C4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="font-mono text-xs text-[#66645F]">
                <span>EVALUATION TARGET: </span>
                <strong className="text-[#171717]">{targetRole}</strong> in <strong className="text-[#171717]">{location}</strong>
              </div>

              <button
                type="submit"
                disabled={scanning}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#FF4D2E] hover:bg-[#E53E20] text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {scanning ? 'SYNTHESIZING TELEMETRY...' : 'EXECUTE CAREER SCAN'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Scan Status Feedback */}
        {scanning && <SignalLoading message="SYNTHESIZING MULTI-LAYER CAREER DOSSIER..." />}
        {scanError && (
          <div className="mb-8">
            <SignalError
              endpoint={typeof scanError === 'object' ? scanError.endpoint : '/api/career-scan'}
              status={typeof scanError === 'object' ? scanError.status : null}
              message={typeof scanError === 'object' ? scanError.message : scanError}
              onRetry={handleRunScan}
            />
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && !scanning && (
          <div className="border border-[#171717] bg-[#F4F1EA] divide-y divide-[#D8D2C4] space-y-0">
            
            {/* Header Telemetry Banner */}
            <div className="p-6 bg-[#171717] text-[#F4F1EA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#FF4D2E] uppercase font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BACKEND-DERIVED SIGNAL // EMPIRICAL DATASET</span>
                </div>
                <div className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
                  {targetRole} // {location}
                </div>
              </div>

              <div className="font-mono text-xs text-[#8E8B83] text-right">
                <div>CORPUS: ANALYTICS JOBS (15,841 POSTINGS)</div>
                <div>MODELS: JDS (n=139) & SDS (n=161)</div>
              </div>
            </div>

            {/* Evidence Layer 1: Market Demand Evidence */}
            {scanResult.market_evidence && scanResult.market_evidence.length > 0 && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#FF4D2E]" />
                    <span>LAYER 1: OBSERVED MARKET DEMAND EVIDENCE (ANALYTICS JOBS.CSV)</span>
                  </div>
                  <span className="text-[#66645F] text-[11px] font-normal">
                    EMPIRICAL MARKET DATASET
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.market_evidence.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-[#D8D2C4] font-mono text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#171717] uppercase">{item.title}</span>
                        <span className="text-[#FF4D2E] font-black">{item.prevalence_pct}%</span>
                      </div>
                      <p className="text-[#66645F] text-[11px] font-sans leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="text-[10px] text-[#8E8B83] pt-1 border-t border-[#E5DFD3] flex justify-between">
                        <span>VOLUME: {item.posting_count.toLocaleString()} POSTINGS</span>
                        <span>SAMPLE: N={item.sample_size || 15841}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Layers 2 & 3: Supervised Machine Learning Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D8D2C4]">
              
              {/* Junior Career Model (JDS) */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span>LAYER 2: JDS CAREER SUCCESS MODEL</span>
                  <span className="text-[#FF4D2E]">{scanResult.career_model?.model}</span>
                </div>

                <div className="p-4 bg-white border border-[#D8D2C4] space-y-2">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-[#66645F] uppercase">PREDICTED SALARY-HIKE CLASS:</span>
                    <span className="text-2xl font-black text-[#171717] uppercase">
                      {scanResult.career_model?.predicted_label}
                    </span>
                  </div>

                  {hasCareerProbability && (
                    <div className="flex justify-between text-xs font-mono border-t border-[#E5DFD3] pt-2">
                      <span className="text-[#66645F]">VALIDATED HIGH-HIKE PROBABILITY:</span>
                      <strong className="text-[#FF4D2E]">
                        {(careerProb * 100).toFixed(1)}%
                      </strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#66645F] font-mono leading-relaxed">
                  {scanResult.career_model?.interpretation}
                </p>

                {/* Evidence traits */}
                {scanResult.career_model?.evidence && scanResult.career_model.evidence.length > 0 && (
                  <div className="space-y-1.5 pt-2 font-mono text-[11px]">
                    <div className="text-[#8E8B83] text-[10px] uppercase font-bold">
                      TOP MODEL-ASSOCIATED SKILL TRAITS:
                    </div>
                    {scanResult.career_model.evidence.slice(0, 3).map((ev) => (
                      <div key={ev.feature} className="flex justify-between py-1 border-b border-[#D8D2C4]/60">
                        <span className="text-[#171717] font-semibold">{ev.display_name}</span>
                        <span className="text-[#66645F]">
                          {ev.impact_direction.toUpperCase()} ({ev.log_odds_contribution > 0 ? `+${ev.log_odds_contribution.toFixed(2)}` : ev.log_odds_contribution.toFixed(2)} log-odds)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Senior Success Model (SDS) */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span>LAYER 3: SDS SENIOR SUCCESS MODEL</span>
                  <span className="text-[#FF4D2E]">{scanResult.senior_model?.model}</span>
                </div>

                <div className="p-4 bg-white border border-[#D8D2C4] space-y-2">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-[#66645F] uppercase">PREDICTED SUCCESS CLASS:</span>
                    <span className="text-2xl font-black text-[#171717] uppercase">
                      {scanResult.senior_model?.predicted_label}
                    </span>
                  </div>

                  {hasSeniorProbability && (
                    <div className="flex justify-between text-xs font-mono border-t border-[#E5DFD3] pt-2">
                      <span className="text-[#66645F]">VALIDATED HIGH-SUCCESS PROBABILITY:</span>
                      <strong className="text-[#FF4D2E]">
                        {(seniorProb * 100).toFixed(1)}%
                      </strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#66645F] font-mono leading-relaxed">
                  {scanResult.senior_model?.interpretation}
                </p>

                {/* Evidence traits */}
                {scanResult.senior_model?.evidence && scanResult.senior_model.evidence.length > 0 && (
                  <div className="space-y-1.5 pt-2 font-mono text-[11px]">
                    <div className="text-[#8E8B83] text-[10px] uppercase font-bold">
                      TOP BIG FIVE PSYCHOMETRIC INFLUENCES:
                    </div>
                    {scanResult.senior_model.evidence.slice(0, 3).map((ev) => (
                      <div key={ev.feature} className="flex justify-between py-1 border-b border-[#D8D2C4]/60">
                        <span className="text-[#171717] font-semibold">{ev.display_name}</span>
                        <span className="text-[#66645F]">
                          {ev.impact_direction.toUpperCase()} ({ev.z_score !== undefined ? (ev.z_score > 0 ? `+${ev.z_score.toFixed(2)}z` : `${ev.z_score.toFixed(2)}z`) : `${(ev.importance * 100).toFixed(1)}%`})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Priority Skills Breakdown */}
            {scanResult.priority_skills && scanResult.priority_skills.length > 0 && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FF4D2E]" />
                    <span>RELEVANT SKILLS IN CORPUS (MARKET DEMAND × MODEL LEVERAGE)</span>
                  </div>
                  <span className="text-[#66645F] text-[11px] font-normal">
                    BACKEND-DERIVED SIGNAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanResult.priority_skills.map((ps) => (
                    <div key={ps.canonical_name} className="p-4 bg-white border border-[#D8D2C4] font-mono text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[#171717] text-sm uppercase">{ps.skill_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#F4F1EA] border border-[#D8D2C4] text-[#FF4D2E] font-bold">
                          {ps.priority_tier}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#66645F]">
                        <span>Market Prevalence:</span>
                        <strong className="text-[#171717]">{ps.market_prevalence_pct}% ({ps.market_posting_count} postings)</strong>
                      </div>
                      <div className="text-[11px] text-[#66645F] font-sans pt-1 leading-snug">
                        {ps.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence-Derived Recommendations */}
            {scanResult.recommendations && scanResult.recommendations.length > 0 && (
              <div className="p-6 sm:p-8 space-y-4 bg-white">
                <div className="text-xs font-mono font-bold text-[#171717] uppercase border-b border-[#D8D2C4] pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF4D2E]" />
                    <span>EVIDENCE-DERIVED RECOMMENDATIONS</span>
                  </div>
                  <span className="text-[#66645F] text-[11px] font-normal">
                    BACKEND-DERIVED SIGNAL
                  </span>
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
                      <div className="text-[10px] text-[#66645F] pt-1 flex justify-between">
                        <span><strong>Evidence:</strong> {rec.evidence} (N={rec.sample_size})</span>
                        <span className="text-[#171717] font-semibold">{rec.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodological Caveats */}
            {scanResult.caveats && scanResult.caveats.length > 0 && (
              <div className="p-6 bg-[#ECE7DE]/50 space-y-2 text-xs font-mono text-[#66645F]">
                <div className="text-[#171717] font-bold uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF4D2E]" />
                  <span>METHODOLOGICAL CAVEATS & DATASET BOUNDARIES</span>
                </div>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  {scanResult.caveats.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
