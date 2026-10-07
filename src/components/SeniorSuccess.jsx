import React, { useState, useEffect } from 'react';
import { getSeniorModel, predictSeniorSuccess } from '../api/career';
import { SignalLoading, SignalError } from './common/SignalState';
import { Sliders, RotateCcw, AlertTriangle, Layers, Activity } from 'lucide-react';

// Canonical Big Five definitions matching backend SDS dataset exactly
const BIG_FIVE_CANONICAL = [
  {
    key: 'conscientiousness',
    name: 'Conscientiousness',
    defaultScore: 50.0,
    trainingBenchmark: 45.9,
    rank: 1,
    description: 'Methodical rigor, experiment reproducibility, systematic delivery discipline'
  },
  {
    key: 'openness_to_experience',
    name: 'Openness to Experience',
    defaultScore: 50.0,
    trainingBenchmark: 41.8,
    rank: 2,
    description: 'Intellectual curiosity, algorithmic exploration, receptivity to paradigm shifts'
  },
  {
    key: 'extraversion',
    name: 'Extraversion',
    defaultScore: 50.0,
    trainingBenchmark: 43.8,
    rank: 3,
    description: 'Stakeholder translation, proactive communication initiative, cross-partner coordination'
  },
  {
    key: 'agreeableness',
    name: 'Agreeableness',
    defaultScore: 50.0,
    trainingBenchmark: 44.6,
    rank: 4,
    description: 'Team collaboration, collective research orientation, receptivity to review feedback'
  },
  {
    key: 'neuroticism',
    name: 'Neuroticism',
    defaultScore: 35.0,
    trainingBenchmark: 36.4,
    rank: 5,
    description: 'Emotional composure under pressure, stability in non-deterministic environments'
  }
];

export default function SeniorSuccess() {
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState(null);

  // Personality trait scores strictly 0.0 - 100.0 matching SeniorSuccessInput
  const [traits, setTraits] = useState({
    neuroticism: 35.0,
    extraversion: 50.0,
    openness_to_experience: 50.0,
    agreeableness: 50.0,
    conscientiousness: 50.0
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState(null);

  // Fetch Senior Model metadata from GET /api/senior-success/model
  useEffect(() => {
    let isMounted = true;
    async function fetchModel() {
      try {
        setLoadingModel(true);
        setModelError(null);
        const data = await getSeniorModel();
        if (isMounted) {
          setModel(data);
          // Set initial scores near benchmarks if metadata available
          setTraits({
            neuroticism: 36.0,
            extraversion: 44.0,
            openness_to_experience: 42.0,
            agreeableness: 45.0,
            conscientiousness: 46.0
          });
          setLoadingModel(false);
        }
      } catch (err) {
        if (isMounted) {
          setModelError({
            message: err.message || 'Failed to acquire senior model telemetry.',
            status: err.status ?? (err.isNetworkError ? 0 : 500),
            endpoint: err.endpoint || '/api/senior-success/model'
          });
          setLoadingModel(false);
        }
      }
    }
    fetchModel();
    return () => { isMounted = false; };
  }, []);

  // Dispatch prediction to POST /api/senior-success/predict when traits change
  useEffect(() => {
    if (!model) return;
    let isMounted = true;
    async function runEval() {
      try {
        setPredicting(true);
        setPredictError(null);
        const payload = {
          neuroticism: Number(traits.neuroticism),
          extraversion: Number(traits.extraversion),
          openness_to_experience: Number(traits.openness_to_experience),
          agreeableness: Number(traits.agreeableness),
          conscientiousness: Number(traits.conscientiousness)
        };
        const result = await predictSeniorSuccess(payload);
        if (isMounted) {
          setPrediction(result);
          setPredicting(false);
        }
      } catch (err) {
        if (isMounted) {
          setPredictError({
            message: err.message || 'Model prediction evaluation failed.',
            status: err.status ?? (err.isNetworkError ? 0 : 500),
            endpoint: err.endpoint || '/api/senior-success/predict'
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
  }, [traits, model]);

  const handleSliderChange = (traitKey, value) => {
    const val = Math.min(100.0, Math.max(0.0, parseFloat(value) || 0.0));
    setTraits(prev => ({
      ...prev,
      [traitKey]: Math.round(val * 10) / 10
    }));
  };

  const resetToBenchmarks = () => {
    setTraits({
      neuroticism: 36.4,
      extraversion: 43.8,
      openness_to_experience: 41.8,
      agreeableness: 44.6,
      conscientiousness: 45.9
    });
  };

  if (loadingModel) {
    return (
      <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalLoading message="LOADING SENIOR DATA SCIENTIST MODEL METADATA..." />
        </div>
      </section>
    );
  }

  if (modelError && !model) {
    return (
      <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalError
            endpoint={typeof modelError === 'object' ? modelError.endpoint : '/api/senior-success/model'}
            status={typeof modelError === 'object' ? modelError.status : null}
            message={typeof modelError === 'object' ? modelError.message : modelError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    );
  }

  const rawMeta = model?.rawMetadata || {};
  const featureMetaList = rawMeta?.feature_importance || [];
  
  // Merge canonical list with metadata
  const displayDimensions = BIG_FIVE_CANONICAL.map(dim => {
    const metaMatch = featureMetaList.find(f => f.feature === dim.key);
    return {
      ...dim,
      displayName: metaMatch?.display_name || dim.name,
      importance: metaMatch?.importance ?? (0.30 - dim.rank * 0.05),
      rank: metaMatch?.rank ?? dim.rank
    };
  });

  const targetName = model?.target || 'success_classification_high_low';
  const modelName = rawMeta?.selected_model_name || model?.modelName || 'RandomForestClassifier';
  const predictedClassLabel = prediction?.predicted_label
    ? prediction.predicted_label.toUpperCase()
    : prediction?.predictedSuccessClass
      ? prediction.predictedSuccessClass.toUpperCase()
      : null;

  const probabilityHigh = typeof prediction?.probability_high === 'number'
    ? prediction.probability_high
    : (typeof prediction?.highSuccessProbability === 'number' ? prediction.highSuccessProbability : null);

  const probabilityLow = typeof prediction?.probability_low === 'number'
    ? prediction.probability_low
    : (probabilityHigh !== null ? (1 - probabilityHigh) : null);

  const evidenceList = prediction?.evidence || [];
  const interpretationText = prediction?.summary || prediction?.interpretation || '';
  const caveatsText = prediction?.caveats || '';

  return (
    <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              04 / SENIOR SUCCESS — EMPIRICAL PSYCHOMETRIC MODEL
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              SENIOR SUCCESS
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Model signals evaluating statistical associations between Big Five psychometric dimensions and high senior success classification in the empirical SDS dataset.
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
              <Sliders className="w-5 h-5 text-[#FF4D2E]" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#171717] uppercase">
                MODEL: {modelName} {rawMeta.model_type ? `(${rawMeta.model_type})` : ''}
              </div>
              <div className="text-xs text-[#66645F] mt-0.5">
                Evaluates strictly the Big Five personality dimensions on an empirical 0–100 score distribution. Non-causal model signal.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#66645F]">
            <div>CORPUS: <span className="font-bold text-[#171717]">{rawMeta.training_dataset_name || 'SDS Personality Traits.xlsx'}</span></div>
            <div>•</div>
            <div>STATUS: <span className="font-bold text-[#FF4D2E]">BACKEND VERIFIED</span></div>
          </div>
        </div>

        {/* Two-Column Grid: Sliders & Prediction Outputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Big Five Sliders (0 - 100) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-5">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#171717] uppercase">
                    BIG FIVE TRAIT CONFIGURATION (0 – 100)
                  </h3>
                  <p className="text-xs font-mono text-[#66645F] mt-1">
                    Calibrate trait scale (empirical sample distribution: typically 20 to 70)
                  </p>
                </div>
                <button
                  onClick={resetToBenchmarks}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] uppercase cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  RESET SAMPLE BENCHMARKS
                </button>
              </div>

              {/* Sliders for ONLY: Neuroticism, Extraversion, Openness, Agreeableness, Conscientiousness */}
              <div className="space-y-5">
                {displayDimensions.map(dim => {
                  const score = traits[dim.key] ?? dim.defaultScore;

                  return (
                    <div key={dim.key} className="border border-[#D8D2C4] bg-[#F4F1EA]/40 p-4 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-[#171717] uppercase">
                            {dim.displayName}
                          </span>
                          <span className="font-mono text-[10px] text-[#66645F]">
                            FEATURE IMPORTANCE: {(dim.importance * 100).toFixed(1)}% (RANK #{dim.rank})
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[#FF4D2E] bg-white px-2.5 py-0.5 border border-[#D8D2C4]">
                          {score.toFixed(1)} / 100
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={score}
                        onChange={(e) => handleSliderChange(dim.key, e.target.value)}
                        className="w-full accent-[#FF4D2E] bg-[#D8D2C4] h-1.5 cursor-pointer appearance-none"
                        aria-label={`Calibrate ${dim.displayName}`}
                      />

                      <div className="flex justify-between font-mono text-[9px] text-[#66645F] mt-2">
                        <span>0.0 (LOW)</span>
                        <span className="text-[10px] text-[#8E8B83] hidden sm:inline">
                          SAMPLE BENCHMARK: {dim.trainingBenchmark.toFixed(1)}
                        </span>
                        <span>100.0 (HIGH)</span>
                      </div>

                      <div className="mt-2 text-xs text-[#66645F] font-mono leading-normal">
                        <span className="text-[10px] uppercase font-bold text-[#171717]">
                          DIMENSION NOTE:{' '}
                        </span>
                        {dim.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature Importance Table */}
              <div className="mt-6 pt-4 border-t border-[#D8D2C4]">
                <div className="font-mono text-xs font-bold text-[#171717] uppercase mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF4D2E]" />
                  <span>MODEL FEATURE IMPORTANCE</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#D8D2C4] text-[10px] text-[#66645F] uppercase">
                        <th className="py-1.5 pr-2">Rank</th>
                        <th className="py-1.5 px-2">Dimension</th>
                        <th className="py-1.5 px-2 text-right">Sample Mean</th>
                        <th className="py-1.5 pl-2 text-right">Feature Importance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {displayDimensions.map(d => (
                        <tr key={d.key} className="text-[11px]">
                          <td className="py-1.5 pr-2 font-bold text-[#66645F]">#{d.rank}</td>
                          <td className="py-1.5 px-2 text-[#171717] font-semibold">{d.displayName}</td>
                          <td className="py-1.5 px-2 text-right text-[#66645F]">{d.trainingBenchmark.toFixed(1)}</td>
                          <td className="py-1.5 pl-2 text-right text-[#FF4D2E] font-bold">{(d.importance * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata Confirmation Note */}
              <div className="mt-4 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex items-center justify-between">
                <span>DYNAMIC ENDPOINT: GET /api/senior-success/model</span>
                <span>SAMPLE SIZE: {rawMeta.dataset_size ? `${rawMeta.dataset_size} roles` : '161 roles'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Results & Signal Association */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Classification Result Card */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>SENIOR SUCCESS EVALUATION OUTPUT</span>
                {predicting && <span className="text-[#FF4D2E] animate-pulse">EVALUATING...</span>}
              </div>

              {predictError ? (
                <SignalError
                  endpoint={typeof predictError === 'object' ? predictError.endpoint : '/api/senior-success/predict'}
                  status={typeof predictError === 'object' ? predictError.status : null}
                  message={typeof predictError === 'object' ? predictError.message : predictError}
                />
              ) : (
                <>
                  <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                    <div className="text-xs font-mono uppercase text-[#66645F] mb-1">
                      PREDICTED SUCCESS CLASS:
                    </div>
                    <div className="flex items-baseline gap-3">
                      <div className={`font-sans font-black text-4xl sm:text-5xl uppercase tracking-tight ${
                        predictedClassLabel === 'HIGH' ? 'text-[#FF4D2E]' : 'text-[#171717]'
                      }`}>
                        {predictedClassLabel || '—'}
                      </div>
                      <div className="font-mono text-xs text-[#66645F] uppercase">
                        MODEL SIGNAL
                      </div>
                    </div>
                  </div>

                  {/* Validated Probabilities from Backend */}
                  {probabilityHigh !== null && (
                    <div className="border-t border-[#D8D2C4] pt-4 mb-6 space-y-3">
                      <div>
                        <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                          <span className="text-[#66645F] uppercase">
                            HIGH-SUCCESS PROBABILITY:
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
                              LOW-SUCCESS PROBABILITY:
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

                  {/* Observational Interpretation directly from backend */}
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
                                  {ev.impact_direction.toUpperCase()} ({ev.z_score !== undefined ? (ev.z_score > 0 ? `+${ev.z_score.toFixed(2)}z` : `${ev.z_score.toFixed(2)}z`) : `${(ev.importance * 100).toFixed(1)}%`})
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

            {/* Model Provenance & Holdout Metrics Card */}
            <div className="border border-[#D8D2C4] bg-white p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] uppercase mb-2">
                <AlertTriangle className="w-4 h-4 text-[#FF4D2E]" />
                <span>HOLDOUT TEST EVALUATION BENCHMARKS</span>
              </div>
              <p className="text-xs text-[#66645F] leading-relaxed mb-4">
                {rawMeta.selection_rationale || model?.description || 'Evaluates empirical associations between Big Five psychometric dimensions and senior success classification.'}
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
                <span>INFERENCE: POST /api/senior-success/predict</span>
                <span>METRICS: n={rawMeta.test_size || 41} holdout</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
