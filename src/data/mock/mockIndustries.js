/**
 * MOCK DATA: INDUSTRY LEVEL SKILL ADOPTION
 * Represents industry-level adoption differentials across major sectors.
 */

export const mockIndustries = [
  {
    skillKey: "ai-agents",
    skillLabel: "AI AGENTS",
    definition: "Autonomous agent execution frameworks with external tool integration",
    medianAdoption: "60.0%",
    sectors: [
      {
        name: "TECHNOLOGY",
        code: "TECH",
        adoptionRate: 88,
        yoyGrowth: "+44.2%",
        penetrationLevel: "ACCELERATING EXPONENTIAL",
        rank: "01",
        primaryUseCases: "Self-healing code pipelines, autonomous QA, dev agent swarms"
      },
      {
        name: "CYBERSECURITY",
        code: "CYBER",
        adoptionRate: 71,
        yoyGrowth: "+49.8%",
        penetrationLevel: "HIGH URGENCY",
        rank: "02",
        primaryUseCases: "Automated threat response, proactive red-teaming, forensic triage"
      },
      {
        name: "FINANCE",
        code: "FIN",
        adoptionRate: 64,
        yoyGrowth: "+38.1%",
        penetrationLevel: "CONTROLLED ROLLOUT",
        rank: "03",
        primaryUseCases: "Algorithmic audit analysis, compliance scanning, fraud synthesis"
      },
      {
        name: "HEALTHCARE",
        code: "HLTH",
        adoptionRate: 42,
        yoyGrowth: "+29.4%",
        penetrationLevel: "VALIDATION PHASE",
        rank: "04",
        primaryUseCases: "Clinical trial cohort synthesis, documentation summarization"
      },
      {
        name: "RETAIL",
        code: "RTL",
        adoptionRate: 35,
        yoyGrowth: "+21.0%",
        penetrationLevel: "EARLY PILOTS",
        rank: "05",
        primaryUseCases: "Dynamic supply chain rebalancing, customer concierge routing"
      }
    ]
  },
  {
    skillKey: "rag",
    skillLabel: "RAG PIPELINES",
    definition: "Retrieval-augmented grounding systems across proprietary data stores",
    medianAdoption: "68.2%",
    sectors: [
      {
        name: "TECHNOLOGY",
        code: "TECH",
        adoptionRate: 92,
        yoyGrowth: "+39.5%",
        penetrationLevel: "STANDARD COMMODITY",
        rank: "01",
        primaryUseCases: "Internal codebase search, technical documentation QA"
      },
      {
        name: "FINANCE",
        code: "FIN",
        adoptionRate: 78,
        yoyGrowth: "+42.1%",
        penetrationLevel: "EXPANDED PRODUCTION",
        rank: "02",
        primaryUseCases: "SEC filings extraction, regulatory compliance synthesis"
      },
      {
        name: "CYBERSECURITY",
        code: "CYBER",
        adoptionRate: 66,
        yoyGrowth: "+36.7%",
        penetrationLevel: "ACTIVE SCALE",
        rank: "03",
        primaryUseCases: "Threat intelligence database indexing, CVE semantic mapping"
      },
      {
        name: "HEALTHCARE",
        code: "HLTH",
        adoptionRate: 61,
        yoyGrowth: "+33.2%",
        penetrationLevel: "CONTROLLED PIPELINE",
        rank: "04",
        primaryUseCases: "Medical journal lookup, HIPAA-compliant patient record query"
      },
      {
        name: "RETAIL",
        code: "RTL",
        adoptionRate: 44,
        yoyGrowth: "+27.8%",
        penetrationLevel: "INITIAL DEPLOYMENT",
        rank: "05",
        primaryUseCases: "Catalog semantic search, customer support resolution"
      }
    ]
  },
  {
    skillKey: "vector-infra",
    skillLabel: "VECTOR DATABASES",
    definition: "Dedicated vector embeddings storage, clustering, and hybrid retrieval",
    medianAdoption: "54.0%",
    sectors: [
      {
        name: "TECHNOLOGY",
        code: "TECH",
        adoptionRate: 84,
        yoyGrowth: "+33.0%",
        penetrationLevel: "CORE INFRASTRUCTURE",
        rank: "01",
        primaryUseCases: "Recommendation embeddings, code intelligence engines"
      },
      {
        name: "FINANCE",
        code: "FIN",
        adoptionRate: 59,
        yoyGrowth: "+37.4%",
        penetrationLevel: "ACCELERATING",
        rank: "02",
        primaryUseCases: "Document semantic clustering, portfolio risk similarity"
      },
      {
        name: "CYBERSECURITY",
        code: "CYBER",
        adoptionRate: 58,
        yoyGrowth: "+41.2%",
        penetrationLevel: "ACCELERATING",
        rank: "03",
        primaryUseCases: "Malware behavior fingerprinting, graph attack vectors"
      },
      {
        name: "HEALTHCARE",
        code: "HLTH",
        adoptionRate: 38,
        yoyGrowth: "+26.5%",
        penetrationLevel: "EXPLORATORY",
        rank: "04",
        primaryUseCases: "Genomic sequence alignment, diagnostic imaging embeddings"
      },
      {
        name: "RETAIL",
        code: "RTL",
        adoptionRate: 31,
        yoyGrowth: "+19.8%",
        penetrationLevel: "EARLY EVALUATION",
        rank: "05",
        primaryUseCases: "Visual product match, shopper preference vectors"
      }
    ]
  },
  {
    skillKey: "cloud-sec",
    skillLabel: "CLOUD SECURITY",
    definition: "Identity perimeter, eBPF telemetry, and zero-trust mesh isolation",
    medianAdoption: "86.0%",
    sectors: [
      {
        name: "CYBERSECURITY",
        code: "CYBER",
        adoptionRate: 99,
        yoyGrowth: "+18.2%",
        penetrationLevel: "SATURATED MANDATORY",
        rank: "01",
        primaryUseCases: "Continuous posture evaluation, runtime eBPF inspection"
      },
      {
        name: "TECHNOLOGY",
        code: "TECH",
        adoptionRate: 96,
        yoyGrowth: "+22.4%",
        penetrationLevel: "UNIVERSAL BASELINE",
        rank: "02",
        primaryUseCases: "Cloud provider posture management, least-privilege IAM"
      },
      {
        name: "FINANCE",
        code: "FIN",
        adoptionRate: 94,
        yoyGrowth: "+25.1%",
        penetrationLevel: "REGULATORY MANDATE",
        rank: "03",
        primaryUseCases: "PCI-DSS isolation, sovereign enclave cryptographic vaults"
      },
      {
        name: "HEALTHCARE",
        code: "HLTH",
        adoptionRate: 89,
        yoyGrowth: "+27.9%",
        penetrationLevel: "HIGH PRIORITY",
        rank: "04",
        primaryUseCases: "HITRUST compliance, encrypted telehealth conduits"
      },
      {
        name: "RETAIL",
        code: "RTL",
        adoptionRate: 72,
        yoyGrowth: "+19.5%",
        penetrationLevel: "EXPANDING CORE",
        rank: "05",
        primaryUseCases: "Payment gateway isolation, e-commerce cloud hardening"
      }
    ]
  }
];
