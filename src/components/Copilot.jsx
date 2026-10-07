import React, { useState } from 'react';
import { queryCopilot, SUGGESTED_COPILOT_PROMPTS } from '../api/copilot';
import { SignalLoading } from './common/SignalState';
import { Terminal, Send, Sparkles, Database } from 'lucide-react';

export default function Copilot() {
  const [inputQuery, setInputQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuery = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    setActiveQuery(text);
    setInputQuery(text);
    setLoading(true);
    setError(null);

    try {
      const data = await queryCopilot(text);
      setResponse(data);
      setLoading(false);
    } catch (err) {
      console.warn('Copilot query error:', err);
      setError(err.message || 'Telemetry query could not be completed.');
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleQuery(inputQuery);
  };

  return (
    <section id="copilot" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              06 / COPILOT — NATURAL LANGUAGE ANALYTICS
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              WORKFORCE INTELLIGENCE COPILOT
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Conversational analytical interface grounded strictly in empirical datasets, skill co-occurrence networks, and predictive model signals.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#66645F]">
            <Terminal className="w-4 h-4 text-[#FF4D2E]" />
            <span className="uppercase">POST /api/copilot/query</span>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="border border-[#D8D2C4] bg-white p-6 mb-6">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#66645F] select-none">
                &gt;
              </span>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about top skills, co-occurrences, junior salary hikes, or senior traits..."
                className="w-full bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717] pl-8 pr-4 py-3 font-mono text-xs placeholder:text-[#8E8B83] focus:outline-none focus:border-[#171717]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-6 py-3 bg-[#171717] hover:bg-[#FF4D2E] disabled:opacity-50 text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>RUN QUERY</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Suggested Query Chips */}
          <div className="mt-5 pt-4 border-t border-[#D8D2C4]">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#66645F] uppercase mb-2">
              <Sparkles className="w-3 h-3 text-[#FF4D2E]" />
              <span>SUGGESTED ANALYTICAL PROMPTS:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_COPILOT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuery(prompt)}
                  className="px-2.5 py-1 bg-[#F4F1EA] hover:bg-[#171717] hover:text-white border border-[#D8D2C4] text-[#171717] font-mono text-xs transition-colors cursor-pointer text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <SignalLoading message="QUERYING EMPIRICAL INTELLIGENCE CORPUS..." />}

        {/* Error Feedback */}
        {error && (
          <div className="border border-[#FF4D2E] bg-white p-4 font-mono text-xs text-[#FF4D2E] mb-6">
            TELEMETRY FAULT: {error}
          </div>
        )}

        {/* Response Terminal */}
        {response && !loading && (
          <div className="border border-[#D8D2C4] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-4 mb-6">
              <div className="flex items-center gap-2 font-mono text-xs text-[#171717]">
                <Database className="w-4 h-4 text-[#FF4D2E]" />
                <span className="font-bold uppercase">CORPUS TELEMETRY RESPONSE</span>
              </div>
              <div className="font-mono text-[10px] text-[#66645F]">
                {response.timestamp ? new Date(response.timestamp).toLocaleTimeString() : 'LIVE'}
              </div>
            </div>

            {/* Echoed Active Query */}
            <div className="mb-4">
              <div className="font-mono text-[10px] text-[#66645F] uppercase mb-1">
                EVALUATED QUERY:
              </div>
              <div className="font-mono text-xs font-bold text-[#171717] bg-[#F4F1EA] p-2.5 border border-[#D8D2C4]">
                &gt; {activeQuery}
              </div>
            </div>

            {/* Natural Language Answer */}
            <div className="mb-6">
              <div className="font-mono text-[10px] text-[#66645F] uppercase mb-2">
                EMPIRICAL SYNTHESIS:
              </div>
              <p className="text-sm text-[#171717] leading-relaxed font-sans border-l-2 border-[#FF4D2E] pl-4 py-1">
                {response.answer}
              </p>
            </div>

            {/* Related Metrics (Grounded in Backend Data) */}
            {Array.isArray(response.relatedMetrics) && response.relatedMetrics.length > 0 && (
              <div className="mb-6">
                <div className="font-mono text-[10px] text-[#66645F] uppercase mb-2">
                  EMPIRICAL METRICS RETURNED:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {response.relatedMetrics.map((metric, idx) => (
                    <div key={idx} className="border border-[#D8D2C4] bg-[#F4F1EA] p-3">
                      <div className="font-mono text-[9px] text-[#66645F] uppercase">
                        {metric.label}
                      </div>
                      <div className="font-mono text-sm font-bold text-[#171717] mt-1">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations & Evidence Attributions */}
            <div className="pt-4 border-t border-[#D8D2C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px] text-[#66645F]">
              <div className="flex items-center gap-2">
                <span className="uppercase font-bold text-[#171717]">CITATIONS:</span>
                {(response.citations || []).map((cite, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-[#F4F1EA] border border-[#D8D2C4]">
                    {cite}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-[#66645F]">
                STRICT DATA INTEGRITY // NO FABRICATED METRICS
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
