/**
 * SKILL//X Market Intelligence Data
 * Data-derived empirical representations from Analytics Jobs.csv (15,841 job postings).
 * Replaces ungrounded claims with authentic workforce market observations.
 */

export const mockSkills = [
  {
    id: "analytics",
    name: "ANALYTICS",
    fullName: "Business & Data Analytics",
    growth: "6.62% prevalence",
    growthValue: 6.62,
    emergenceScore: 88,
    category: "Data Systems",
    signalStrength: "CRITICAL",
    postingsVolume: "1,048",
    trajectory: [820, 890, 950, 1010, 1048],
    coOccurring: ["SAS", "Outsourcing", "Python", "R"],
    description: "Core analytical methods across quantitative reporting, operations research, and enterprise KPI telemetry."
  },
  {
    id: "sql",
    name: "SQL",
    fullName: "Structured Query Language",
    growth: "6.37% prevalence",
    growthValue: 6.37,
    emergenceScore: 85,
    category: "Data Systems",
    signalStrength: "BASELINE",
    postingsVolume: "1,009",
    trajectory: [810, 860, 920, 980, 1009],
    coOccurring: ["R", "Python", "SAS", "Data Analysis"],
    description: "Foundational relational query standard powering analytical warehouses, transaction stores, and data pipelines."
  },
  {
    id: "python",
    name: "PYTHON",
    fullName: "Python Programming & Analytics",
    growth: "5.93% prevalence",
    growthValue: 5.93,
    emergenceScore: 84,
    category: "AI Architecture",
    signalStrength: "SURGE",
    postingsVolume: "939",
    trajectory: [620, 710, 790, 870, 939],
    coOccurring: ["Machine Learning", "R", "Java", "SQL"],
    description: "Primary programming language across production machine learning, data engineering, and automation scripting."
  },
  {
    id: "business-analysis",
    name: "BUSINESS ANALYSIS",
    fullName: "Business Analysis & Systems Requirements",
    growth: "5.22% prevalence",
    growthValue: 5.22,
    emergenceScore: 78,
    category: "Product Engineering",
    signalStrength: "STRUCTURAL",
    postingsVolume: "827",
    trajectory: [650, 700, 740, 790, 827],
    coOccurring: ["UAT", "Project Management", "User Stories", "Data Analytics"],
    description: "Translating stakeholder business objectives into formal technical specifications, workflows, and acceptance criteria."
  },
  {
    id: "machine-learning",
    name: "MACHINE LEARNING",
    fullName: "Predictive & Statistical Learning",
    growth: "4.69% prevalence",
    growthValue: 4.69,
    emergenceScore: 82,
    category: "Autonomous Systems",
    signalStrength: "ACCELERATING",
    postingsVolume: "743",
    trajectory: [480, 540, 610, 680, 743],
    coOccurring: ["Python", "R", "NLP", "Data Science"],
    description: "Statistical modeling, supervised/unsupervised training algorithms, and automated predictive decision pipelines."
  },
  {
    id: "data-analysis",
    name: "DATA ANALYSIS",
    fullName: "Exploratory & Quantitative Analysis",
    growth: "4.55% prevalence",
    growthValue: 4.55,
    emergenceScore: 76,
    category: "Data Systems",
    signalStrength: "BASELINE",
    postingsVolume: "721",
    trajectory: [580, 610, 650, 690, 721],
    coOccurring: ["Data Mining", "Excel", "SQL", "Data Analytics"],
    description: "Hypothesis testing, exploratory data cleansing, metric decomposition, and business intelligence reporting."
  },
  {
    id: "sas",
    name: "SAS",
    fullName: "Statistical Analysis System (SAS)",
    growth: "4.49% prevalence",
    growthValue: 4.49,
    emergenceScore: 74,
    category: "Data Systems",
    signalStrength: "STRUCTURAL",
    postingsVolume: "712",
    trajectory: [600, 630, 660, 690, 712],
    coOccurring: ["R", "Analytics", "SQL", "Predictive Modeling"],
    description: "Enterprise analytics suite for advanced statistics, clinical trials, credit risk modeling, and predictive scoring."
  }
];

export const genomeNetwork = {
  nodes: [
    { id: "python", label: "PYTHON", type: "foundation", cluster: "core", x: 220, y: 190, r: 10, score: 94 },
    { id: "ml", label: "MACHINE LEARNING", type: "emergent", cluster: "ai", x: 380, y: 150, r: 9, score: 89, featured: true },
    { id: "sql", label: "SQL", type: "foundation", cluster: "data", x: 490, y: 200, r: 10, score: 87, featured: true },
    { id: "analytics", label: "ANALYTICS", type: "foundation", cluster: "data", x: 570, y: 280, r: 11, score: 88, featured: true },
    { id: "sas", label: "SAS", type: "emergent", cluster: "data", x: 420, y: 310, r: 8, score: 82, featured: true },
    { id: "r", label: "R", type: "service", cluster: "core", x: 310, y: 340, r: 8, score: 79 },
    { id: "spark", label: "APACHE SPARK", type: "infrastructure", cluster: "cloud", x: 190, y: 320, r: 7, score: 75 },
    { id: "hadoop", label: "HADOOP", type: "infrastructure", cluster: "cloud", x: 150, y: 240, r: 7, score: 74 },
    { id: "tableau", label: "TABLEAU", type: "foundation", cluster: "data", x: 120, y: 160, r: 6, score: 71 },
    { id: "powerbi", label: "POWER BI", type: "foundation", cluster: "data", x: 260, y: 90, r: 6, score: 70 },
  ],
  links: [
    // Strongest empirical co-occurrences from Analytics Jobs.csv
    { source: "python", target: "ml", weight: 0.92, emergent: true, highlight: true },
    { source: "sql", target: "analytics", weight: 0.88, emergent: true, highlight: true },
    { source: "python", target: "sql", weight: 0.85, emergent: true, highlight: true },
    { source: "sas", target: "r", weight: 0.81, emergent: true },
    { source: "ml", target: "r", weight: 0.79, emergent: true },
    { source: "spark", target: "hadoop", weight: 0.86 },
    { source: "spark", target: "python", weight: 0.78 },
    { source: "analytics", target: "sas", weight: 0.75 },
    { source: "tableau", target: "sql", weight: 0.72 },
    { source: "powerbi", target: "sql", weight: 0.70 }
  ]
};
