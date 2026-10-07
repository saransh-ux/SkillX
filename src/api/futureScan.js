/**
 * FUTURE SCAN API MODULE
 * Integrates predictive workforce projection queries with backend ML models.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';

/**
 * Normalizes backend prediction response or fallback projection
 * into the standard frontend contract.
 */
export function normalizeFutureScanResponse(raw, payload = {}) {
  if (!raw) return null;

  const confidence = raw.confidenceScore ?? raw.confidence ?? 92.5;
  const summary =
    raw.recommendation ||
    raw.summary ||
    `In ${payload.industry || 'the sector'} (${payload.region || 'Global'}), the ${payload.role || 'target role'} position shows accelerated transition towards non-deterministic AI tool chains.`;

  // Normalize emerging skills
  const emergentRaw = raw.emergentRequirements || raw.emergingSkills || [];
  const emergentRequirements = emergentRaw.map((item) => {
    if (typeof item === 'string') {
      return { name: item, velocity: '+45.0%', importance: 'CRITICAL' };
    }
    return {
      name: item.name || item.skill || 'EMERGING CAPABILITY',
      velocity: item.velocity || `${item.growth ? (item.growth > 0 ? '+' : '') + item.growth + '%' : '+42.0%'}`,
      importance: item.importance || 'HIGH'
    };
  });

  // Normalize decaying skills
  const decayingRaw = raw.decayingRequirements || raw.decayingSkills || [];
  const decayingRequirements = decayingRaw.map((item) => {
    if (typeof item === 'string') {
      return { name: item, decay: '-40.0%' };
    }
    return {
      name: item.name || item.skill || 'Legacy Practice',
      decay: item.decay || '-35.0%'
    };
  });

  return {
    scanTimestamp: raw.scanTimestamp || new Date().toISOString(),
    confidenceScore: typeof confidence === 'number' ? confidence : 90.0,
    confidence: typeof confidence === 'number' ? confidence : 90.0,
    roleShiftIndex: raw.roleShiftIndex || '+38.6%',
    obsolescenceRisk: raw.obsolescenceRisk || 'MODERATE (22%)',
    recommendation: summary,
    summary,
    emergentRequirements: emergentRequirements.length ? emergentRequirements : [
      { name: "AGENTIC WORKFLOW ORCHESTRATION", velocity: "+48.2%", importance: "CRITICAL" },
      { name: "VECTOR CONTEXT INGESTION & RAG", velocity: "+41.5%", importance: "HIGH" },
      { name: "EVALUATION & DRIFT HARNESSES", velocity: "+33.8%", importance: "HIGH" }
    ],
    decayingRequirements: decayingRequirements.length ? decayingRequirements : [
      { name: "Standard REST CRUD Boilerplate", decay: "-42.0%" },
      { name: "Manual Unit Test Generation", decay: "-55.4%" }
    ],
    emergingSkills: emergentRequirements,
    decayingSkills: decayingRequirements,
    roleEvolution: raw.roleEvolution || [],
    isSimulated: Boolean(raw.isSimulated)
  };
}

/**
 * Local high-fidelity mock fallback generator for development when
 * the FastAPI ML service is unreachable.
 */
function getMockProjection(payload) {
  const { role = 'Software Engineer', industry = 'FinTech', region = 'India', horizon = 2028 } = payload;

  const roleProjections = {
    'Software Engineer': {
      confidenceScore: 94.2,
      roleShiftIndex: "+38.6%",
      obsolescenceRisk: "MODERATE (22%)",
      emergentRequirements: [
        { name: "AGENTIC WORKFLOW ORCHESTRATION", velocity: "+48.2%", importance: "CRITICAL" },
        { name: "VECTOR CONTEXT INGESTION & RAG", velocity: "+41.5%", importance: "HIGH" },
        { name: "EVALUATION & DRIFT HARNESSES", velocity: "+33.8%", importance: "HIGH" },
        { name: "SOVEREIGN ENCLAVE GOVERNANCE", velocity: "+26.1%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Standard REST CRUD Boilerplate", decay: "-42.0%" },
        { name: "Manual Unit Test Generation", decay: "-55.4%" },
        { name: "Static Schema Migration Scripts", decay: "-31.2%" }
      ],
      recommendation: `In ${industry} (${region}), the ${role} position will pivot from deterministic code execution to orchestrating compound non-deterministic AI tool chains towards ${horizon}. Priority investment: multi-agent runtime safety and high-throughput vector ingestion.`
    },
    'Data Engineer': {
      confidenceScore: 92.8,
      roleShiftIndex: "+41.4%",
      obsolescenceRisk: "MODERATE-HIGH (28%)",
      emergentRequirements: [
        { name: "REALTIME VECTOR PIPELINE INDEXING", velocity: "+52.6%", importance: "CRITICAL" },
        { name: "SEMANTIC EMBEDDING STREAMS", velocity: "+44.1%", importance: "HIGH" },
        { name: "APACHE ICEBERG DATA CONTRACTS", velocity: "+36.5%", importance: "HIGH" },
        { name: "AGENTIC MEMORY STORES", velocity: "+31.2%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Batch Cron ETL Pipelines", decay: "-46.8%" },
        { name: "Isolated MapReduce Jobs", decay: "-58.0%" },
        { name: "Manual Data Cleaning Routines", decay: "-49.2%" }
      ],
      recommendation: `In ${industry} (${region}), the ${role} role is transforming from batch warehouse ETL into continuous semantic retrieval fabric and real-time embedding serving for agent swarms.`
    },
    'Solutions Architect': {
      confidenceScore: 95.1,
      roleShiftIndex: "+46.5%",
      obsolescenceRisk: "LOW (14%)",
      emergentRequirements: [
        { name: "COMPOUND MULTI-AGENT TOPOLOGY", velocity: "+58.4%", importance: "CRITICAL" },
        { name: "SOVEREIGN ENCLAVE RUNTIMES", velocity: "+47.0%", importance: "HIGH" },
        { name: "TOKEN FINOPS & INFERENCE GATEWAYS", velocity: "+39.8%", importance: "HIGH" },
        { name: "NON-DETERMINISTIC SAFETY PROTOCOLS", velocity: "+35.3%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Rigid Monolithic Tier Modeling", decay: "-38.5%" },
        { name: "Static Capacity Overprovisioning", decay: "-48.2%" },
        { name: "Purely Deterministic API Boundaries", decay: "-44.0%" }
      ],
      recommendation: `For ${industry} in ${region}, ${role} demands are moving towards non-deterministic model topologies, latency-bound compound agent swarms, and cryptographic enclave isolation towards horizon ${horizon}.`
    },
    'Machine Learning Engineer': {
      confidenceScore: 96.4,
      roleShiftIndex: "+44.0%",
      obsolescenceRisk: "LOW-MODERATE (18%)",
      emergentRequirements: [
        { name: "SPECULATIVE DECODING & KERNEL TUNING", velocity: "+51.7%", importance: "CRITICAL" },
        { name: "RLHF / DIRECT PREFERENCE OPTIMIZATION", velocity: "+45.2%", importance: "HIGH" },
        { name: "EDGE MODEL QUANTIZATION (AWQ/GGUF)", velocity: "+38.4%", importance: "HIGH" },
        { name: "CONTINUOUS SAFETY EVALUATION HARNESSES", velocity: "+34.1%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Manual Feature Engineering", decay: "-52.1%" },
        { name: "Isolated Experimental Notebooks", decay: "-45.0%" },
        { name: "Static Scikit Pipeline Tuning", decay: "-40.6%" }
      ],
      recommendation: `In ${industry} across ${region}, the ${role} is shifting from raw model training to post-training alignment, inference latency optimization, and production evaluation loops.`
    },
    'Cloud Security Engineer': {
      confidenceScore: 93.7,
      roleShiftIndex: "+37.5%",
      obsolescenceRisk: "VERY LOW (9%)",
      emergentRequirements: [
        { name: "RUNTIME eBPF KERNEL TELEMETRY", velocity: "+54.0%", importance: "CRITICAL" },
        { name: "AGENT ZERO-TRUST IDENTITY BOUNDARIES", velocity: "+46.3%", importance: "CRITICAL" },
        { name: "AUTOMATED RED-TEAM HARNESSES", velocity: "+37.9%", importance: "HIGH" },
        { name: "POST-QUANTUM CRYPTOGRAPHIC MIGRATION", velocity: "+28.5%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Static Perimeter Firewall Rules", decay: "-48.7%" },
        { name: "Manual Compliance Auditing", decay: "-62.1%" },
        { name: "Periodic Vulnerability Scan Reports", decay: "-39.4%" }
      ],
      recommendation: `In ${industry} (${region}), the ${role} will require deep runtime eBPF inspection and autonomous credential perimeters to combat machine-speed adversarial agent threats.`
    },
    'Product Systems Lead': {
      confidenceScore: 91.5,
      roleShiftIndex: "+35.2%",
      obsolescenceRisk: "MODERATE (24%)",
      emergentRequirements: [
        { name: "AGENTIC WORKFLOW SPECIFICATION", velocity: "+49.8%", importance: "CRITICAL" },
        { name: "EVALUATION BENCHMARK SYSTEM DESIGN", velocity: "+42.1%", importance: "HIGH" },
        { name: "TOKEN ECONOMICS & LATENCY BUDGETING", velocity: "+36.0%", importance: "HIGH" },
        { name: "HUMAN-IN-THE-LOOP FEEDBACK LOOPS", velocity: "+30.4%", importance: "STRATEGIC" }
      ],
      decayingRequirements: [
        { name: "Traditional Wireframe PRDs", decay: "-47.3%" },
        { name: "Static Feature Roadmaps", decay: "-41.0%" },
        { name: "Manual User Journey Mapping", decay: "-36.5%" }
      ],
      recommendation: `Within ${industry} in ${region}, ${role} workflows are shifting from prescriptive UI mockups to behavioral agent prompt specs and non-deterministic UX governance.`
    }
  };

  const matched = roleProjections[role] || roleProjections['Software Engineer'];
  return {
    ...matched,
    isSimulated: true,
    scanTimestamp: new Date().toISOString()
  };
}

/**
 * POST /api/future-scan
 * Executes a predictive future scan request on the ML model backend.
 * Payload contract:
 * {
 *   role: "Software Engineer",
 *   industry: "Technology",
 *   region: "Global",
 *   horizon: 2030
 * }
 */
export async function runFutureScan(payload) {
  try {
    const data = await apiClient.post('/api/future-scan', payload);
    return normalizeFutureScanResponse(data, payload);
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/future-scan fallback to local simulation:', error.message);
      const mockData = getMockProjection(payload);
      return normalizeFutureScanResponse(mockData, payload);
    }
    throw error;
  }
}
