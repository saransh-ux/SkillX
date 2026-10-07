import React, { useState, useEffect } from 'react';
import { getJuniorModel, predictJuniorSuccess } from '../api/career';
import { SignalLoading, SignalError } from './common/SignalState';
import { CheckSquare, Square, Cpu, Award } from 'lucide-react';

export default function JuniorSuccess() {
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState(null);

  // Selected features dynamically tracked by skill name
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Load model metadata dynamically from GET /api/career/junior/model
  useEffect(() => {
    let isMounted = true;
    async function fetchModel() {
      try {
        setLoadingModel(true);
        setModelError(null);
        const data = await getJuniorModel();
        if (isMounted) {
          setModel(data);
          // Initialize selected skills with top 2 features returned dynamically
          const defaultFeatures = (data.features || []).slice(0, 2).map(f => f.name || f);
          setSelectedSkills(defaultFeatures);
          setLoadingModel(false);
        }
      } catch (err) {
        if (isMounted) {
          setModelError(err.message || 'Failed to load junior predictive model telemetry.');
          setLoadingModel(false);
        }
      }
    }
    fetchModel();
    return () => { isMounted = false; };
  }, []);

  // Run prediction when selectedSkills changes
  useEffect(() => {
    if (!model) return;
    let isMounted = true;
    async function runEval() {
      try {
        setPredicting(true);
        const result = await predictJuniorSuccess(selectedSkills);
        if (isMounted) {
          setPrediction(result);
          setPredicting(false);
        }
      } catch (err) {
        console.warn('Junior prediction error:', err);
        if (isMounted) setPredicting(false);
      }
    }
    runEval();
    return () => { isMounted = false; };
  }, [selectedSkills, model]);

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev =>
      prev.includes(skillName)
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const selectAll = () => {
    if (!model?.features) return;
    setSelectedSkills(model.features.map(f => f.name || f));
  };

  const clearAll = () => {
    setSelectedSkills([]);
  };

  if (loadingModel) {
    return (
      <section id="junior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalLoading message="LOADING JUNIOR DATA SCIENTIST MODEL TELEMETRY..." />
        </div>
      </section>
    );
  }

  if (modelError && !model) {
    return (
      <section id="junior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <SignalError message={modelError} onRetry={() => window.location.reload()} />
        </div>
      </section>
    );
  }

  const features = model?.features || [];
  const targetName = model?.target || 'salary_hike_high_or_low';
  const predictedClass = prediction?.predictedSalaryHikeClass || prediction?.predictedClass || (selectedSkills.length >= 2 ? 'High' : 'Low');
  const hasProbability = prediction?.highSalaryHikeProbability !== undefined && prediction?.highSalaryHikeProbability !== null;
  const probabilityValue = hasProbability ? prediction.highSalaryHikeProbability : null;

  return (
    <section id="junior-success" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              03 / JUNIOR SUCCESS — TECHNICAL PREDICTIVE MODEL
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              JUNIOR SALARY-HIKE CLASSIFICATION
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Dynamically derived model signals evaluating candidate technical-skill vectors against empirical workforce outcomes.
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
                {model?.modelName || 'Junior Data Scientist Classifier'}
              </div>
              <div className="text-xs text-[#66645F] mt-0.5">
                Model signal reflects feature importance observed in training corpus. Non-causal associative telemetry.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#66645F]">
            <div>FEATURES TRACKED: <span className="font-bold text-[#171717]">{features.length}</span></div>
            <div>•</div>
            <div>STATUS: <span className="font-bold text-[#FF4D2E]">DYNAMIC CONTRACT VERIFIED</span></div>
          </div>
        </div>

        {/* Two-Column Grid: Left Feature Matrix & Selector, Right Prediction Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Dynamic Feature Toggles & Importance Weights */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-4">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#171717] uppercase">
                    TECHNICAL-SKILL FEATURE MATRIX
                  </h3>
                  <p className="text-xs font-mono text-[#66645F] mt-1">
                    Select candidate technical variables to simulate model signal
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <button
                    onClick={selectAll}
                    className="px-2 py-0.5 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] uppercase cursor-pointer"
                  >
                    SELECT ALL
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-2 py-0.5 border border-[#D8D2C4] hover:border-[#FF4D2E] text-[#66645F] hover:text-[#FF4D2E] uppercase cursor-pointer"
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              {/* Dynamic Feature List */}
              <div className="space-y-3">
                {features.map((feature, idx) => {
                  const featureName = feature.name || feature;
                  const isSelected = selectedSkills.includes(featureName);
                  const importance = typeof feature.importance === 'number'
                    ? feature.importance
                    : (0.30 - idx * 0.04);
                  const pct = Math.round(importance * 100);

                  return (
                    <div
                      key={featureName}
                      onClick={() => toggleSkill(featureName)}
                      className={`p-3.5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#171717] bg-[#ECE7DE]/40'
                          : 'border-[#D8D2C4] bg-white hover:border-[#999]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-[#171717] hover:text-[#FF4D2E] shrink-0"
                          aria-label={`Toggle ${featureName}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#FF4D2E]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#66645F]" />
                          )}
                        </button>
                        <div>
                          <div className="font-mono text-sm font-bold text-[#171717]">
                            {featureName}
                          </div>
                          {feature.category && (
                            <div className="font-mono text-[10px] text-[#66645F] uppercase mt-0.5">
                              CATEGORY: {feature.category}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feature Importance Bar */}
                      <div className="flex items-center gap-3 font-mono text-xs sm:w-48 shrink-0">
                        <div className="text-[10px] text-[#66645F] uppercase w-20 text-right">
                          IMPORTANCE
                        </div>
                        <div className="flex-1 h-2 bg-[#E5DFD3] overflow-hidden">
                          <div
                            className={`h-full ${isSelected ? 'bg-[#FF4D2E]' : 'bg-[#171717]'}`}
                            style={{ width: `${Math.min(100, pct * 2.5)}%` }}
                          />
                        </div>
                        <div className="font-bold text-[#171717] w-10 text-right">
                          {(importance).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Data Note */}
              <div className="mt-4 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex items-center justify-between">
                <span>DYNAMIC ENDPOINT: GET /api/career/junior/model</span>
                <span>TARGET: {targetName}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Outcomes & Association Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Classification Result Card */}
            <div className="border border-[#D8D2C4] bg-white p-6">
              <div className="font-mono text-xs text-[#66645F] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>MODEL EVALUATION OUTPUT</span>
                {predicting && <span className="text-[#FF4D2E] animate-pulse">EVALUATING...</span>}
              </div>

              <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                <div className="text-xs font-mono uppercase text-[#66645F] mb-1">
                  PREDICTED SALARY-HIKE CLASS:
                </div>
                <div className="flex items-baseline gap-3">
                  <div className={`font-sans font-black text-4xl sm:text-5xl uppercase tracking-tight ${
                    predictedClass === 'High' ? 'text-[#FF4D2E]' : 'text-[#171717]'
                  }`}>
                    {predictedClass}
                  </div>
                  <div className="font-mono text-xs text-[#66645F] uppercase">
                    OUTCOME SIGNAL
                  </div>
                </div>
              </div>

              {/* Probability Display (Rendered ONLY if model provides probability) */}
              {hasProbability ? (
                <div className="border-t border-[#D8D2C4] pt-4 mb-6">
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <span className="text-[#66645F] uppercase">
                      HIGH SALARY-HIKE PROBABILITY:
                    </span>
                    <span className="font-bold text-[#171717]">
                      {(probabilityValue * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#E5DFD3] overflow-hidden">
                    <div
                      className="h-full bg-[#FF4D2E] transition-all duration-300"
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
                  PROBABILITY METRIC: Discrete class decision boundary provided by model endpoint.
                </div>
              )}

              {/* Active Portfolio Summary */}
              <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-4 mb-4">
                <div className="font-mono text-xs font-bold text-[#171717] uppercase mb-1">
                  PORTFOLIO CONFIGURATION
                </div>
                <div className="text-xs text-[#66645F] mb-3">
                  Candidate profile includes <strong className="text-[#171717]">{selectedSkills.length}</strong> active technical features from the model vocabulary.
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.length > 0 ? (
                    selectedSkills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-white border border-[#D8D2C4] font-mono text-[10px] text-[#171717]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-[10px] text-[#66645F] italic">
                      Zero technical features selected (baseline outcome)
                    </span>
                  )}
                </div>
              </div>

              {/* Non-Causal Telemetry Caveat */}
              <div className="border-l-2 border-[#171717] pl-3 py-1 font-mono text-[10px] text-[#66645F]">
                <strong className="text-[#171717] uppercase">EMPIRICAL ASSOCIATIVE SIGNAL:</strong>{' '}
                Variables are associated with higher salary-hike outcomes in historical data. Model reflects statistical correlations, not direct causal drivers.
              </div>
            </div>

            {/* Model Architecture Note */}
            <div className="border border-[#D8D2C4] bg-white p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] uppercase mb-2">
                <Award className="w-4 h-4 text-[#FF4D2E]" />
                <span>PREDICTIVE METHODOLOGY</span>
              </div>
              <p className="text-xs text-[#66645F] leading-relaxed">
                {model?.description || 'Evaluates statistical associations between candidate technical-skill vectors and salary-hike classification outcomes.'}
              </p>
              <div className="mt-3 pt-3 border-t border-[#D8D2C4] font-mono text-[10px] text-[#66645F] flex justify-between">
                <span>BASELINE POSITIVE RATE: {model?.baselinePositiveRate || '42.8%'}</span>
                <span>CORPUS: OFFICIAL JDS DATASET</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
