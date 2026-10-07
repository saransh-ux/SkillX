import React, { useState, useEffect } from 'react';
import { getCareerModelMetadata, getSeniorModelMetadata } from '../services/api';
import { Cpu, Brain, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Info } from 'lucide-react';

export default function SignalInsight() {
  const [careerModel, setCareerModel] = useState(null);
  const [seniorModel, setSeniorModel] = useState(null);
  const [activeModelTab, setActiveModelTab] = useState('career'); // 'career' | 'senior'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      setError(null);
      try {
        const [careerData, seniorData] = await Promise.all([
          getCareerModelMetadata(),
          getSeniorModelMetadata(),
        ]);
        setCareerModel(careerData);
        setSeniorModel(seniorData);
      } catch (err) {
        setError(err.message || 'Failed to retrieve supervised ML model evidence metadata');
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const activeModel = activeModelTab === 'career' ? careerModel : seniorModel;

  return (
    <section id="the-signal" className="border-b border-[#D8D2C4] bg-[#ECE7DE]/40 py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Research Tag */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#FF4D2E] font-bold tracking-editorial uppercase mb-4">
          <span className="w-2 h-2 bg-[#FF4D2E]"></span>
          SUPERVISED MACHINE LEARNING // EMPIRICAL BENCHMARKS
        </div>

        {/* Editorial Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter text-[#171717] uppercase">
              MODEL EVIDENCE BENCHMARKS
            </h2>
            <p className="text-base sm:text-lg text-[#66645F] font-normal leading-relaxed pt-1">
              Rigorous, non-cherry-picked evaluation metrics and feature importance from our two supervised models trained on empirical practitioner cohorts.
            </p>
          </div>

          {/* Model Switcher Tabs */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveModelTab('career')}
              className={`px-4 py-2 border transition-all cursor-pointer ${
                activeModelTab === 'career'
                  ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-bold'
                  : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
              }`}
            >
              1. JDS CAREER SUCCESS
            </button>
            <button
              onClick={() => setActiveModelTab('senior')}
              className={`px-4 py-2 border transition-all cursor-pointer ${
                activeModelTab === 'senior'
                  ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-bold'
                  : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4] hover:text-[#171717]'
              }`}
            >
              2. SDS SENIOR SUCCESS
            </button>
          </div>
        </div>

        {loading ? (
          <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-16 text-center font-mono text-xs text-[#66645F] tracking-widest uppercase">
            LOADING VALIDATED ML BENCHMARK DATA...
          </div>
        ) : error ? (
          <div className="border border-[#FF4D2E]/30 bg-[#FF4D2E]/5 p-8 text-center font-mono text-xs text-[#FF4D2E] space-y-2">
            <AlertCircle className="w-5 h-5 mx-auto" />
            <div>FAILED TO LOAD MACHINE LEARNING METADATA: {error}</div>
          </div>
        ) : activeModel ? (
          <div className="border border-[#D8D2C4] bg-[#F4F1EA] divide-y divide-[#D8D2C4]">
            
            {/* Top Telemetry Header */}
            <div className="p-6 bg-[#ECE7DE]/50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#171717] uppercase">
                  SELECTED: {activeModel.selected_model_name}
                </span>
                <span className="text-[#D8D2C4]">/</span>
                <span className="text-[#66645F]">
                  TARGET: <strong className="text-[#171717]">{activeModel.target}</strong>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#66645F]">
                <span>DATASET: <strong className="text-[#171717]">{activeModel.training_dataset_name}</strong></span>
                <span>TOTAL N: <strong className="text-[#171717]">{activeModel.dataset_size}</strong></span>
                <span>TEST N: <strong className="text-[#FF4D2E]">{activeModel.test_size}</strong></span>
              </div>
            </div>

            {/* Performance Metrics Quad Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D8D2C4]">
              
              <div className="p-6 sm:p-8">
                <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
                  BALANCED ACCURACY
                </div>
                <div className="font-mono font-black text-4xl sm:text-5xl text-[#171717] mt-2">
                  {(activeModel.metrics.balanced_accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-[#66645F] font-mono mt-1">
                  Primary metric accounting for class imbalance
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
                  RAW TEST ACCURACY
                </div>
                <div className="font-mono font-black text-4xl sm:text-5xl text-[#171717] mt-2">
                  {(activeModel.metrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-[#66645F] font-mono mt-1">
                  On holdout test partition (unseen data)
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
                  PRECISION / RECALL
                </div>
                <div className="font-mono font-black text-3xl sm:text-4xl text-[#FF4D2E] mt-2">
                  {(activeModel.metrics.precision * 100).toFixed(1)}% <span className="text-xl text-[#66645F]">/</span> {(activeModel.metrics.recall * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-[#66645F] font-mono mt-1">
                  F1-Score: {(activeModel.metrics.f1 * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="font-mono text-[10px] text-[#66645F] uppercase tracking-wider">
                  ROC-AUC SCORE
                </div>
                <div className="font-mono font-black text-4xl sm:text-5xl text-[#171717] mt-2">
                  {activeModel.metrics.roc_auc ? (activeModel.metrics.roc_auc * 100).toFixed(1) + '%' : 'N/A'}
                </div>
                <div className="text-[11px] text-[#66645F] font-mono mt-1">
                  Discriminative threshold capacity
                </div>
              </div>

            </div>

            {/* Split Section: Feature Importance Ranking vs Model Evaluation Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D8D2C4]">
              
              {/* Feature Weights & Importances */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3 text-xs font-mono text-[#66645F]">
                  <span className="font-bold text-[#171717] uppercase">
                    FEATURE WEIGHT CONTRIBUTIONS // {activeModel.selected_model_name}
                  </span>
                  <span>RANKED BY IMPACT</span>
                </div>

                <div className="space-y-4">
                  {activeModel.feature_importance.map((feat) => {
                    const maxWeight = Math.max(...activeModel.feature_importance.map(f => Math.abs(f.importance || f.coefficient || 0))) || 1;
                    const val = feat.importance !== undefined ? feat.importance : feat.coefficient;
                    const pctWidth = Math.min(100, Math.round((Math.abs(val) / maxWeight) * 100));
                    const isPositive = val >= 0;

                    return (
                      <div key={feat.feature} className="p-3 bg-[#ECE7DE]/30 border border-[#D8D2C4] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8B83] text-[10px]">#{feat.rank}</span>
                            <span className="font-bold text-[#171717] uppercase">{feat.display_name}</span>
                          </div>
                          <div className="font-mono font-black text-sm text-[#171717]">
                            {feat.coefficient !== undefined && feat.coefficient !== null
                              ? `coeff: ${feat.coefficient > 0 ? '+' : ''}${feat.coefficient.toFixed(3)}`
                              : `importance: ${(feat.importance * 100).toFixed(1)}%`}
                          </div>
                        </div>

                        {/* Bar Representation */}
                        <div className="w-full h-3 bg-[#ECE7DE] border border-[#D8D2C4]">
                          <div
                            className={`h-full ${isPositive ? 'bg-[#FF4D2E]' : 'bg-[#171717]'}`}
                            style={{ width: `${pctWidth}%` }}
                          />
                        </div>

                        {feat.odds_ratio && (
                          <div className="text-[10px] font-mono text-[#66645F]">
                            Odds Ratio: <strong className="text-[#171717]">{feat.odds_ratio.toFixed(2)}×</strong> per unit increase
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Rationale, Selection, and Statistical Caveats */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-[#ECE7DE]/20 space-y-6">
                
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#171717] uppercase border-b border-[#D8D2C4] pb-2">
                    MODEL SELECTION RATIONALE
                  </div>
                  <p className="text-xs font-sans text-[#171717] leading-relaxed">
                    {activeModel.selection_rationale}
                  </p>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="font-bold text-[#171717] uppercase border-b border-[#D8D2C4] pb-2">
                    CLASS DISTRIBUTION & TRAIN/TEST SPLIT
                  </div>
                  <div className="space-y-1.5 text-[11px] text-[#66645F]">
                    <div className="flex justify-between">
                      <span>Total Dataset Records:</span>
                      <strong className="text-[#171717]">{activeModel.dataset_size}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Set (80% stratified):</span>
                      <strong className="text-[#171717]">{activeModel.train_size}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Holdout Test Set (20% stratified):</span>
                      <strong className="text-[#FF4D2E]">{activeModel.test_size}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#D8D2C4]/60">
                      <span>Observed Class Ratio (High / Low):</span>
                      <strong className="text-[#171717]">
                        {activeModel.class_distribution?.high || activeModel.class_distribution?.[1] || '-'}/
                        {activeModel.class_distribution?.low || activeModel.class_distribution?.[0] || '-'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#F4F1EA] border border-[#D8D2C4] space-y-2">
                  <div className="font-mono text-xs font-bold text-[#FF4D2E] uppercase flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>METHODOLOGICAL LIMITATIONS</span>
                  </div>
                  <ul className="space-y-1 text-[11px] font-mono text-[#66645F] list-disc list-inside leading-relaxed">
                    {activeModel.limitations?.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

            {/* Bottom Caution Banner */}
            <div className="p-4 sm:p-6 bg-[#ECE7DE]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[#66645F] gap-2">
              <div>
                NON-CAUSAL INTERPRETATION RULE: Supervised model weights reflect <strong className="text-[#171717]">statistical correlations in survey cohorts</strong>, not guaranteed individual salary outcomes.
              </div>
              <div className="text-[#171717] font-semibold">
                SCIKIT-LEARN PIPELINE VALIDATED
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </section>
  );
}
