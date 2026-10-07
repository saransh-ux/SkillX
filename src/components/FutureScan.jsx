import React, { useState } from 'react';
import { runFutureScan } from '../api/futureScan';
import { SignalError } from './common/SignalState';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function FutureScan() {
  const [role, setRole] = useState('Software Engineer');
  const [industry, setIndustry] = useState('FinTech');
  const [region, setRegion] = useState('India');
  const [forecast, setForecast] = useState('Next 2 Years');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const roleOptions = [
    'Software Engineer',
    'Data Engineer',
    'Solutions Architect',
    'Machine Learning Engineer',
    'Cloud Security Engineer',
    'Product Systems Lead'
  ];

  const industryOptions = [
    'FinTech',
    'Enterprise SaaS',
    'Healthcare & BioTech',
    'Cybersecurity',
    'Autonomous AI Systems',
    'Global Banking'
  ];

  const regionOptions = [
    'India',
    'North America',
    'European Union',
    'Asia-Pacific',
    'Global / Distributed'
  ];

  const forecastOptions = [
    'Next 12 Months',
    'Next 2 Years',
    'Next 3 Years',
    'Next 5 Years'
  ];

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    const horizonMap = {
      'Next 12 Months': 2027,
      'Next 2 Years': 2028,
      'Next 3 Years': 2029,
      'Next 5 Years': 2031
    };

    const payload = {
      role,
      industry,
      region,
      horizon: horizonMap[forecast] || 2028
    };

    try {
      const result = await runFutureScan(payload);
      setScanResult(result);
    } catch (err) {
      setScanError(err.message || 'Signal query failed to generate projection');
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
            05 / FUTURE SCAN
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
            WHAT WILL YOUR ROLE LOOK LIKE NEXT?
          </h2>
          <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
            Select a role, industry and region to discover the skills most likely to shape its next evolution.
          </p>
        </div>

        {/* Research Terminal Control Interface */}
        <div className="border border-[#D8D2C4] bg-[#F4F1EA] divide-y divide-[#D8D2C4]">
          
          {/* Form Header */}
          <div className="bg-[#ECE7DE]/60 px-6 py-3 flex items-center justify-between text-xs font-mono text-[#66645F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#171717] inline-block"></span>
              <span className="font-bold text-[#171717] uppercase">PREDICTIVE PARAMETER ENGINE</span>
            </div>
            <span>MODEL: PROJECTION-FORECAST-V4</span>
          </div>

          {/* Form Fields Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* ROLE */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                ROLE
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer appearance-none"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#66645F]">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            {/* INDUSTRY */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                INDUSTRY
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer appearance-none"
                >
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#66645F]">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            {/* REGION */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                REGION
              </label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer appearance-none"
                >
                  {regionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#66645F]">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            {/* FORECAST */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#171717] tracking-wider">
                FORECAST
              </label>
              <div className="relative">
                <select
                  value={forecast}
                  onChange={(e) => setForecast(e.target.value)}
                  className="w-full bg-[#ECE7DE]/40 border border-[#D8D2C4] hover:border-[#171717] text-[#171717] text-xs font-mono px-3 py-2.5 rounded-none focus:outline-none focus:border-[#FF4D2E] transition-colors cursor-pointer appearance-none"
                >
                  {forecastOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#66645F]">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Button Bar */}
          <div className="p-6 bg-[#ECE7DE]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#66645F]">
              <span>ACTIVE QUERY: </span>
              <strong className="text-[#171717]">{role}</strong> // {industry} // {region} ({forecast})
            </div>

            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF4D2E] hover:bg-[#E53E20] text-white text-xs font-mono font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-none disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SYNTHESIZING PREDICTIVE GRAPH...</span>
                </>
              ) : (
                <>
                  <span>RUN FUTURE SCAN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Error State */}
        {scanError && (
          <div className="mt-8">
            <SignalError message={scanError} onRetry={handleRunScan} />
          </div>
        )}

        {/* Scan Results Readout Section */}
        {scanResult && (
          <div className="mt-8 border border-[#171717] bg-[#F4F1EA] p-6 lg:p-8 animate-fadeIn">
            
            {/* Readout Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D2C4] pb-4 mb-6 gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#171717] text-[#F4F1EA] font-bold">
                  {scanResult.isSimulated ? 'PROJECTION // LOCAL CORPUS SIMULATION' : 'PREDICTION // BACKEND MODEL RUNTIME'}
                </span>
                <span className="text-[#66645F]">CONFIDENCE: <strong className="text-[#171717]">{scanResult.confidenceScore}%</strong></span>
              </div>
              <div className="text-[#66645F]">
                SHIFT VELOCITY: <strong className="text-[#FF4D2E]">{scanResult.roleShiftIndex}</strong>
              </div>
            </div>

            {/* Strategic Overview Text */}
            <div className="bg-[#ECE7DE]/50 border-l-4 border-l-[#FF4D2E] p-4 mb-6 text-xs font-sans text-[#171717] leading-relaxed">
              <strong>EXECUTIVE SYNTHESIS:</strong> {scanResult.recommendation}
            </div>

            {/* Emergent vs Decaying Skills Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Emergent Skills Column */}
              <div className="border border-[#D8D2C4] p-4 bg-[#F4F1EA]">
                <div className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>PROJECTED SURGING SKILLS</span>
                  <span className="text-[#FF4D2E]">DEMAND SURGE</span>
                </div>
                <div className="space-y-2">
                  {scanResult.emergentRequirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 border border-[#D8D2C4] bg-[#ECE7DE]/30 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#FF4D2E]"></span>
                        <span className="font-bold text-[#171717]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#FF4D2E] font-bold">{item.velocity}</span>
                        <span className="text-[10px] text-[#66645F] px-1 bg-[#F4F1EA] border border-[#D8D2C4]">{item.importance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decaying / Commoditizing Skills Column */}
              <div className="border border-[#D8D2C4] p-4 bg-[#F4F1EA]">
                <div className="font-mono text-xs font-bold text-[#66645F] uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>AT RISK OF OBSOLESCENCE</span>
                  <span className="text-[#8E8B83]">AUTOMATING</span>
                </div>
                <div className="space-y-2">
                  {scanResult.decayingRequirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 border border-[#D8D2C4] bg-[#ECE7DE]/10 flex items-center justify-between text-xs font-mono opacity-80"
                    >
                      <span className="text-[#66645F] line-through">{item.name}</span>
                      <span className="text-[#8E8B83] font-mono">{item.decay}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#D8D2C4] text-[10px] font-mono text-[#8E8B83]">
                  RISK ASSESSMENT: {scanResult.obsolescenceRisk}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
