import React, { useState, useEffect } from 'react';
import { getRoles, getRoleDetail, getRoleSkills } from '../services/api';
import { Briefcase, Layers, MapPin, DollarSign, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export default function RoleEvolution() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleName, setSelectedRoleName] = useState('Data Scientist');
  const [roleDetail, setRoleDetail] = useState(null);
  const [roleSkills, setRoleSkills] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // Load available roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      setError(null);
      try {
        const resp = await getRoles({ limit: 12 });
        const data = resp.data || [];
        setRoles(data);
        if (data.length > 0) {
          // Select Data Scientist if present, else first
          const defaultRole = data.find(r => r.designation.toLowerCase().includes('data scientist')) || data[0];
          setSelectedRoleName(defaultRole.designation);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch roles from /api/roles');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch role detail and role skills when selected role changes
  useEffect(() => {
    if (!selectedRoleName) return;

    let isMounted = true;
    const fetchRoleData = async () => {
      setLoadingDetail(true);
      try {
        const [detailResp, skillsResp] = await Promise.all([
          getRoleDetail(selectedRoleName),
          getRoleSkills(selectedRoleName, 10).catch(() => ({ top_skills: [] })),
        ]);
        if (isMounted) {
          setRoleDetail(detailResp);
          setRoleSkills(skillsResp.top_skills || detailResp.top_skills || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to fetch role details for ${selectedRoleName}`);
        }
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    };
    fetchRoleData();

    return () => {
      isMounted = false;
    };
  }, [selectedRoleName]);

  return (
    <section id="role-evolution" className="border-b border-[#D8D2C4] bg-[#F4F1EA] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C4] pb-6 mb-10 gap-4">
          <div>
            <div className="font-mono text-xs text-[#FF4D2E] font-semibold tracking-editorial uppercase mb-2">
              03 / ROLE MARKET STRUCTURE
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#171717] uppercase">
              ROLE MARKET ARCHITECTURE
            </h2>
            <p className="text-[#66645F] text-base mt-2 font-normal max-w-xl">
              Factual designation profiles derived directly from Analytics Jobs.csv. Real skill requirements, experience distribution, and geographic allocation without fabricated temporal timelines.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs max-w-md">
            <span className="text-[#66645F] uppercase mr-2 hidden sm:inline">ROLES:</span>
            {roles.map((r) => (
              <button
                key={r.role_id}
                onClick={() => setSelectedRoleName(r.designation)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  selectedRoleName === r.designation
                    ? 'bg-[#171717] text-[#F4F1EA] border-[#171717] font-semibold'
                    : 'bg-transparent text-[#66645F] border-[#D8D2C4] hover:text-[#171717] hover:bg-[#ECE7DE]'
                }`}
              >
                {r.designation}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="border border-[#FF4D2E] bg-[#FF4D2E]/10 p-4 mb-8 text-xs font-mono flex items-center justify-between text-[#171717]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF4D2E]" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadingRoles || loadingDetail ? (
          <div className="border border-[#D8D2C4] bg-[#ECE7DE]/20 p-12 text-center text-xs font-mono text-[#66645F] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-[#171717]" />
            <span>FETCHING EMPIRICAL ROLE INTELLIGENCE FROM /api/roles...</span>
          </div>
        ) : roleDetail ? (
          <div>
            {/* Selected Role Meta & Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border border-[#D8D2C4] divide-y sm:divide-y-0 sm:divide-x divide-[#D8D2C4] bg-[#ECE7DE]/40 mb-10 text-xs font-mono">
              <div className="p-4">
                <span className="text-[#66645F] uppercase text-[10px]">VERIFIED POSTINGS</span>
                <div className="font-bold text-[#171717] text-lg mt-0.5">
                  {roleDetail.posting_count.toLocaleString()}
                </div>
              </div>
              <div className="p-4">
                <span className="text-[#66645F] uppercase text-[10px]">MARKET SHARE</span>
                <div className="font-bold text-[#FF4D2E] text-lg mt-0.5">
                  {roleDetail.prevalence_pct.toFixed(2)}%
                </div>
              </div>
              <div className="p-4">
                <span className="text-[#66645F] uppercase text-[10px]">DOMINANT EXPERIENCE</span>
                <div className="font-bold text-[#171717] text-sm mt-0.5">
                  {roleDetail.experience_distribution?.dominant_range || '2-5 yrs'}
                </div>
              </div>
              <div className="p-4">
                <span className="text-[#66645F] uppercase text-[10px]">COMPENSATION BRACKET</span>
                <div className="font-bold text-[#171717] text-sm mt-0.5">
                  {roleDetail.salary_summary?.dominant_bracket || 'Market Standard'}
                </div>
              </div>
            </div>

            {/* Main Empirical Breakdown Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#D8D2C4] bg-[#F4F1EA] p-6 lg:p-8">
              
              {/* Left Column: Top Required Skills */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 text-xs font-mono">
                  <span className="font-bold text-[#171717] uppercase flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF4D2E]" /> TOP REQUIRED SKILLS
                  </span>
                  <span className="text-[#66645F]">WITHIN-ROLE PREVALENCE</span>
                </div>

                <div className="space-y-2.5">
                  {roleSkills.slice(0, 8).map((skill, index) => {
                    const isCore = skill.prevalence_pct >= 25.0;
                    return (
                      <div
                        key={skill.skill_id || skill.display_name}
                        className="p-3 border border-[#D8D2C4] bg-[#ECE7DE]/30 hover:bg-[#ECE7DE] transition-colors font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8B83]">0{index + 1}</span>
                            <span className="font-bold text-[#171717]">{skill.display_name}</span>
                            {isCore && (
                              <span className="w-1.5 h-1.5 bg-[#FF4D2E] inline-block" title="Core Requirement"></span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${isCore ? 'text-[#FF4D2E]' : 'text-[#171717]'}`}>
                              {skill.prevalence_pct.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-[#66645F] ml-1.5">({skill.posting_count} postings)</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-[#D8D2C4] mt-2 overflow-hidden">
                          <div
                            className={`h-full ${isCore ? 'bg-[#FF4D2E]' : 'bg-[#171717]'}`}
                            style={{ width: `${Math.min(100, skill.prevalence_pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Experience & Salary Distributions */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Experience Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 text-xs font-mono">
                    <span className="font-bold text-[#171717] uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF4D2E]" /> EXPERIENCE SPREAD
                    </span>
                    <span className="text-[#66645F]">
                      AVG {roleDetail.experience_distribution?.average_min_years ?? 'N/A'}&ndash;{roleDetail.experience_distribution?.average_max_years ?? 'N/A'} YRS
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {(roleDetail.experience_distribution?.breakdown || []).slice(0, 4).map((exp) => (
                      <div key={exp.bracket} className="p-2.5 border border-[#D8D2C4] bg-[#ECE7DE]/20 flex items-center justify-between">
                        <span className="text-[#171717]">{exp.bracket}</span>
                        <div className="text-right">
                          <span className="font-bold text-[#171717]">{exp.percentage.toFixed(1)}%</span>
                          <span className="text-[10px] text-[#66645F] ml-1">({exp.count})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salary Breakdown if present */}
                {roleDetail.salary_summary && roleDetail.salary_summary.brackets.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 text-xs font-mono">
                      <span className="font-bold text-[#171717] uppercase flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#FF4D2E]" /> COMPENSATION BRACKETS
                      </span>
                      <span className="text-[#66645F]">INR LAKHS/YR</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {roleDetail.salary_summary.brackets.slice(0, 3).map((sal) => (
                        <div key={sal.bracket} className="p-2.5 border border-[#D8D2C4] bg-[#ECE7DE]/20 flex items-center justify-between">
                          <span className="text-[#171717]">{sal.bracket}</span>
                          <div className="text-right">
                            <span className="font-bold text-[#171717]">{sal.percentage.toFixed(1)}%</span>
                            <span className="text-[10px] text-[#66645F] ml-1">({sal.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Geographic Cluster Allocation */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 text-xs font-mono">
                  <span className="font-bold text-[#171717] uppercase flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4D2E]" /> GEOGRAPHIC HUBS
                  </span>
                  <span className="text-[#66645F]">TOP CITIES</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {(roleDetail.location_summary || []).slice(0, 6).map((loc) => (
                    <div key={loc.category} className="p-2.5 border border-[#D8D2C4] bg-[#ECE7DE]/30 flex items-center justify-between">
                      <span className="font-bold text-[#171717]">{loc.category}</span>
                      <span className="text-[#FF4D2E] font-semibold">{loc.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>

                {/* Explicit Data Caveat Box */}
                <div className="pt-3 border-t border-[#D8D2C4] text-[10px] font-mono text-[#66645F] space-y-1">
                  <div className="font-bold text-[#171717]">DATASET: Analytics Jobs.csv</div>
                  <div>Sample Size: {roleDetail.sample_size.toLocaleString()} postings</div>
                  <div className="text-[#8E8B83]">
                    Cross-sectional empirical snapshot. No temporal growth or longitudinal evolution inferred.
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
}
