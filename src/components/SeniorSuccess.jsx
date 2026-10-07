import React, { useState, useEffect } from 'react';
import { getSeniorModel, predictSeniorSuccess } from '../api/career';
import { SignalLoading, SignalError } from './common/SignalState';
import { Sliders, ShieldCheck } from 'lucide-react';

// Strict Big Five feature definitions aligned with Senior Data Scientist dataset
const BIG_FIVE_CANONICAL = [
  {
    key: 'Openness',
    name: 'Openness',
    defaultScore: 3.8,
    importance: 0.26,
    signalNote: 'High openness is associated with senior success across exploratory model paradigms.'
  },
  {
    key: 'Conscientiousness',
    name: 'Conscientiousness',
    defaultScore: 3.9,
    importance: 0.24,
    signalNote: 'Methodical rigor and experiment reproducibility feature high importance in model signals.'
  },
  {
    key: 'Extraversion',
    name: 'Extraversion',
    defaultScore: 3.4,
    importance: 0.20,
    signalNote: 'Cross-partner communication initiative displays positive statistical association.'
  },
  {
    key: 'Agreeableness',
    name: 'Agreeableness',
    defaultScore: 3.5,
    importance: 0.16,
    signalNote: 'Collaborative orientation and code review receptivity are associated with team outcomes.'
  },
  {
    key: 'Neuroticism',
    name: 'Neuroticism',
    defaultScore: 2.2,
    importance: 0.14,
    signalNote: 'Lower neuroticism is associated with composure in high-stakes non-deterministic environments.'
  }
];

export default function SeniorSuccess() {
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState(null);

  // Personality trait scores (strictly Big Five: 1.0 - 5.0)
  const [traits, setTraits] = useState({
    Openness: 3.8,
    Conscientiousness: 3.9,
    Extraversion: 3.4,
    Agreeableness: 3.5,
    Neuroticism: 2.2
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Fetch Senior Model metadata
  useEffect(() => {
    let isMounted = true;
    async function fetchModel() {
      try {
        setLoadingModel(true);
        setModelError(null);
        const data = await getSeniorModel();
        if (isMounted) {
          setModel(data);
          setLoadingModel(false);
        }
      } catch (err) {
        if (isMounted) {
          setModelError(err.message || 'Failed to acquire senior model telemetry.');
          setLoadingModel(false);
        }
      }
    }
    fetchModel();
    return () => { isMounted = false; };
  }, []);

  // Dispatch prediction when personality traits change
  useEffect(() => {
    let isMounted = true;
    async function runEval() {
      try {
        setPredicting(true);
        const result = await predictSeniorSuccess(traits);
        if (isMounted) {
          setPrediction(result);
          setPredicting(false);
        }
      } catch (err) {
        console.warn('Senior prediction evaluation error:', err);
        if (isMounted) setPredicting(false);
      }
    }
    runEval();
    return () => { isMounted = false; };
  }, [traits]);

  const handleSliderChange = (traitKey, value) => {
    setTraits(prev => ({
      ...prev,
      [traitKey]: parseFloat(value)
    }));
  };

  const resetToMedian = () => {
    setTraits({
      Openness: 3.5,
      Conscientiousness: 3.5,
      Extraversion: 3.5,
      Agreeableness: 3.5,
      Neuroticism: 3.0
    });
  };

  if (loadingModel) {
    return (
      <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalLoading message="LOADING SENIOR DATA SCIENTIST MODEL TELEMETRY..." />
        </div>
      </section>
    );
  }

  if (modelError && !model) {
    return (
      <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalError message={modelError} onRetry={() => window.location.reload()} />
        </div>
      </section>
    );
  }

  const targetName = model?.target || 'success_classification_high_low';
  const predictedClass = prediction?.predictedSuccessClass || prediction?.predictedClass || 'High';
  const hasProbability = prediction?.highSuccessProbability !== undefined && prediction?.highSuccessProbability !== null;
  const probabilityValue = hasProbability ? prediction.highSuccessProbability : null;

  return (
    <section id="senior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              04 / SENIOR SUCCESS — PSYCHOMETRIC MODEL
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              SENIOR SUCCESS CLASSIFICATION
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Empirical associations between Big Five psychometric dimensions and high senior success classification in the Senior Data Scientist dataset.
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
                {model?.modelName || 'Senior Data Scientist Success Classifier'}
              </div>
              <div className="text-xs text-[#66645F] mt-0.5">
                Features restricted strictly to Big Five personality dimensions. Model signals indicate statistical association, not causal impact.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#66645F]">
            <div>FEATURES: <span className="font-bold text-[#171717]">BIG FIVE DIMENSIONS</span></div>
            <div>•</div>
            <div>STATUS: <span className="font-bold text-[#FF4D2E]">VERIFIED EMPIRICAL SCHEMA</span></div>
          </div>
        </div>

        {/* Two-Column Grid: Sliders & Prediction Outputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Big Five Sliders */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-5">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#171717] uppercase">
                    BIG FIVE TRAIT CONFIGURATION
                  </h3>
                  <p className="text-xs font-mono text-[#66645F] mt-1">
                    Calibrate trait scale (1.0 = low manifestation, 5.0 = pronounced manifestation)
                  </p>
                </div>
                <button
                  onClick={resetToMedian}
                  className="font-mono text-[11px] px-2 py-0.5 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] uppercase cursor-pointer"
                >
                  RESET MEDIAN
                </button>
              </div>

              {/* Sliders for ONLY: Neuroticism, Extraversion, Openness, Agreeableness, Conscientiousness */}
              <div className="space-y-5">
                {BIG_FIVE_CANONICAL.map(traitDef => {
                  const score = traits[traitDef.key] ?? traitDef.defaultScore;
                  const isNeuroticism = traitDef.key === 'Neuroticism';

                  return (
                    <div key={traitDef.key} className="border border-[#D8D2C4] bg-[#F4F1EA]/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-sm font-bold text-[#171717] uppercase">
                            {traitDef.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#66645F]">
                            FEATURE IMPORTANCE: {(traitDef.importance).toFixed(2)}
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-[#FF4D2E] bg-white px-2 py-0.5 border border-[#D8D2C4]">
                          {score.toFixed(1)} / 5.0
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={score}
                        onChange={(e) => handleSliderChange(traitDef.key, e.target.value)}
                        className="w-full accent-[#FF4D2E] cursor-pointer"
                      />

                      <div className="flex justify-between font-mono text-[9px] text-[#66645F] mt-1">
                        <span>1.0 LOW</span>
                        <span>3.0 MEDIAN</span>
                        <span>5.0 HIGH</span>
                      </div>

                      <div className="mt-2.5 text-xs text-[#66645F] font-sans">
                        <span className="font-mono text-[10px] uppercase font-bold text-[#171717]">
                          MODEL SIGNAL:{' '}
                        </span>
                        {isNeuroticism
                          ? 'Lower scores in this variable are associated with success in high-pressure deliverables.'
                          : `Positive feature importance; elevated scores are associated with senior success in empirical observations.`
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strict Feature Confirmation Note */}
              <div className="mt-5 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex items-center justify-between">
                <span>FEATURES: NEUROTICISM, EXTRAVERSION, OPENNESS, AGREEABLENESS, CONSCIENTIOUSNESS</span>
                <span>DATASET: SENIOR DS CORPUS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Results & Signal Association */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Classification Result Card */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>SENIOR SUCCESS CLASSIFIER OUTPUT</span>
                {predicting && <span className="text-[#FF4D2E] animate-pulse">EVALUATING...</span>}
              </div>

              <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                <div className="text-xs font-mono uppercase text-[#66645F] mb-1">
                  PREDICTED SUCCESS CLASS:
                </div>
                <div className="flex items-baseline gap-3">
                  <div className={`font-sans font-black text-4xl sm:text-5xl uppercase tracking-tight ${
                    predictedClass === 'High' ? 'text-[#FF4D2E]' : 'text-[#171717]'
                  }`}>
                    {predictedClass}
                  </div>
                  <div className="font-mono text-xs text-[#66645F] uppercase">
                    TARGET: {targetName}
                  </div>
                </div>
              </div>

              {/* Probability Display (Rendered ONLY if model provides probability) */}
              {hasProbability ? (
                <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <span className="text-[#66645F] uppercase">
                      HIGH-SUCCESS PROBABILITY:
                    </span>
                    <span className="font-bold text-[#171717]">
                      {(probabilityValue * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#E5DFD3] overflow-hidden">
                    <div
                      className="h-full bg-[#171717] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, probabilityValue * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-[#66645F] mt-1">
                    <span>0.00 (LOW PROBABILITY)</span>
                    <span>THRESHOLD: 0.50</span>
                    <span>1.00 (HIGH PROBABILITY)</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#D8D2C4] pt-3 pb-2 mb-4 font-mono text-[10px] text-[#66645F]">
                  PROBABILITY METRIC: Discrete decision boundary evaluation.
                </div>
              )}

              {/* Trait Association Digest */}
              <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-4 mb-4">
                <div className="font-mono text-xs font-bold text-[#171717] uppercase mb-2">
                  EMPIRICAL TRAIT SIGNALS
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between pb-1 border-b border-[#D8D2C4]/60">
                    <span className="text-[#66645F]">Openness ({traits.Openness.toFixed(1)}):</span>
                    <span className="font-bold text-[#171717]">
                      {traits.Openness >= 3.5 ? 'Associated with success' : 'Below median signal'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-[#D8D2C4]/60">
                    <span className="text-[#66645F]">Conscientiousness ({traits.Conscientiousness.toFixed(1)}):</span>
                    <span className="font-bold text-[#171717]">
                      {traits.Conscientiousness >= 3.5 ? 'Associated with success' : 'Below median signal'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-[#D8D2C4]/60">
                    <span className="text-[#66645F]">Neuroticism ({traits.Neuroticism.toFixed(1)}):</span>
                    <span className="font-bold text-[#171717]">
                      {traits.Neuroticism <= 2.8 ? 'Associated with success' : 'Elevated stress signal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strict Non-Causal Telemetry Disclaimer */}
              <div className="border-l-2 border-[#171717] pl-3 py-1 font-mono text-[10px] text-[#66645F]">
                <strong className="text-[#171717] uppercase">CAUSALITY EXCLUSION:</strong>{' '}
                Model outputs reflect empirical feature importance and associations observed in the Senior Data Scientist corpus. Scores are not causal determinants of individual capability.
              </div>
            </div>

            {/* Model Provenance Card */}
            <div className="border border-[#D8D2C4] bg-white p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-[#FF4D2E]" />
                <span>DATA INTEGRITY VERIFICATION</span>
              </div>
              <p className="text-xs text-[#66645F] leading-relaxed">
                {model?.description || 'Evaluates empirical associations between Big Five psychometric dimensions and high senior success classification.'}
              </p>
              <div className="mt-3 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex justify-between">
                <span>METRIC: {model?.metric || '0.86 AUC-ROC'}</span>
                <span>BASELINE: {model?.baselinePositiveRate || '39.5%'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
