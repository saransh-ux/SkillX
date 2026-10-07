/**
 * SKILL//X Role Market Structure Intelligence
 * Strictly data-derived from Analytics Jobs.csv observations (15,841 job postings).
 * Represents structural skill composition across empirical workforce designations.
 */

export const mockRoles = [
  {
    id: "data-scientist",
    title: "DATA SCIENTIST",
    code: "POSTINGS: 378",
    evolutionIndex: "CORE ROLE",
    volatility: "HIGH DEMAND",
    insight: "Data Scientist roles exhibit heavy clustering around predictive modeling, statistical learning, and Python scripting.",
    summary: "Empirical analysis reveals core emphasis on Machine Learning (51.9%), Python (48.9%), R (39.4%), and Deep Learning (19.6%).",
    metrics: {
      skillHalfLife: "5-10 yrs exp",
      aiAugmentationRatio: "51.9% ML",
      velocityDelta: "10-15L dominant"
    },
    timeline: [
      {
        year: "FOUNDATIONS",
        period: "STATISTICAL CORE",
        focus: "Mathematical & Algorithmic Foundations",
        skills: ["Python", "R", "Statistics", "SQL"],
        dominantParadigm: "Empirical Data Analysis",
        marketPrevalence: "88% of postings"
      },
      {
        year: "SPECIALIZATION",
        period: "MACHINE LEARNING",
        focus: "Supervised & Unsupervised Modeling",
        skills: ["Machine Learning", "Data Mining", "Deep Learning", "NLP"],
        dominantParadigm: "Predictive Decision Systems",
        marketPrevalence: "52% of postings"
      },
      {
        year: "DATA SYSTEMS",
        period: "PIPELINE INTEGRATION",
        focus: "Large-scale Distributed Processing",
        skills: ["Apache Spark", "Hadoop", "MySQL", "Hive"],
        dominantParadigm: "Feature Engineering at Scale",
        marketPrevalence: "34% of postings"
      },
      {
        year: "DELIVERY",
        period: "BUSINESS TRANSLATION",
        focus: "Executive Dashboards & Strategic Storytelling",
        skills: ["Analytics", "Tableau", "Power BI", "Data Analytics"],
        dominantParadigm: "Business Value Realization",
        marketPrevalence: "28% of postings"
      }
    ]
  },
  {
    id: "business-analyst",
    title: "BUSINESS ANALYST",
    code: "POSTINGS: 108",
    evolutionIndex: "BASELINE",
    volatility: "STABLE CORE",
    insight: "Business Analyst positions focus on user acceptance testing, requirement specifications, and workflow documentation.",
    summary: "Major empirical requirements center on Business Analysis (100%), UAT (42.6%), Project Management (33.3%), and SQL (28.7%).",
    metrics: {
      skillHalfLife: "3-8 yrs exp",
      aiAugmentationRatio: "42.6% UAT",
      velocityDelta: "6-10L dominant"
    },
    timeline: [
      {
        year: "FOUNDATIONS",
        period: "DISCOVERY & SPECIFICATION",
        focus: "Functional Requirements & User Stories",
        skills: ["Business Analysis", "User Stories", "BRD", "FRD"],
        dominantParadigm: "Specification Documentation",
        marketPrevalence: "100% of postings"
      },
      {
        year: "VALIDATION",
        period: "QUALITY & TESTING",
        focus: "User Acceptance & Systems Integration",
        skills: ["UAT", "Testing", "Agile", "Scrum"],
        dominantParadigm: "Acceptance Validation",
        marketPrevalence: "43% of postings"
      },
      {
        year: "GOVERNANCE",
        period: "DELIVERY OVERSIGHT",
        focus: "Stakeholder Management & Milestones",
        skills: ["Project Management", "Change Management", "SLA", "KPI"],
        dominantParadigm: "Cross-Functional Alignment",
        marketPrevalence: "33% of postings"
      },
      {
        year: "DATA SYSTEMS",
        period: "QUANTITATIVE VALIDATION",
        focus: "Relational Reporting & Spreadsheets",
        skills: ["SQL", "Excel", "Data Analytics", "Power BI"],
        dominantParadigm: "Empirical Requirement Auditing",
        marketPrevalence: "29% of postings"
      }
    ]
  },
  {
    id: "data-analyst",
    title: "DATA ANALYST",
    code: "POSTINGS: 50",
    evolutionIndex: "CORE ROLE",
    volatility: "STEADY GROWTH",
    insight: "Data Analyst listings prioritize relational extraction, exploratory metric profiling, and executive dashboarding.",
    summary: "Empirical profiles emphasize SQL (62.0%), Advanced Excel (44.0%), Data Analysis (42.0%), and Tableau (26.0%).",
    metrics: {
      skillHalfLife: "2-5 yrs exp",
      aiAugmentationRatio: "62.0% SQL",
      velocityDelta: "6-10L dominant"
    },
    timeline: [
      {
        year: "INGESTION",
        period: "RELATIONAL EXTRACTION",
        focus: "Query Optimization & Warehouses",
        skills: ["SQL", "MySQL", "PostgreSQL", "Data Warehousing"],
        dominantParadigm: "Relational Querying",
        marketPrevalence: "62% of postings"
      },
      {
        year: "PROCESSING",
        period: "METRIC REFINEMENT",
        focus: "Spreadsheets & Statistical Cleansing",
        skills: ["Excel", "Advanced Excel", "VBA", "Data Mining"],
        dominantParadigm: "Exploratory Profiling",
        marketPrevalence: "44% of postings"
      },
      {
        year: "MODELING",
        period: "PROGRAMMATIC ANALYSIS",
        focus: "Scripted Pipelines & Automation",
        skills: ["Python", "R", "Pandas", "Statistics"],
        dominantParadigm: "Automated Data Decomposition",
        marketPrevalence: "36% of postings"
      },
      {
        year: "REPORTING",
        period: "EXECUTIVE TELEMETRY",
        focus: "Visual Analytics & Narrative Storytelling",
        skills: ["Tableau", "Power BI", "Dashboards", "QlikView"],
        dominantParadigm: "Interactive Visualization",
        marketPrevalence: "26% of postings"
      }
    ]
  }
];
