import React, { useState } from 'react';
import { queryCopilot } from '../api/copilot';
import { SignalLoading } from './common/SignalState';
import BackendConnectionError from './common/BackendConnectionError';
import { Terminal, Send, Database, AlertCircle, ShieldCheck, Activity } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Which skills are most demanded?",
  "What skills commonly occur with Python?",
  "Which technical skills are associated with higher salary-hike outcomes?",
  "What personality traits are associated with senior success?",
  "What does the job market demand?",
  "What should a junior data scientist prioritize?"
];

export default function Copilot() {
  const [inputQuery, setInputQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optional contextual filters matching backend schema
  const [contextRole, setContextRole] = useState('Data Scientist');
  const [contextLocation, setContextLocation] = useState('Bengaluru');

  const handleQuery = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    setActiveQuery(text);
    setInputQuery(text);
    setLoading(true);
    setError(null);

    try {
      const data = await queryCopilot(text, {
        role: contextRole || undefined,
        location: contextLocation || undefined
      });
      setResponse(data);
      setLoading(false);
    } catch (err) {
      console.warn('Copilot query error:', err);
      setError({
        message: err.message || 'BACKEND OFFLINE // COPILOT SIGNAL UNAVAILABLE',
        status: err.status ?? (err.isNetworkError ? 0 : 500),
        endpoint: err.endpoint || '/api/copilot'
      });
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
              06 / COPILOT — GROUNDED NATURAL LANGUAGE ANALYTICS
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              COPILOT
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Analytical query interface grounded strictly in official hackathon datasets: Analytics Jobs (15,841 postings), JDS Skill Traits (n=139), and SDS Personality Traits (n=161).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-[#171717] text-[#F4F1EA] uppercase font-bold tracking-wider">
              ENDPOINT: POST /api/copilot
            </span>
            <span className="px-2.5 py-1 border border-[#D8D2C4] text-[#171717] uppercase">
              EMPIRICAL DATASET PROVENANCE
            </span>
          </div>
        </div>

        {/* Query Terminal Box */}
        <div className="border border-[#D8D2C4] bg-white p-6 sm:p-8 mb-6">
          
          {/* Query Terminal Header Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#D8D2C4] font-mono text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FF4D2E]" />
              <span className="font-bold text-[#171717] uppercase">EDITORIAL QUERY TERMINAL</span>
            </div>
            <div className="flex items-center gap-4 text-[#66645F] text-[11px]">
              <div className="flex items-center gap-1.5">
                <span>ROLE CONTEXT:</span>
                <select
                  value={contextRole}
                  onChange={(e) => setContextRole(e.target.value)}
                  className="bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717] px-2 py-0.5 font-mono text-[11px] focus:outline-none"
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Business Analyst">Business Analyst</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span>LOCATION:</span>
                <select
                  value={contextLocation}
                  onChange={(e) => setContextLocation(e.target.value)}
                  className="bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717] px-2 py-0.5 font-mono text-[11px] focus:outline-none"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Terminal Input Form */}
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#FF4D2E] select-none">
                &gt;
              </span>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask an analytical question grounded in hackathon datasets..."
                className="w-full bg-[#F4F1EA] border border-[#D8D2C4] hover:border-[#171717] text-[#171717] pl-8 pr-4 py-3.5 font-mono text-xs placeholder:text-[#8E8B83] focus:outline-none focus:border-[#FF4D2E] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-8 py-3.5 bg-[#FF4D2E] hover:bg-[#E53E20] disabled:opacity-50 text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>SUBMIT QUERY</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Suggested Analytical Query Chips */}
          <div className="mt-6 pt-5 border-t border-[#D8D2C4]">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#66645F] uppercase mb-2.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-[#FF4D2E]" />
              <span>SUGGESTED ANALYTICAL QUERIES (CLICK TO EVALUATE):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuery(question)}
                  className="px-3 py-1.5 bg-[#F4F1EA] hover:bg-[#171717] hover:text-white border border-[#D8D2C4] text-[#171717] font-mono text-xs transition-colors cursor-pointer text-left"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <SignalLoading message="DISPATCHING ANALYTICAL QUERY TO COPILOT SERVICE..." />}

        {/* Error Feedback with Reusable Error State */}
        {error && (
          <BackendConnectionError
            endpoint={typeof error === 'object' ? error.endpoint : '/api/copilot'}
            status={typeof error === 'object' ? error.status : null}
            message={typeof error === 'object' ? error.message : error}
            onRetry={() => handleQuery(activeQuery || inputQuery)}
          />
        )}

        {/* Backend Response Area */}
        {response && !loading && (
          <div className="border border-[#171717] bg-white p-6 sm:p-8 space-y-6 animate-fadeIn">
            
            {/* Telemetry Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D2C4] pb-4 gap-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#171717]">
                <Database className="w-4 h-4 text-[#FF4D2E]" />
                <span className="font-bold uppercase">COPILOT ANALYTICAL DOSSIER</span>
                <span className="px-2 py-0.5 bg-[#171717] text-white text-[10px] uppercase font-bold">
                  POST /api/copilot
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#66645F]">
                DISPATCHED: {response.timestamp ? new Date(response.timestamp).toLocaleTimeString() : 'LIVE'}
              </div>
            </div>

            {/* Echoed Evaluated Query */}
            <div>
              <div className="font-mono text-[10px] text-[#66645F] uppercase mb-1">
                EVALUATED QUERY STRING:
              </div>
              <div className="font-mono text-xs font-bold text-[#171717] bg-[#F4F1EA] p-3 border border-[#D8D2C4]">
                &gt; {activeQuery}
              </div>
            </div>

            {/* Factual Answer Area */}
            <div>
              <div className="font-mono text-[10px] text-[#66645F] uppercase mb-2 font-bold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF4D2E]" />
                <span>FACTUAL SYNTHESIS:</span>
              </div>
              <div className="p-4 bg-[#F4F1EA]/60 border-l-4 border-l-[#FF4D2E] border border-[#D8D2C4]">
                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed font-mono whitespace-pre-line">
                  {response.answer}
                </p>
              </div>
            </div>

            {/* Empirical Evidence Table (source, metric, value, sample size) */}
            {Array.isArray(response.evidence) && response.evidence.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-[#66645F] uppercase mb-2 font-bold flex items-center justify-between">
                  <span>EMPIRICAL EVIDENCE ITEMS:</span>
                  <span>COUNT: {response.evidence.length}</span>
                </div>
                <div className="overflow-x-auto border border-[#D8D2C4]">
                  <table className="w-full font-mono text-xs text-left">
                    <thead className="bg-[#F4F1EA] border-b border-[#D8D2C4] text-[10px] text-[#66645F] uppercase">
                      <tr>
                        <th className="py-2 px-3">Dataset / Source</th>
                        <th className="py-2 px-3">Metric</th>
                        <th className="py-2 px-3">Empirical Value</th>
                        <th className="py-2 px-3 text-right">Sample Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {response.evidence.map((ev, idx) => (
                        <tr key={idx} className="hover:bg-[#F4F1EA]/40 text-[11px]">
                          <td className="py-2 px-3 font-bold text-[#171717]">{ev.source}</td>
                          <td className="py-2 px-3 text-[#66645F]">{ev.metric}</td>
                          <td className="py-2 px-3 text-[#FF4D2E] font-semibold">{ev.value}</td>
                          <td className="py-2 px-3 text-right text-[#171717]">n={ev.sample_size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Methodology & Limitations Footer */}
            <div className="pt-4 border-t border-[#D8D2C4] space-y-2 font-mono text-[10px] text-[#66645F]">
              {response.methodology && (
                <div className="flex items-start gap-2">
                  <strong className="text-[#171717] uppercase shrink-0">METHODOLOGY:</strong>
                  <span>{response.methodology}</span>
                </div>
              )}
              {Array.isArray(response.caveats) && response.caveats.length > 0 && (
                <div className="flex items-start gap-2">
                  <strong className="text-[#171717] uppercase shrink-0">LIMITATIONS:</strong>
                  <span>{response.caveats.join(' • ')}</span>
                </div>
              )}
              <div className="pt-2 text-[9px] text-[#8E8B83] uppercase flex justify-between">
                <span>STRICT DATA GOVERNANCE // ZERO FABRICATED RESPONSES</span>
                <span>BACKEND SOURCE OF TRUTH</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
