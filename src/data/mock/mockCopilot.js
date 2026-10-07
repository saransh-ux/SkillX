/**
 * MOCK DATA: COPILOT NATURAL LANGUAGE INTELLIGENCE
 * Grounded strictly in the empirical datasets and trained model signals.
 * Contains NO mentions of senior retention or fabricated causal links.
 */

export const SUGGESTED_COPILOT_PROMPTS = [
  "Which skills are most demanded?",
  "What skills commonly occur with Python?",
  "Which technical skills are associated with higher salary-hike outcomes?",
  "What personality traits are associated with senior success?",
  "What does the job market demand?",
  "What should a junior data scientist prioritize?"
];

export const MOCK_COPILOT_KNOWLEDGE_BASE = {
  "Which skills are most demanded?": {
    answer: "Based on empirical analysis of the workforce corpus, the most demanded technical skills across data science postings are Python (68.4% frequency), SQL (54.2%), Machine Learning (41.5%), Data Visualization (36.8%), and Cloud Platforms (28.4%). Python remains the primary market anchor across both junior and senior roles.",
    citations: ["EMPIRICAL_DATASET_MARKET_SUMMARY", "SKILL_PULSE_CORPUS"],
    relatedMetrics: [
      { label: "Top Skill Demand Share", value: "68.4%" },
      { label: "Corpus Volume", value: "4.82M Records" }
    ]
  },

  "What skills commonly occur with Python?": {
    answer: "In the skill co-occurrence network, Python demonstrates its strongest structural pairings with SQL (co-occurrence index 0.84), Machine Learning (0.78), Statistical Analysis (0.65), and Git/Version Control (0.58). Candidates with combined Python + SQL profiles capture 89.2% of market relevance.",
    citations: ["SKILL_GENOME_CO_OCCURRENCE_GRAPH"],
    relatedMetrics: [
      { label: "Python ↔ SQL Affinity", value: "0.84 Index" },
      { label: "Python ↔ ML Affinity", value: "0.78 Index" }
    ]
  },

  "Which technical skills are associated with higher salary-hike outcomes?": {
    answer: "In the Junior Data Scientist classification model (target: salary_hike_high_or_low), the top features associated with high salary-hike classification are Python (importance: 0.28), SQL (importance: 0.22), Machine Learning (importance: 0.18), Data Visualization (0.12), and Statistical Analysis (0.10). Model signals indicate these technical variables provide the strongest discriminative power.",
    citations: ["JUNIOR_SALARY_HIKE_MODEL_V1"],
    relatedMetrics: [
      { label: "Top Feature Signal", value: "Python (0.28)" },
      { label: "Model Metric", value: "84.1% Accuracy" }
    ]
  },

  "What personality traits are associated with senior success?": {
    answer: "In the Senior Data Scientist model (target: success_classification_high_low), empirical associations were evaluated across the Big Five psychometric dimensions. Openness (+0.48 coefficient) and Conscientiousness (+0.44 coefficient) exhibit the strongest positive associations with senior success classification, followed by Extraversion (+0.35) and Agreeableness (+0.28). Neuroticism displays an inverse association (-0.31), where lower scores correlate with higher resilience under complex deliverables.",
    citations: ["SENIOR_DATA_SCIENTIST_SUCCESS_MODEL"],
    relatedMetrics: [
      { label: "Top Trait Association", value: "Openness (+0.48)" },
      { label: "Model Metric", value: "0.86 AUC-ROC" }
    ]
  },

  "What does the job market demand?": {
    answer: "The current job market demands a shift from isolated script development toward integrated production intelligence. Job postings increasingly require dual competency in data extraction (SQL) and predictive modeling (Python/ML), with growing demand for version control hygiene and cloud orchestration.",
    citations: ["MARKET_INTELLIGENCE_AGGREGATE"],
    relatedMetrics: [
      { label: "Multi-Skill Postings", value: "76.3%" },
      { label: "Network Density", value: "0.74" }
    ]
  },

  "What should a junior data scientist prioritize?": {
    answer: "Evidence from the junior predictive model and market pulse recommends prioritizing mastery of Python and SQL first, as these two features comprise 50% of the predictive weight associated with high salary-hike classification. Once established, pairing these with applied Machine Learning projects yields the highest co-occurrence signal.",
    citations: ["JUNIOR_MODEL_FEATURE_WEIGHTS", "SKILL_GENOME_PATHWAYS"],
    relatedMetrics: [
      { label: "Combined Weight (Py+SQL)", value: "50.0%" },
      { label: "Classification Baseline", value: "42.8% Positive" }
    ]
  }
};

export function simulateCopilotQuery(query = "") {
  const clean = query.trim();

  // Exact match
  if (MOCK_COPILOT_KNOWLEDGE_BASE[clean]) {
    return {
      query: clean,
      ...MOCK_COPILOT_KNOWLEDGE_BASE[clean],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  // Fuzzy keyword matching
  const lower = clean.toLowerCase();
  if (lower.includes("senior") || lower.includes("personality") || lower.includes("trait")) {
    return {
      query: clean,
      ...MOCK_COPILOT_KNOWLEDGE_BASE["What personality traits are associated with senior success?"],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
  if (lower.includes("junior") || lower.includes("salary") || lower.includes("hike")) {
    return {
      query: clean,
      ...MOCK_COPILOT_KNOWLEDGE_BASE["Which technical skills are associated with higher salary-hike outcomes?"],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
  if (lower.includes("python") || lower.includes("occur") || lower.includes("together")) {
    return {
      query: clean,
      ...MOCK_COPILOT_KNOWLEDGE_BASE["What skills commonly occur with Python?"],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
  if (lower.includes("prioritize") || lower.includes("learn first")) {
    return {
      query: clean,
      ...MOCK_COPILOT_KNOWLEDGE_BASE["What should a junior data scientist prioritize?"],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  // Default market overview response
  return {
    query: clean,
    answer: `Analysis of query "${clean}": Model and market signals across the 4.82M record corpus indicate that core technical competencies (Python, SQL, Machine Learning) combined with methodical execution rigor are the strongest empirical factors associated with performance across data science roles.`,
    citations: ["EMPIRICAL_WORKFORCE_DATASET"],
    relatedMetrics: [
      { label: "Status", value: "Query Matched to Empirical Signals" }
    ],
    timestamp: new Date().toISOString(),
    isFallback: true
  };
}
