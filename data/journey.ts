export type BuildingStyle =
  | "college"
  | "campus"
  | "lab"
  | "office"
  | "skyline"
  | "chenmed";

export type Stop = {
  id: string;
  /** 1-based order along the route */
  index: number;
  city: string;
  region: string;
  /** Real coordinates, displayed in mono type */
  coords: string;
  org: string;
  role: string;
  dates: string;
  buildingStyle: BuildingStyle;
  /** This stop's identity color — globe marker, street-level signage, panel accents.
      Inspired by each employer's real brand color, tuned to read on a dark map. */
  accent: string;
  /** Same hue, low-alpha — hover fills / soft backgrounds. */
  accentSoft: string;
  /** Real geographic position [latitude, longitude] in degrees — drives the globe */
  latLon: [number, number];
  /** One-line chapter title shown in the panel */
  chapter: string;
  summary: string;
  highlights: string[];
  clients?: string[];
  /** ids into data/projects.ts — rendered as clickable chips */
  projectIds?: string[];
};

export const stops: Stop[] = [
  {
    id: "indore",
    index: 1,
    city: "Indore",
    region: "Madhya Pradesh, India",
    coords: "22.7196° N — 75.8577° E",
    org: "IIST · Diaspark Inc",
    role: "BE Computer Science → Data Analyst",
    dates: "2016 – 2020",
    buildingStyle: "college",
    accent: "#e08a3c",
    accentSoft: "rgba(224, 138, 60, 0.16)",
    latLon: [22.7196, 75.8577],
    chapter: "Where it starts",
    summary:
      "Computer science degree at IIST, then a first taste of real data work at Diaspark — a CMMI Level 5 shop — building executive dashboards and quietly pitching the cloud to anyone who would listen.",
    highlights: [
      "Automated executive dashboards with Power BI and SQL",
      "Built middle tables to turn messy data into something analyzable",
      "Ran Azure seminars for product managers and team leads — the first push toward cloud",
    ],
  },
  {
    id: "boston",
    index: 2,
    city: "Boston",
    region: "Massachusetts, USA",
    coords: "42.3398° N — 71.0892° W",
    org: "Northeastern University",
    role: "MS Information Systems · Grad TA",
    dates: "2020 – 2022",
    buildingStyle: "campus",
    accent: "#e0334f",
    accentSoft: "rgba(224, 51, 79, 0.16)",
    latLon: [42.3398, -71.0892],
    chapter: "The Northeastern years",
    summary:
      "Master's in Information Systems with a heavy data engineering track. TA'd the machine learning course, supervised 20+ graduate ML projects, and did research at AI Skunkworks.",
    highlights: [
      "Grad TA for INFO 6105 Data Science Engineering Methods — hyperparameter tuning, feature engineering, model validation",
      "Supervised 20+ data analytics, ML and deep learning projects on industry-scale datasets",
      "Graduate Research Assistant at AI Skunkworks",
      "Coursework: Data Architecture & BI, Big Data Architecture, Database Management & Distributed Design",
    ],
    projectIds: ["northeastern-projects", "imdb-warehouse"],
  },
  {
    id: "cambridge",
    index: 3,
    city: "Cambridge",
    region: "Massachusetts, USA",
    coords: "42.3736° N — 71.1097° W",
    org: "Eisai US",
    role: "DevOps & Systems Co-op",
    dates: "Jun 2021 – Jan 2022",
    buildingStyle: "lab",
    accent: "#2fa8d6",
    accentSoft: "rgba(47, 168, 214, 0.16)",
    latLon: [42.3736, -71.1097],
    chapter: "First pharma lab",
    summary:
      "Co-op at Eisai's Cambridge campus — first time touching production research infrastructure. Built an end-to-end data pipeline for Johns Hopkins research collaboration while juggling Oracle recovery environments and AWS.",
    highlights: [
      "Automated the Johns Hopkins data transmission pipeline end to end, in direct support of research clients",
      "Worked Oracle Database Recovery independently; S3 + IAM + RDS for external data sharing",
      "Power BI dashboards for lab instrument backup data; Docker + Linux for the SciBite proof of concept",
      "Built the TCO case for moving on-prem workloads to Azure",
    ],
  },
  {
    id: "cary",
    index: 4,
    city: "Cary",
    region: "North Carolina, USA",
    coords: "35.7915° N — 78.7811° W",
    org: "Zifo RnD Solutions",
    role: "Cloud DevOps Engineer",
    dates: "Sep 2022 – Apr 2024",
    buildingStyle: "office",
    accent: "#4caf6e",
    accentSoft: "rgba(76, 175, 110, 0.16)",
    latLon: [35.7915, -78.7811],
    chapter: "Scientific cloud at scale",
    summary:
      "Cloud engineering for biotech and pharma clients — HPC clusters, Azure at depth, and automation across fleets of machines. Became the main Azure engineer for genomics clients.",
    highlights: [
      "Deployed High Performance Computing clusters for scientific workloads",
      "2× faster ELN data retrieval by wiring BlobFuse2 straight into Azure Blob Storage",
      "Ansible-automated Datadog rollout across 150+ machines — 20% better monitoring coverage",
      "Azure AD login automation cut manual interventions by 50%",
    ],
    clients: ["GenBio — HPC & Azure lead", "Prime Medicine — Spotfire on AWS"],
  },
  {
    id: "chicago",
    index: 5,
    city: "Chicago",
    region: "Illinois, USA",
    coords: "41.8781° N — 87.6298° W",
    org: "Zifo RnD Solutions",
    role: "Sr. Cloud Engineer",
    dates: "Apr 2024 – Sep 2025",
    buildingStyle: "skyline",
    accent: "#4caf6e",
    accentSoft: "rgba(76, 175, 110, 0.16)",
    latLon: [41.8781, -87.6298],
    chapter: "Senior years, bigger clients",
    summary:
      "Promoted to senior, moved to Chicago, and went deep on AI infrastructure for big pharma — a medical LLM on EKS, GPU and LLM monitoring for AbbVie, and full infrastructure-as-code migrations.",
    highlights: [
      "Built cloud infra for a medical Generative AI LLM on an EKS cluster",
      "Migrated a biotech's entire AWS estate from console click-ops to AWS CDK in Python",
      "Led Datadog POCs for big pharma — APM + dashboards cut infrastructure cost by 30%",
      "GPU and LLM monitoring for AbbVie, onsite in Chicago",
    ],
    clients: [
      "AbbVie — Datadog, GPU & LLM monitoring",
      "Genentech — EKS + L7ESP deployments",
      "Empress Bio — console → CDK migration, Seqera pipelines",
    ],
    projectIds: ["rag-zifo", "multillm"],
  },
  {
    id: "miami",
    index: 6,
    city: "Miami",
    region: "Florida, USA",
    coords: "25.7617° N — 80.1918° W",
    org: "ChenMed",
    role: "Sales Ops Analyst → AI Engineer",
    dates: "Dec 2025 – present",
    buildingStyle: "chenmed",
    accent: "#2fb5a8",
    accentSoft: "rgba(47, 181, 168, 0.16)",
    latLon: [25.7617, -80.1918],
    chapter: "Building 3 → Building 1",
    summary:
      "Joined ChenMed as a sales ops analyst in Building 3. Built an AI agent pipeline good enough that six months later the job title caught up — now an AI engineer in Building 1, shipping production LangChain & LangGraph agents as an internal forward-deployed engineer.",
    highlights: [
      "Designed an AI agent that pulls patient files from Salesforce, reads PDF attachments, determines MGC payment eligibility, and updates the books — saving 10+ hours of manual work a week",
      "Rebuilt the internal chatbot with a no-vector-DB RAG design over Monday.com documentation",
      "Now building and monitoring production AI agents with LangChain & LangGraph",
    ],
    projectIds: ["clara-voiceops", "property-management", "alert-dispatcher"],
  },
];
