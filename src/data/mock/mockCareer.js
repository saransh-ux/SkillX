/**
 * MOCK DATA: CAREER PREDICTIVE MODELS
 * Aligned with official Junior & Senior Data Scientist datasets.
 */

export const mockJuniorModel = {
  modelName: "Junior Data Scientist Salary Hike Classifier",
  modelType: "Gradient Boosted Classification Tree",
  target: "salary_hike_high_or_low",
  metric: "84.1% Cross-Validated Accuracy",
  baselinePositiveRate: "42.8%",
  description: "Evaluates statistical associations between candidate technical-skill vectors and salary-hike classification outcomes.",
  caveat: "Correlational model signals observed in training corpus; does not assert causal determination.",
  features: [
    { name: "Python", importance: 0.28, rank: "01", category: "Core Programming" },
    { name: "SQL", importance: 0.22, rank: "02", category: "Data Systems" },
    { name: "Machine Learning", importance: 0.18, rank: "03", category: "Modeling" },
    { name: "Data Visualization", importance: 0.12, rank: "04", category: "Analytics" },
    { name: "Statistical Analysis", importance: 0.10, rank: "05", category: "Quantitative Foundations" },
    { name: "Git / Version Control", importance: 0.06, rank: "06", category: "Software Engineering" },
    { name: "Cloud Platforms", importance: 0.04, rank: "07", category: "Infrastructure" }
  ]
};

export const mockSeniorModel = {
  modelName: "Senior Data Scientist Success Classifier",
  modelType: "L2-Regularized Logistic Regression",
  target: "success_classification_high_low",
  metric: "0.86 AUC-ROC",
  baselinePositiveRate: "39.5%",
  description: "Evaluates empirical associations between Big Five psychometric dimensions and high senior success classification.",
  caveat: "Model signal indicates statistical association in empirical dataset; not a measure of innate competency or causal impact.",
  features: [
    {
      name: "Openness",
      importance: 0.26,
      coefficient: "+0.48",
      signalDirection: "Positive association",
      description: "Intellectual exploration, adaptability to ambiguous model paradigms, paradigm flexibility."
    },
    {
      name: "Conscientiousness",
      importance: 0.24,
      coefficient: "+0.44",
      signalDirection: "Positive association",
      description: "Methodical rigor in experiment hygiene, reproducible delivery discipline, validation consistency."
    },
    {
      name: "Extraversion",
      importance: 0.20,
      coefficient: "+0.35",
      signalDirection: "Positive association",
      description: "Cross-functional stakeholder translation, proactive initiative across business partners."
    },
    {
      name: "Agreeableness",
      importance: 0.16,
      coefficient: "+0.28",
      signalDirection: "Positive association",
      description: "Team collaboration, collaborative code review receptivity, collective research orientation."
    },
    {
      name: "Neuroticism",
      importance: 0.14,
      coefficient: "-0.31",
      signalDirection: "Inverse association",
      description: "Lower score associated with emotional composure under high-pressure non-deterministic deliverables."
    }
  ]
};

export function simulateJuniorPrediction(selectedSkills = []) {
  const coreWeights = {
    "Python": 0.32,
    "SQL": 0.26,
    "Machine Learning": 0.21,
    "Data Visualization": 0.14,
    "Statistical Analysis": 0.12,
    "Git / Version Control": 0.08,
    "Cloud Platforms": 0.06
  };

  let totalScore = 0.20; // baseline
  selectedSkills.forEach(s => {
    if (coreWeights[s]) totalScore += coreWeights[s];
  });

  const probability = Math.min(0.96, Math.max(0.12, totalScore));
  const isHigh = probability >= 0.50;

  return {
    target: "salary_hike_high_or_low",
    predictedSalaryHikeClass: isHigh ? "High" : "Low",
    highSalaryHikeProbability: Number(probability.toFixed(3)),
    featureSignals: selectedSkills.map(s => ({
      feature: s,
      importance: coreWeights[s] || 0.05,
      association: "Positively associated with high salary-hike class in model signals."
    })),
    summary: `Technical portfolio containing ${selectedSkills.length} features displays model signal associated with ${isHigh ? 'higher' : 'standard/lower'} salary-hike outcomes.`
  };
}

export function simulateSeniorPrediction(personalityScores = {}) {
  // Big Five scores typically 1.0 - 5.0
  const o = personalityScores.Openness ?? 3.5;
  const c = personalityScores.Conscientiousness ?? 3.5;
  const e = personalityScores.Extraversion ?? 3.5;
  const a = personalityScores.Agreeableness ?? 3.5;
  const n = personalityScores.Neuroticism ?? 2.5;

  // Logistic score
  const linear = 0.45 * (o - 3) + 0.40 * (c - 3) + 0.30 * (e - 3) + 0.22 * (a - 3) - 0.35 * (n - 3);
  const prob = 1 / (1 + Math.exp(-linear));
  const isHigh = prob >= 0.50;

  return {
    target: "success_classification_high_low",
    predictedSuccessClass: isHigh ? "High" : "Low",
    highSuccessProbability: Number(prob.toFixed(3)),
    traitSignals: [
      { trait: "Openness", score: o, association: o >= 3.5 ? "Associated with senior success" : "Below median signal" },
      { trait: "Conscientiousness", score: c, association: c >= 3.5 ? "Associated with senior success" : "Below median signal" },
      { trait: "Extraversion", score: e, association: e >= 3.5 ? "Associated with senior success" : "Below median signal" },
      { trait: "Agreeableness", score: a, association: a >= 3.5 ? "Associated with senior success" : "Below median signal" },
      { trait: "Neuroticism", score: n, association: n <= 2.8 ? "Lower score associated with senior success" : "Elevated signal" }
    ],
    summary: `Trait profile configuration indicates feature weights associated with ${isHigh ? 'high' : 'standard'} senior success classification in the evaluated corpus.`
  };
}

export function simulateCareerScan(payload) {
  const { currentSkills = [], experienceLevel = "Junior", targetRole = "Data Scientist" } = payload;

  const marketSignals = [
    { signal: "Python & SQL foundation appears in 89.2% of relevant postings", source: "EMPIRICAL CORPUS" },
    { signal: "Machine Learning + Data Visualization co-occurrence index: 8.4×", source: "CO-OCCURRENCE NETWORK" },
    { signal: `${experienceLevel} roles prioritize ${experienceLevel === 'Senior' ? 'system architecture & cross-functional leadership' : 'validated core coding and SQL data extraction'}`, source: "ROLE PROFILES" }
  ];

  const modelAssociatedSkills = [
    { skill: "Python", status: currentSkills.includes("Python") ? "Validated in profile" : "Priority acquisition", modelImpact: "High positive association" },
    { skill: "SQL", status: currentSkills.includes("SQL") ? "Validated in profile" : "Priority acquisition", modelImpact: "High positive association" },
    { skill: "Machine Learning", status: currentSkills.includes("Machine Learning") ? "Validated in profile" : "Secondary signal", modelImpact: "Moderate positive association" },
    { skill: "Data Visualization", status: currentSkills.includes("Data Visualization") ? "Validated in profile" : "Secondary signal", modelImpact: "Moderate positive association" }
  ];

  const recommendations = [
    "Prioritize SQL window functions and production query optimization to bridge the primary technical gap.",
    "Develop demonstrable Python projects showcasing end-to-end evaluation pipelines over isolated notebooks.",
    experienceLevel === "Senior"
      ? "Demonstrate cross-functional impact and collaborative model deployment across engineering teams."
      : "Focus on technical feature mastery strongly associated with the high salary-hike classification target."
  ];

  return {
    targetRole,
    experienceLevel,
    marketSignals,
    relevantSkills: ["Python", "SQL", "Machine Learning", "Data Visualization", "Statistical Analysis"],
    modelAssociatedSkills,
    evidenceDerivedRecommendations: recommendations,
    // Note: Do NOT invent probability. highSuccessProbability remains undefined unless validated by backend model.
    highSuccessProbability: null
  };
}
