/**
 * MOCK DATA NOTICE:
 * Represents longitudinal role transition trajectories from 2023 to 2026.
 * Target backend endpoint: GET /api/v1/roles/evolution?role={roleId}
 */

export const mockRoles = [
  {
    id: "software-engineer",
    title: "SOFTWARE ENGINEER",
    code: "SOC:15-1252.00",
    evolutionIndex: "+41.8%",
    volatility: "HIGH",
    insight: "Software engineering roles are increasingly combining traditional development skills with AI and cloud capabilities.",
    summary: "Shift from procedural algorithmic coding to composite orchestration of LLM runtimes, vector context windows, and distributed container systems.",
    metrics: {
      skillHalfLife: "18 months",
      aiAugmentationRatio: "64%",
      velocityDelta: "+31.4%"
    },
    timeline: [
      {
        year: "2023",
        period: "FOUNDATIONAL PHASE",
        focus: "Monolithic & Microservice REST Fundamentals",
        skills: ["Python", "SQL", "Git", "REST API"],
        dominantParadigm: "Procedural Business Logic",
        marketPrevalence: "94%"
      },
      {
        year: "2024",
        period: "CLOUD ADOPTION PHASE",
        focus: "Containerization & Cloud Native Delivery",
        skills: ["Python", "AWS", "Docker", "CI/CD"],
        dominantParadigm: "Distributed Microservices",
        marketPrevalence: "88%"
      },
      {
        year: "2025",
        period: "AI INTEGRATION PHASE",
        focus: "Context Retrieval & Direct Model Invocation",
        skills: ["Cloud", "AI APIs", "RAG", "LLMs"],
        dominantParadigm: "Augmented Intelligence",
        marketPrevalence: "72%"
      },
      {
        year: "2026",
        period: "AGENTIC SYNTHESIS PHASE",
        focus: "Autonomous Agent Tooling & Realtime Context",
        skills: ["AI AGENTS", "RAG", "LLM APPLICATIONS", "CLOUD"],
        dominantParadigm: "Autonomous System Orchestration",
        marketPrevalence: "58% (Frontier Emerging)"
      }
    ]
  },
  {
    id: "data-engineer",
    title: "DATA ENGINEER",
    code: "SOC:15-1243.00",
    evolutionIndex: "+37.2%",
    volatility: "MODERATE-HIGH",
    insight: "Data engineering is pivoting from batch analytics reporting into real-time vector retrieval, embedding indices, and semantic pipelines.",
    summary: "Transition from scheduled cron data lakes to real-time streaming retrieval, hybrid search indexing, and evaluation data pipelines.",
    metrics: {
      skillHalfLife: "15 months",
      aiAugmentationRatio: "58%",
      velocityDelta: "+29.0%"
    },
    timeline: [
      {
        year: "2023",
        period: "BATCH PIPELINE",
        focus: "ETL / ELT Warehousing",
        skills: ["Hadoop", "Spark", "SQL", "Airflow"],
        dominantParadigm: "Scheduled Batch Transformation",
        marketPrevalence: "92%"
      },
      {
        year: "2024",
        period: "LAKEHOUSE MATURITY",
        focus: "Modern Data Stack & Cloud Stores",
        skills: ["Snowflake", "dbt", "Kafka", "Databricks"],
        dominantParadigm: "Unified Lakehouse Analytics",
        marketPrevalence: "85%"
      },
      {
        year: "2025",
        period: "HYBRID VECTOR STACK",
        focus: "Embedding Generation & Retrieval Pipelines",
        skills: ["Vector DBs", "Streaming ETL", "Data Contracts", "Iceberg"],
        dominantParadigm: "Semantic Feature Stores",
        marketPrevalence: "69%"
      },
      {
        year: "2026",
        period: "REALTIME SEMANTIC FABRIC",
        focus: "Continuous Agent Memory & Context Serving",
        skills: ["VECTOR PIPELINES", "RAG INDEXING", "DATA GOVERNANCE", "REALTIME EMBEDDINGS"],
        dominantParadigm: "Agentic Memory Systems",
        marketPrevalence: "51% (Frontier Emerging)"
      }
    ]
  },
  {
    id: "solutions-architect",
    title: "SOLUTIONS ARCHITECT",
    code: "SOC:15-1299.08",
    evolutionIndex: "+46.5%",
    volatility: "VERY HIGH",
    insight: "Architects are abandoning purely static service boundaries in favor of non-deterministic model orchestrations and multi-agent safety topologies.",
    summary: "System design now centers around prompt-token economics, latency bounds for compound agent calls, and sovereign infrastructure guarantees.",
    metrics: {
      skillHalfLife: "14 months",
      aiAugmentationRatio: "72%",
      velocityDelta: "+44.1%"
    },
    timeline: [
      {
        year: "2023",
        period: "ENTERPRISE CLOUD",
        focus: "Multi-Cloud Governance & Security",
        skills: ["Multi-Cloud", "Microservices", "TOGAF", "Security"],
        dominantParadigm: "Deterministic N-Tier Architecture",
        marketPrevalence: "96%"
      },
      {
        year: "2024",
        period: "EVENT-DRIVEN SCALE",
        focus: "Zero-Trust Mesh & Resilience",
        skills: ["Event-Driven", "Kubernetes", "Cost Opt", "Zero Trust"],
        dominantParadigm: "Service Mesh Orchestration",
        marketPrevalence: "87%"
      },
      {
        year: "2025",
        period: "AI INFRASTRUCTURE",
        focus: "LLM Gateways & Cost Containment",
        skills: ["Hybrid AI", "Model Serving", "LLM Gateways", "FinOps"],
        dominantParadigm: "Gateway Inference Systems",
        marketPrevalence: "74%"
      },
      {
        year: "2026",
        period: "COMPOUND AGENT TOPOLOGY",
        focus: "Autonomous Multi-Agent Networks & Safety",
        skills: ["MULTI-AGENT ORCHESTRATION", "COMPOUND AI SYSTEMS", "SOVEREIGN INFRA", "EDGE RUNTIMES"],
        dominantParadigm: "Non-Deterministic Agent Swarms",
        marketPrevalence: "49% (Frontier Emerging)"
      }
    ]
  }
];
