import React, { useState, useEffect } from 'react';
import { getJuniorModel, predictJuniorSuccess } from '../api/career';
import { SignalLoading, SignalError } from './common/SignalState';
import { Cpu, RotateCcw, AlertTriangle, Layers, Activity } from 'lucide-react';

// Canonical fallback feature definitions matching backend JDS dataset
const FALLBACK_DIMENSIONS = [
  {
    feature: 'maths_stats_skills',
    canonicalKey: 'maths_stats_skills',
    displayName: 'Mathematics & Statistics',
    importance: 1.2187,
    rank: 1,
    defaultScore: 4.3,
    description: 'Statistical theory, probability distributions, hypothesis testing, quantitative reasoning'
  },
  {
    feature: 'dashboard_and_storytelling_skills',
    canonicalKey: 'dashboard_and_storytelling_skills',
    displayName: 'Dashboard & Storytelling',
    importance: 0.7983,
    rank: 2,
    defaultScore: 4.4,
    description: 'Executive reporting, visual analytics, BI tools, narrative articulation of findings'
  },
  {
    feature: 'ai_and_ml_skills',
    canonicalKey: 'ai_and_ml_skills',
    displayName: 'AI & Machine Learning',
    importance: 0.6935,
    rank: 3,
    defaultScore: 4.6,
    description: 'Supervised/unsupervised algorithms, evaluation metrics, pipeline engineering, feature design'
  },
  {
    feature: 'big_data_skills',
    canonicalKey: 'big_data_skills',
    displayName: 'Big Data Skills',
    importance: 0.6504,
    rank: 4,
    defaultScore: 3.8,
    description: 'Distributed processing (Spark/Hadoop/Hive), large-scale query optimization, data lake systems'
  },
  {
    feature: 'coding_skills',
    canonicalKey: 'coding_skills',
    displayName: 'Coding Skills',
    importance: 0.4827,
    rank: 5,
    defaultScore: 4.3,
    description: 'Production programming (Python/R/SQL), data structures, reproducibility, version control'
  }
];

// Helper to normalize feature key to Pydantic field name
function normalizeFeatureKey(name) {
  if (!name) return '';
  const s = String(name).toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (s.includes('math')) return 'maths_stats_skills';
  if (s.includes('dashboard') || s.includes('story')) return 'dashboard_and_storytelling_skills';
  if (s.includes('ai') || s.includes('ml') || s.includes('machine')) return 'ai_and_ml_skills';
  if (s.includes('big') || s.includes('data_skills')) return 'big_data_skills';
  if (s.includes('coding') || s.includes('programming')) return 'coding_skills';
  return s;
}

export default function JuniorSuccess() {
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState(null);

  // Five numeric dimensions (1.0 to 5.0)
  const [scores, setScores] = useState({
    big_data_skills: 3.8,
    maths_stats_skills: 4.3,
    coding_skills: 4.3,
    ai_and_ml_skills: 4.6,
    dashboard_and_storytelling_skills: 4.4
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState(null);

  // Load model metadata dynamically from GET /api/career-success/model
  useEffect(() => {
    let isMounted = true;
    async function fetchModel() {
      try {
        setLoadingModel(true);
        setModelError(null);
        const data = await getJuniorModel();
        if (isMounted) {
          setModel(data);
          // If metadata provides benchmark training means or defaults, use them
          if (data?.rawMetadata?.feature_importance) {
            setScores(prev => {
              const updated = { ...prev };
              data.rawMetadata.feature_importance.forEach(item => {
                const key = normalizeFeatureKey(item.feature);
                if (item.training_mean && typeof item.training_mean === 'number') {
                  updated[key] = Math.round(item.training_mean * 10) / 10;
                }
              });
              return updated;
            });
          }
          setLoadingModel(false);
        }
      } catch (err) {
        if (isMounted) {
          setModelError({
            message: err.message || 'Failed to load junior predictive model telemetry.',
            status: err.status ?? (err.isNetworkError ? 0 : 500),
            endpoint: err.endpoint || '/api/career-success/model'
          });
          setLoadingModel(false);
        }
      }
    }
    fetchModel();
    return () => { isMounted = false; };
  }, []);

  // Run prediction against POST /api/career-success/predict when scores change
  useEffect(() => {
    if (!model) return;
    let isMounted = true;
    async function runEval() {
      try {
        setPredicting(true);
        setPredictError(null);
        // Payload sends exact five numeric dimensions (1.0 - 5.0)
        const payload = {
          big_data_skills: Number(scores.big_data_skills),
          maths_stats_skills: Number(scores.maths_stats_skills),
          coding_skills: Number(scores.coding_skills),
          ai_and_ml_skills: Number(scores.ai_and_ml_skills),
          dashboard_and_storytelling_skills: Number(scores.dashboard_and_storytelling_skills)
        };
        const result = await predictJuniorSuccess(payload);
        if (isMounted) {
          setPrediction(result);
          setPredicting(false);
        }
      } catch (err) {
        if (isMounted) {
          setPredictError({
            message: err.message || 'Model prediction query failed.',
            status: err.status ?? (err.isNetworkError ? 0 : 500),
            endpoint: err.endpoint || '/api/career-success/predict'
          });
          setPredicting(false);
        }
      }
    }

    const timer = setTimeout(runEval, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scores, model]);

  const handleScoreChange = (canonicalKey, value) => {
    const num = Math.min(5.0, Math.max(1.0, parseFloat(value) || 1.0));
    setScores(prev => ({
      ...prev,
      [canonicalKey]: Math.round(num * 10) / 10
    }));
  };

  const handleResetBenchmarks = () => {
    setScores({
      big_data_skills: 3.8,
      maths_stats_skills: 4.3,
      coding_skills: 4.3,
      ai_and_ml_skills: 4.6,
      dashboard_and_storytelling_skills: 4.4
    });
  };

  if (loadingModel) {
    return (
      <section id="career-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalLoading message="LOADING CAREER SUCCESS MODEL METADATA..." />
        </div>
      </section>
    );
  }

  if (modelError && !model) {
    return (
      <section id="career-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalError
            endpoint={typeof modelError === 'object' ? modelError.endpoint : '/api/career-success/model'}
            status={typeof modelError === 'object' ? modelError.status : null}
            message={typeof modelError === 'object' ? modelError.message : modelError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    );
  }

  // Derive dynamic dimensions from model metadata if present, else fallback
  const featureMetadataList = model?.rawMetadata?.feature_importance || [];
  const displayDimensions = FALLBACK_DIMENSIONS.map(dim => {
    const metaMatch = featureMetadataList.find(f => normalizeFeatureKey(f.feature) === dim.canonicalKey);
    return {
      ...dim,
      displayName: metaMatch?.display_name || dim.displayName,
      importance: metaMatch?.importance ?? metaMatch?.coefficient ?? dim.importance,
      coefficient: metaMatch?.coefficient,
      oddsRatio: metaMatch?.odds_ratio,
      rank: metaMatch?.rank ?? dim.rank
    };
  });

  const targetName = model?.target || 'salary_hike_high_or_low';
  const modelName = model?.modelName || model?.rawMetadata?.selected_model_name || 'LogisticRegression';
  const rawMeta = model?.rawMetadata || {};

  // Prediction outputs
  const predictedClassLabel = prediction?.predicted_label
    ? prediction.predicted_label.toUpperCase()
    : prediction?.predictedSalaryHikeClass
      ? prediction.predictedSalaryHikeClass.toUpperCase()
      : null;

  const probabilityHigh = typeof prediction?.probability_high === 'number'
    ? prediction.probability_high
    : (typeof prediction?.highSalaryHikeProbability === 'number' ? prediction.highSalaryHikeProbability : null);

  const probabilityLow = typeof prediction?.probability_low === 'number'
    ? prediction.probability_low
    : (probabilityHigh !== null ? (1 - probabilityHigh) : null);

  const evidenceList = prediction?.evidence || [];
  const interpretationText = prediction?.summary || prediction?.interpretation || '';
  const caveatsText = prediction?.caveats || '';

  return (
    <section id="career-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              03 / CAREER SUCCESS — TECHNICAL PREDICTIVE MODEL
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              CAREER SUCCESS
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Model-associated signal derived from empirical workforce outcomes in the JDS Skill Traits dataset. Non-causal statistical classification across five technical feature dimensions.
            </p>
          </div>

          {/* Model Specification Meta Pill */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-[#171717] text-[#F4F1EA] uppercase font-bold tracking-wider">
              TARGET: {targetName}
            </span>
            {model?.metric && (
              <span className="px-2.5 py-1 border border-[#D8D2C4] text-[#171717] uppercase">
                {model.metric}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Model Architecture Banner */}
        <div className="border border-[#D8D2C4] bg-white p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#171717] text-white flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#FF4D2E]" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#171717] uppercase">
                MODEL: {modelName} {rawMeta.model_type ? `(${rawMeta.model_type})` : ''}
              </div>
              <div className="text-xs text-[#66645F] mt-0.5">
                Evaluates five continuous technical trait proficiencies (1.0–5.0 scale). Observational workforce correlation.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#66645F]">
            <div>CORPUS: <span className="font-bold text-[#171717]">{rawMeta.training_dataset_name || 'JDS Skill Traits.xlsx'}</span></div>
            <div>•</div>
            <div>STATUS: <span className="font-bold text-[#FF4D2E]">BACKEND VERIFIED</span></div>
          </div>
        </div>

        {/* Two-Column Grid: Left Feature Sliders, Right Prediction Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Five Technical Feature Sliders */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-5">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#171717] uppercase">
                    TECHNICAL FEATURE DIMENSIONS (1.0 – 5.0)
                  </h3>
                  <p className="text-xs font-mono text-[#66645F] mt-1">
                    Calibrate proficiency ratings for the five model input variables
                  </p>
                </div>
                <button
                  onClick={handleResetBenchmarks}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] uppercase cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  RESET SAMPLE BENCHMARKS
                </button>
              </div>

              {/* Five Dimensions */}
              <div className="space-y-5">
                {displayDimensions.map(dim => {
                  const currentVal = scores[dim.canonicalKey] ?? dim.defaultScore;

                  return (
                    <div key={dim.canonicalKey} className="border border-[#D8D2C4] bg-[#F4F1EA]/40 p-4 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-[#171717] uppercase">
                            {dim.displayName}
                          </span>
                          <span className="font-mono text-[10px] text-[#66645F]">
                            COEFFICIENT: {dim.coefficient !== undefined ? (dim.coefficient > 0 ? `+${dim.coefficient}` : dim.coefficient) : `${dim.importance.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[#FF4D2E] bg-white px-2.5 py-0.5 border border-[#D8D2C4]">
                          {currentVal.toFixed(1)} / 5.0
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(dim.canonicalKey, e.target.value)}
                        className="w-full accent-[#FF4D2E] bg-[#D8D2C4] h-1.5 cursor-pointer appearance-none"
                        aria-label={`Calibrate ${dim.displayName}`}
                      />

                      <div className="flex justify-between items-center text-[10px] font-mono text-[#66645F] mt-2">
                        <span>1.0 (FOUNDATIONAL)</span>
                        <span className="text-[10px] text-[#8E8B83] hidden sm:inline">
                          {dim.description}
                        </span>
                        <span>5.0 (ADVANCED)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature Importance Table */}
              <div className="mt-6 pt-4 border-t border-[#D8D2C4]">
                <div className="font-mono text-xs font-bold text-[#171717] uppercase mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF4D2E]" />
                  <span>MODEL FEATURE IMPORTANCE & ODDS RATIOS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#D8D2C4] text-[10px] text-[#66645F] uppercase">
                        <th className="py-1.5 pr-2">Rank</th>
                        <th className="py-1.5 px-2">Dimension</th>
                        <th className="py-1.5 px-2 text-right">Coefficient</th>
                        <th className="py-1.5 pl-2 text-right">Odds Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {displayDimensions.map(d => (
                        <tr key={d.canonicalKey} className="text-[11px]">
                          <td className="py-1.5 pr-2 font-bold text-[#66645F]">#{d.rank}</td>
                          <td className="py-1.5 px-2 text-[#171717] font-semibold">{d.displayName}</td>
                          <td className="py-1.5 px-2 text-right text-[#171717]">{d.coefficient !== undefined ? `+${d.coefficient}` : d.importance.toFixed(2)}</td>
                          <td className="py-1.5 pl-2 text-right text-[#FF4D2E] font-bold">{d.oddsRatio ? `${d.oddsRatio}x` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata Endpoint Note */}
              <div className="mt-4 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex items-center justify-between">
                <span>DYNAMIC ENDPOINT: GET /api/career-success/model</span>
                <span>DATASET SIZE: {rawMeta.dataset_size ? `${rawMeta.dataset_size} roles` : '139 roles'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Outcomes & Evidence Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Classification Result Card */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>MODEL EVALUATION OUTPUT</span>
                {predicting && <span className="text-[#FF4D2E] animate-pulse">EVALUATING...</span>}
              </div>

              {predictError ? (
                <SignalError
                  endpoint={typeof predictError === 'object' ? predictError.endpoint : '/api/career-success/predict'}
                  status={typeof predictError === 'object' ? predictError.status : null}
                  message={typeof predictError === 'object' ? predictError.message : predictError}
                />
              ) : (
                <>
                  <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                    <div className="text-xs font-mono uppercase text-[#66645F] mb-1">
                      PREDICTED SALARY-HIKE CLASS:
                    </div>
                    <div className="flex items-baseline gap-3">
                      <div className={`font-sans font-black text-4xl sm:text-5xl uppercase tracking-tight ${
                        predictedClassLabel === 'HIGH' ? 'text-[#FF4D2E]' : 'text-[#171717]'
                      }`}>
                        {predictedClassLabel || '—'}
                      </div>
                      <div className="font-mono text-xs text-[#66645F] uppercase">
                        ASSOCIATION SIGNAL
                      </div>
                    </div>
                  </div>

                  {/* Validated Probabilities from Backend */}
                  {probabilityHigh !== null && (
                    <div className="border-t border-[#D8D2C4] pt-4 mb-6 space-y-3">
                      <div>
                        <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                          <span className="text-[#66645F] uppercase">
                            HIGH SALARY-HIKE PROBABILITY:
                          </span>
                          <span className="font-bold text-[#FF4D2E]">
                            {(probabilityHigh * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#E5DFD3] overflow-hidden">
                          <div
                            className="h-full bg-[#FF4D2E] transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, probabilityHigh * 100))}%` }}
                          />
                        </div>
                      </div>

                      {probabilityLow !== null && (
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                            <span className="text-[#66645F] uppercase">
                              LOW SALARY-HIKE PROBABILITY:
                            </span>
                            <span className="font-bold text-[#171717]">
                              {(probabilityLow * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5DFD3] overflow-hidden">
                            <div
                              className="h-full bg-[#171717] transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, probabilityLow * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interpretation statement directly from backend */}
                  {interpretationText && (
                    <div className="p-3.5 bg-[#F4F1EA] border border-[#D8D2C4] text-xs font-mono text-[#171717] leading-relaxed mb-6">
                      <div className="text-[10px] text-[#66645F] uppercase font-bold mb-1">
                        MODEL INTERPRETATION:
                      </div>
                      {interpretationText}
                    </div>
                  )}

                  {/* Deterministic Feature Evidence Breakdown */}
                  {evidenceList.length > 0 && (
                    <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                      <div className="font-mono text-xs font-bold text-[#171717] uppercase mb-3 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#FF4D2E]" />
                        <span>FEATURE EVIDENCE BREAKDOWN</span>
                      </div>
                      <div className="space-y-2.5">
                        {evidenceList.map(ev => {
                          const isPositive = ev.impact_direction === 'positive';
                          return (
                            <div
                              key={ev.feature}
                              className="p-3 border border-[#D8D2C4] bg-white text-xs font-mono"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#171717]">{ev.display_name}</span>
                                <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                                  isPositive
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                                }`}>
                                  {ev.impact_direction.toUpperCase()} ({ev.log_odds_contribution > 0 ? `+${ev.log_odds_contribution.toFixed(2)}` : ev.log_odds_contribution.toFixed(2)} log-odds)
                                </span>
                              </div>
                              <p className="text-[11px] text-[#66645F] leading-normal mt-1">
                                {ev.observation}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Caveats / Limitations */}
                  {caveatsText && (
                    <div className="border-l-2 border-[#171717] pl-3 py-1 font-mono text-[10px] text-[#66645F] leading-normal">
                      <strong className="text-[#171717] uppercase">METHODOLOGICAL CAVEAT:</strong>{' '}
                      {caveatsText}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Model Architecture & Holdout Metrics Card */}
            <div className="border border-[#D8D2C4] bg-white p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] uppercase mb-2">
                <AlertTriangle className="w-4 h-4 text-[#FF4D2E]" />
                <span>EVALUATION METRICS (HOLDOUT TEST SET)</span>
              </div>
              <p className="text-xs text-[#66645F] leading-relaxed mb-4">
                {rawMeta.selection_rationale || model?.description || 'Holdout performance benchmarks evaluated on unseen test partition.'}
              </p>
              
              {rawMeta.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs mb-4">
                  <div className="p-2 border border-[#D8D2C4] bg-[#F4F1EA]/50">
                    <div className="text-[10px] text-[#66645F]">BALANCED ACC</div>
                    <div className="font-bold text-[#171717]">
                      {((rawMeta.metrics.balanced_accuracy ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2 border border-[#D8D2C4] bg-[#F4F1EA]/50">
                    <div className="text-[10px] text-[#66645F]">ROC-AUC</div>
                    <div className="font-bold text-[#171717]">
                      {(rawMeta.metrics.roc_auc ?? 0).toFixed(3)}
                    </div>
                  </div>
                  <div className="p-2 border border-[#D8D2C4] bg-[#F4F1EA]/50">
                    <div className="text-[10px] text-[#66645F]">PRECISION</div>
                    <div className="font-bold text-[#171717]">
                      {((rawMeta.metrics.precision ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex justify-between">
                <span>INFERENCE: POST /api/career-success/predict</span>
                <span>METRICS: n={rawMeta.test_size || 35} holdout</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
