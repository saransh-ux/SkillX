/**
 * MOCK DATA: SKILL INTELLIGENCE CORPUS
 * Used as high-fidelity fallback when the FastAPI + ML backend is unavailable.
 */

export const mockSkills = [
  {
    id: "rag",
    name: "RAG",
    fullName: "Retrieval-Augmented Generation",
    growth: "+37.4%",
    growthValue: 37.4,
    emergenceScore: 87,
    category: "AI Architecture",
    signalStrength: "CRITICAL",
    postingsVolume: "142,800",
    trajectory: [42, 51, 63, 74, 87],
    coOccurring: ["Vector Databases", "AI Agents", "Python", "FastAPI"],
    description: "Architectural paradigm combining vector embeddings with LLM inference for grounded context retrieval."
  },
  {
    id: "ai-agents",
    name: "AI AGENTS",
    fullName: "Autonomous Multi-Agent Systems",
    growth: "+31.8%",
    growthValue: 31.8,
    emergenceScore: 82,
    category: "Autonomous Systems",
    signalStrength: "SURGE",
    postingsVolume: "98,400",
    trajectory: [28, 39, 54, 69, 82],
    coOccurring: ["RAG", "Tool Calling", "LangChain", "FastAPI"],
    description: "Goal-directed software agents leveraging planning loops, tool execution, and self-reflection patterns."
  },
  {
    id: "vector-dbs",
    name: "VECTOR DATABASES",
    fullName: "Vector Storage & Retrieval",
    growth: "+28.5%",
    growthValue: 28.5,
    emergenceScore: 79,
    category: "Data Systems",
    signalStrength: "ACCELERATING",
    postingsVolume: "112,300",
    trajectory: [34, 48, 61, 71, 79],
    coOccurring: ["RAG", "pgvector", "Pinecone", "Python"],
    description: "Specialized high-dimensional indexing and similarity search engines for semantic and multimodal data."
  },
  {
    id: "llm-apps",
    name: "LLM APPLICATIONS",
    fullName: "Production LLM Engineering",
    growth: "+26.2%",
    growthValue: 26.2,
    emergenceScore: 76,
    category: "Product Engineering",
    signalStrength: "STABLE GROWTH",
    postingsVolume: "189,500",
    trajectory: [45, 56, 68, 73, 76],
    coOccurring: ["Prompt Systems", "Evaluation", "TypeScript", "Python"],
    description: "End-to-end user-facing applications integrating foundational models with enterprise application logic."
  },
  {
    id: "cloud-sec",
    name: "CLOUD SECURITY",
    fullName: "Cloud Native Zero-Trust Security",
    growth: "+19.4%",
    growthValue: 19.4,
    emergenceScore: 71,
    category: "Security & Governance",
    signalStrength: "STRUCTURAL",
    postingsVolume: "210,000",
    trajectory: [58, 62, 65, 68, 71],
    coOccurring: ["Kubernetes", "IAM", "eBPF", "AWS"],
    description: "Defense-in-depth security architectures for ephemeral, distributed container and microservice environments."
  },
  {
    id: "kubernetes",
    name: "KUBERNETES",
    fullName: "Container Orchestration",
    growth: "+14.1%",
    growthValue: 14.1,
    emergenceScore: 65,
    category: "Infrastructure",
    signalStrength: "BASELINE",
    postingsVolume: "345,000",
    trajectory: [60, 61, 63, 64, 65],
    coOccurring: ["Docker", "Terraform", "Cloud Security", "CI/CD"],
    description: "The ubiquitous standard for automating deployment, scaling, and operational management of containerized workloads."
  }
];

export const genomeNetwork = {
  nodes: [
    { id: "python", label: "PYTHON", type: "foundation", cluster: "core", x: 220, y: 190, r: 8, score: 94 },
    { id: "llm", label: "LLM", type: "frontier", cluster: "ai", x: 380, y: 150, r: 7, score: 89 },
    { id: "rag", label: "RAG", type: "emergent", cluster: "ai", x: 490, y: 200, r: 10, score: 87, featured: true },
    { id: "vector", label: "VECTOR DATABASE", type: "emergent", cluster: "ai", x: 570, y: 280, r: 9, score: 79, featured: true },
    { id: "agents", label: "AI AGENTS", type: "emergent", cluster: "ai", x: 420, y: 310, r: 11, score: 82, featured: true },
    { id: "fastapi", label: "FASTAPI", type: "service", cluster: "core", x: 310, y: 340, r: 6, score: 75 },
    { id: "aws", label: "AWS", type: "infrastructure", cluster: "cloud", x: 190, y: 320, r: 7, score: 88 },
    { id: "k8s", label: "KUBERNETES", type: "infrastructure", cluster: "cloud", x: 150, y: 240, r: 7, score: 83 },
    { id: "docker", label: "DOCKER", type: "foundation", cluster: "cloud", x: 120, y: 160, r: 6, score: 81 },
    { id: "cicd", label: "CI/CD", type: "foundation", cluster: "cloud", x: 260, y: 90, r: 5, score: 78 }
  ],
  links: [
    { source: "rag", target: "agents", weight: 0.94, emergent: true, highlight: true },
    { source: "agents", target: "vector", weight: 0.91, emergent: true, highlight: true },
    { source: "rag", target: "vector", weight: 0.89, emergent: true, highlight: true },
    { source: "llm", target: "rag", weight: 0.85, emergent: true },
    { source: "llm", target: "agents", weight: 0.82, emergent: true },
    { source: "python", target: "llm", weight: 0.78 },
    { source: "python", target: "fastapi", weight: 0.81 },
    { source: "fastapi", target: "agents", weight: 0.74 },
    { source: "python", target: "rag", weight: 0.76 },
    { source: "aws", target: "k8s", weight: 0.79 },
    { source: "docker", target: "k8s", weight: 0.88 },
    { source: "docker", target: "python", weight: 0.65 },
    { source: "cicd", target: "docker", weight: 0.72 },
    { source: "aws", target: "fastapi", weight: 0.61 },
    { source: "vector", target: "aws", weight: 0.58 }
  ]
};
