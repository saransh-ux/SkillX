import React, { useState, useEffect } from 'react';
import { getGeographicMarkets, getGeographicMarketDetail } from '../services/api';
import { MapPin, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function IndustryShift() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetail, setLocationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleSize, setSampleSize] = useState(0);

  useEffect(() => {
    async function loadMarkets() {
      setLoading(true);
      setError(null);
      try {
        const res = await getGeographicMarkets(12);
        setLocations(res.data || []);
        setSampleSize(res.sample_size || 0);
        if (res.data && res.data.length > 0) {
          setSelectedLocation(res.data[0].location);
        }
      } catch (err) {
        setError(err.message || 'Failed to connect to Geographic Market intelligence API');
      } finally {
        setLoading(false);
      }
    }
    loadMarkets();
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const detail = await getGeographicMarketDetail(selectedLocation);
        setLocationDetail(detail);
      } catch (err) {
        console.error('Failed to load location detail:', err);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetail();
  }, [selectedLocation]);

  const activeMarket = locations.find(l => l.location === selectedLocation) || locations[0];

  return (
    <section id="industry-shift" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              04 / GEOGRAPHIC MARKET DISTRIBUTION
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              REGIONAL TALENT CLUSTERS
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-2xl">
              Empirical distribution of job postings and skill demand across primary technology metropolitan hubs.
            </p>
          </div>

          {/* Dataset Dimension Tag */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#66645F] bg-[#ECE7DE] border border-[#D8D2C4] px-3 py-1.5 self-start md:self-end">
            <span className="w-2 h-2 bg-[#FF4D2E]"></span>
            <span>SEGMENTATION DIMENSION: <strong className="text-[#171717]">LOCATION</strong></span>
          </div>
        </div>

        {/* Dataset Transparency Callout */}
        <div className="bg-[#ECE7DE]/60 border border-[#D8D2C4] p-4 mb-8 text-xs font-mono text-[#66645F] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#FF4D2E] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#171717]">EMPIRICAL METRIC CITATION:</strong> The Analytics Jobs dataset does not provide an official industry classification field. Market concentration is therefore segmented purely by verified job location coordinates across <strong className="text-[#171717]">{sampleSize.toLocaleString()}</strong> eligible postings.
          </div>
        </div>

        {/* Main Interface Content */}
        {loading ? (
          <div className="border border-[#D8D2C4] bg-[#F4F1EA] p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 text-[#FF4D2E] animate-spin mb-4" />
            <div className="font-mono text-xs text-[#66645F] tracking-widest uppercase">
              INGESTING GEOGRAPHIC HUBS FROM ANALYTICS JOBS...
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#FF4D2E]/30 bg-[#FF4D2E]/5 p-8 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-[#FF4D2E] mx-auto" />
            <div className="font-mono text-xs text-[#FF4D2E] font-bold uppercase">
              GEOGRAPHIC TELEMETRY UNAVAILABLE
            </div>
            <div className="text-xs text-[#66645F] font-mono">{error}</div>
          </div>
        ) : (
          <div className="border border-[#D8D2C4] bg-[#F4F1EA] divide-y divide-[#D8D2C4]">
            
            {/* Top Hub Quick Select Pills */}
            <div className="p-4 sm:p-6 bg-[#ECE7DE]/30 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-[#66645F] uppercase font-bold mr-2">
                SELECT HUB:
              </span>
              {locations.slice(0, 8).map((hub) => (
                <button
                  key={hub.location}
                  onClick={() => setSelectedLocation(hub.location)}
                  className={`px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer ${
                    selectedLocation === hub.location
                      ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-bold'
                      : 'bg-[#F4F1EA] text-[#66645F] border-[#D8D2C4] hover:text-[#171717] hover:border-[#171717]'
                  }`}
                >
                  {hub.location} ({hub.percentage_of_postings}%)
                </button>
              ))}
            </div>

            {/* Split View: Hub Rankings vs Deep-Dive Dossier */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D8D2C4]">
              
              {/* Left Column: Geographic Distribution Bar Chart */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3 text-xs font-mono text-[#66645F]">
                  <span className="font-bold text-[#171717] uppercase">REGIONAL TALENT SHARE (POSTING VOLUME)</span>
                  <span>SAMPLE: N={sampleSize.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  {locations.map((item, idx) => {
                    const isSelected = item.location === selectedLocation;
                    const maxPct = locations[0]?.percentage_of_postings || 1;
                    const relativeWidth = Math.min(100, Math.round((item.percentage_of_postings / maxPct) * 100));

                    return (
                      <div
                        key={item.location}
                        onClick={() => setSelectedLocation(item.location)}
                        className={`p-3 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#171717] bg-[#ECE7DE]'
                            : 'border-transparent hover:border-[#D8D2C4] hover:bg-[#ECE7DE]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8B83] text-[10px]">#{String(idx + 1).padStart(2, '0')}</span>
                            <span className="font-bold text-[#171717] uppercase">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#66645F]">{item.posting_count.toLocaleString()} listings</span>
                            <span className="font-black text-[#171717]">{item.percentage_of_postings}%</span>
                          </div>
                        </div>

                        {/* Bar Visualization */}
                        <div className="w-full h-4 bg-[#ECE7DE] border border-[#D8D2C4] relative">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isSelected ? 'bg-[#FF4D2E]' : idx === 0 ? 'bg-[#171717]' : 'bg-[#66645F]'
                            }`}
                            style={{ width: `${relativeWidth}%` }}
                          />
                        </div>

                        {/* Skills Snippet */}
                        {item.top_skills && item.top_skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1 font-mono text-[10px] text-[#66645F]">
                            <span className="text-[#8E8B83]">TOP DEMAND:</span>
                            {item.top_skills.slice(0, 4).map((sk) => (
                              <span key={sk} className="px-1 bg-[#F4F1EA] border border-[#D8D2C4] text-[#171717]">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Hub Telemetry Dossier */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-[#ECE7DE]/20 space-y-6">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3 text-xs font-mono">
                  <span className="font-bold text-[#171717] uppercase">HUB DOSSIER: {selectedLocation}</span>
                  <span className="text-[#FF4D2E] font-semibold">EMPIRICAL DATA</span>
                </div>

                {detailLoading ? (
                  <div className="py-12 text-center text-xs font-mono text-[#66645F]">
                    FETCHING LOCATION STRUCTURE...
                  </div>
                ) : activeMarket ? (
                  <div className="space-y-6">
                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div className="p-3 bg-[#F4F1EA] border border-[#D8D2C4]">
                        <div className="text-[10px] text-[#66645F] uppercase">TOTAL LISTINGS</div>
                        <div className="text-2xl font-black text-[#171717] mt-1">
                          {activeMarket.posting_count.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#8E8B83] mt-0.5">
                          {activeMarket.percentage_of_postings}% of market
                        </div>
                      </div>

                      <div className="p-3 bg-[#F4F1EA] border border-[#D8D2C4]">
                        <div className="text-[10px] text-[#66645F] uppercase">MEDIAN SALARY</div>
                        <div className="text-2xl font-black text-[#FF4D2E] mt-1">
                          {activeMarket.median_salary ? `₹${activeMarket.median_salary}L` : 'Unspecified'}
                        </div>
                        <div className="text-[10px] text-[#8E8B83] mt-0.5">
                          {activeMarket.average_salary ? `Mean: ₹${activeMarket.average_salary}L` : 'Per annum (parsed)'}
                        </div>
                      </div>
                    </div>

                    {/* Top Required Skills in Location */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center justify-between">
                        <span>LOCAL SKILL PREVALENCE</span>
                        <span className="text-[10px] text-[#8E8B83]">SHARE IN HUB</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {(locationDetail?.top_skills || activeMarket.top_skills?.map(s => ({ skill_name: s, posting_count: '-', prevalence_pct: null })) || []).slice(0, 6).map((sk) => (
                          <div key={sk.skill_name || sk} className="p-2 bg-[#F4F1EA] border border-[#D8D2C4] flex items-center justify-between">
                            <span className="text-[#171717] font-semibold">{sk.skill_name || sk}</span>
                            <span className="text-[#FF4D2E] font-bold">
                              {sk.prevalence_pct !== null && sk.prevalence_pct !== undefined ? `${sk.prevalence_pct}%` : 'DEMANDED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Designations in Location */}
                    {locationDetail?.job_designations && locationDetail.job_designations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#171717] uppercase">
                          TOP LOCAL DESIGNATIONS
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                          {locationDetail.job_designations.slice(0, 4).map((desig) => (
                            <div key={desig.name} className="flex items-center justify-between py-1 border-b border-[#D8D2C4]/60 text-[11px]">
                              <span className="text-[#171717]">{desig.name}</span>
                              <span className="text-[#66645F] font-bold">{desig.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience Summary */}
                    {activeMarket.dominant_experience && (
                      <div className="p-3 bg-[#F4F1EA] border border-[#D8D2C4] font-mono text-xs space-y-1">
                        <div className="text-[10px] text-[#66645F] uppercase font-bold">DOMINANT EXPERIENCE TIER</div>
                        <div className="text-[#171717] font-semibold">{activeMarket.dominant_experience}</div>
                      </div>
                    )}

                  </div>
                ) : null}
              </div>

            </div>

            {/* Bottom Summary Bar */}
            <div className="p-4 sm:p-6 bg-[#ECE7DE]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[#66645F] gap-2">
              <div>
                PRIMARY HUB CONCENTRATION: <strong className="text-[#171717]">{locations[0]?.location || 'BENGALURU'}</strong> accounts for <strong className="text-[#FF4D2E]">{locations[0]?.percentage_of_postings}%</strong> of all analyzed job listings.
              </div>
              <div className="text-[#171717] font-semibold">
                SOURCE: ANALYTICS JOBS.CSV LOCATION TELEMETRY
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
