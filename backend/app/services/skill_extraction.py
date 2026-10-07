"""
Robust skill extraction, canonicalization, and normalization engine for Analytics Jobs.csv.
Extracts and normalizes skills from the primary source: Analytics Jobs.key_skills.

Normalization rules:
- Internal lowercase representation
- Trim whitespace and remove artifacts/ellipses/delimiters
- Normalize obvious punctuation variations (e.g., PL/SQL vs PLSQL, Power BI vs PowerBI, C++ vs C ++)
- Preserve human-readable canonical display names
- Do not aggressively merge unrelated skills (e.g. MySQL, PostgreSQL, Oracle SQL, NoSQL remain distinct)
- Deduplicate skill mentions within each job posting
"""
import re
from typing import List, Dict, Optional, Tuple, Set, Any

# Known acronyms that should be formatted uppercase in display names
ACRONYMS = {
    "sql", "plsql", "pl/sql", "t-sql", "tsql", "sas", "aws", "gcp", "azure", "etl", "elt", "bi",
    "ml", "ai", "nlp", "cv", "ui", "ux", "r", "c", "c++", "c#", ".net", "api",
    "apis", "rest", "soap", "ci/cd", "devops", "dba", "ebs", "erp", "crm", "sap",
    "hr", "seo", "sem", "smo", "ppc", "smm", "pr", "b2b", "b2c", "kpi", "sla",
    "bfsi", "itil", "iot", "sdlc", "qa", "qc", "vba", "html", "css", "xml", "json",
    "poc", "ocr", "svd", "pca", "arima", "rnn", "cnn", "lstm", "bert", "llm"
}

# Standard canonical dictionary for common variants, abbreviations, and punctuation variations:
# Format: raw_lowercase_pattern -> (skill_id, canonical_name, display_name)
CANONICAL_ALIASES: Dict[str, Tuple[str, str, str]] = {
    # Core Languages & Environments
    "sql": ("sql", "sql", "SQL"),
    "structured query language": ("sql", "sql", "SQL"),
    "pl/sql": ("pl-sql", "pl/sql", "PL/SQL"),
    "plsql": ("pl-sql", "pl/sql", "PL/SQL"),
    "pl sql": ("pl-sql", "pl/sql", "PL/SQL"),
    "pl - sql": ("pl-sql", "pl/sql", "PL/SQL"),
    "t-sql": ("t-sql", "t-sql", "T-SQL"),
    "tsql": ("t-sql", "t-sql", "T-SQL"),
    "t - sql": ("t-sql", "t-sql", "T-SQL"),
    "python": ("python", "python", "Python"),
    "py": ("python", "python", "Python"),
    "r": ("r", "r", "R"),
    "r programming": ("r", "r", "R"),
    "r language": ("r", "r", "R"),
    "c": ("c", "c", "C"),
    "c++": ("c-plus-plus", "c++", "C++"),
    "c ++": ("c-plus-plus", "c++", "C++"),
    "c#": ("c-sharp", "c#", "C#"),
    "c #": ("c-sharp", "c#", "C#"),
    ".net": ("dot-net", ".net", ".NET"),
    "dotnet": ("dot-net", ".net", ".NET"),
    ". net": ("dot-net", ".net", ".NET"),
    "java": ("java", "java", "Java"),
    "javascript": ("javascript", "javascript", "JavaScript"),
    "js": ("javascript", "javascript", "JavaScript"),
    "typescript": ("typescript", "typescript", "TypeScript"),
    "ts": ("typescript", "typescript", "TypeScript"),
    "scala": ("scala", "scala", "Scala"),
    "julia": ("julia", "julia", "Julia"),
    "go": ("golang", "go", "Go"),
    "golang": ("golang", "go", "Go"),
    "php": ("php", "php", "PHP"),
    "ruby": ("ruby", "ruby", "Ruby"),
    "perl": ("perl", "perl", "Perl"),
    "bash": ("bash", "bash", "Bash"),
    "shell": ("shell-scripting", "shell scripting", "Shell Scripting"),
    "shell scripting": ("shell-scripting", "shell scripting", "Shell Scripting"),

    # AI / ML / Data Science
    "machine learning": ("machine-learning", "machine learning", "Machine Learning"),
    "ml": ("machine-learning", "machine learning", "Machine Learning"),
    "deep learning": ("deep-learning", "deep learning", "Deep Learning"),
    "dl": ("deep-learning", "deep learning", "Deep Learning"),
    "artificial intelligence": ("artificial-intelligence", "artificial intelligence", "Artificial Intelligence"),
    "ai": ("artificial-intelligence", "artificial intelligence", "Artificial Intelligence"),
    "data science": ("data-science", "data science", "Data Science"),
    "data analysis": ("data-analysis", "data analysis", "Data Analysis"),
    "data analytics": ("data-analytics", "data analytics", "Data Analytics"),
    "analytics": ("analytics", "analytics", "Analytics"),
    "natural language processing": ("nlp", "natural language processing", "Natural Language Processing (NLP)"),
    "nlp": ("nlp", "natural language processing", "Natural Language Processing (NLP)"),
    "computer vision": ("computer-vision", "computer vision", "Computer Vision"),
    "cv": ("computer-vision", "computer vision", "Computer Vision"),
    "statistics": ("statistics", "statistics", "Statistics"),
    "statistical modeling": ("statistical-modeling", "statistical modeling", "Statistical Modeling"),
    "data mining": ("data-mining", "data mining", "Data Mining"),
    "predictive modeling": ("predictive-modeling", "predictive modeling", "Predictive Modeling"),
    "predictive analytics": ("predictive-analytics", "predictive analytics", "Predictive Analytics"),
    "scikit-learn": ("scikit-learn", "scikit-learn", "Scikit-Learn"),
    "scikit learn": ("scikit-learn", "scikit-learn", "Scikit-Learn"),
    "sklearn": ("scikit-learn", "scikit-learn", "Scikit-Learn"),
    "tensorflow": ("tensorflow", "tensorflow", "TensorFlow"),
    "tf": ("tensorflow", "tensorflow", "TensorFlow"),
    "pytorch": ("pytorch", "pytorch", "PyTorch"),
    "keras": ("keras", "keras", "Keras"),

    # BI & Visualization
    "power bi": ("power-bi", "power bi", "Power BI"),
    "powerbi": ("power-bi", "power bi", "Power BI"),
    "power-bi": ("power-bi", "power bi", "Power BI"),
    "tableau": ("tableau", "tableau", "Tableau"),
    "business intelligence": ("business-intelligence", "business intelligence", "Business Intelligence"),
    "bi": ("business-intelligence", "business intelligence", "Business Intelligence"),
    "excel": ("excel", "excel", "Excel"),
    "advanced excel": ("advanced-excel", "advanced excel", "Advanced Excel"),
    "ms excel": ("excel", "excel", "Excel"),
    "microsoft excel": ("excel", "excel", "Excel"),
    "vba": ("vba", "vba", "VBA"),
    "macros": ("vba-macros", "macros", "Macros"),
    "excel macros": ("vba-macros", "excel macros", "Excel Macros"),
    "qlikview": ("qlikview", "qlikview", "QlikView"),
    "qlik sense": ("qlik-sense", "qlik sense", "Qlik Sense"),
    "qliksense": ("qlik-sense", "qlik sense", "Qlik Sense"),

    # Big Data & Engineering
    "hadoop": ("hadoop", "hadoop", "Hadoop"),
    "apache hadoop": ("hadoop", "hadoop", "Hadoop"),
    "spark": ("apache-spark", "apache spark", "Apache Spark"),
    "apache spark": ("apache-spark", "apache spark", "Apache Spark"),
    "pyspark": ("pyspark", "pyspark", "PySpark"),
    "py - spark": ("pyspark", "pyspark", "PySpark"),
    "big data": ("big-data", "big data", "Big Data"),
    "bigdata": ("big-data", "big data", "Big Data"),
    "hive": ("apache-hive", "hive", "Apache Hive"),
    "apache hive": ("apache-hive", "hive", "Apache Hive"),
    "pig": ("apache-pig", "pig", "Apache Pig"),
    "apache pig": ("apache-pig", "pig", "Apache Pig"),
    "kafka": ("apache-kafka", "apache kafka", "Apache Kafka"),
    "apache kafka": ("apache-kafka", "apache kafka", "Apache Kafka"),
    "airflow": ("apache-airflow", "apache airflow", "Apache Airflow"),
    "apache airflow": ("apache-airflow", "apache airflow", "Apache Airflow"),
    "etl": ("etl", "etl", "ETL"),
    "extract transform load": ("etl", "etl", "ETL"),
    "data warehousing": ("data-warehousing", "data warehousing", "Data Warehousing"),
    "dwh": ("data-warehousing", "data warehousing", "Data Warehousing"),
    "data modeling": ("data-modeling", "data modeling", "Data Modeling"),

    # Databases (Distinct - Not Aggressively Merged)
    "sql server": ("sql-server", "sql server", "SQL Server"),
    "ms sql server": ("sql-server", "sql server", "SQL Server"),
    "mssql": ("sql-server", "sql server", "SQL Server"),
    "mysql": ("mysql", "mysql", "MySQL"),
    "postgresql": ("postgresql", "postgresql", "PostgreSQL"),
    "postgres": ("postgresql", "postgresql", "PostgreSQL"),
    "oracle": ("oracle", "oracle", "Oracle"),
    "oracle sql": ("oracle-sql", "oracle sql", "Oracle SQL"),
    "mongodb": ("mongodb", "mongodb", "MongoDB"),
    "mongo": ("mongodb", "mongodb", "MongoDB"),
    "nosql": ("nosql", "nosql", "NoSQL"),
    "cassandra": ("cassandra", "cassandra", "Cassandra"),
    "redis": ("redis", "redis", "Redis"),
    "snowflake": ("snowflake", "snowflake", "Snowflake"),

    # SAS & Analytics Tools
    "sas": ("sas", "sas", "SAS"),
    "sas sql": ("sas-sql", "sas sql", "SAS SQL"),
    "spss": ("spss", "spss", "SPSS"),

    # Cloud & DevOps
    "aws": ("aws", "aws", "AWS"),
    "amazon web services": ("aws", "aws", "AWS"),
    "azure": ("azure", "azure", "Microsoft Azure"),
    "microsoft azure": ("azure", "azure", "Microsoft Azure"),
    "gcp": ("gcp", "gcp", "GCP"),
    "google cloud": ("gcp", "gcp", "GCP"),
    "google cloud platform": ("gcp", "gcp", "GCP"),
    "docker": ("docker", "docker", "Docker"),
    "kubernetes": ("kubernetes", "kubernetes", "Kubernetes"),
    "k8s": ("kubernetes", "kubernetes", "Kubernetes"),
    "git": ("git", "git", "Git"),
    "github": ("github", "github", "GitHub"),
    "ci/cd": ("ci-cd", "ci/cd", "CI/CD"),
    "cicd": ("ci-cd", "ci/cd", "CI/CD"),
    "linux": ("linux", "linux", "Linux"),

    # Web & Frameworks
    "react": ("react", "react.js", "React.js"),
    "reactjs": ("react", "react.js", "React.js"),
    "react.js": ("react", "react.js", "React.js"),
    "node": ("nodejs", "node.js", "Node.js"),
    "nodejs": ("nodejs", "node.js", "Node.js"),
    "node.js": ("nodejs", "node.js", "Node.js"),
    "django": ("django", "django", "Django"),
    "flask": ("flask", "flask", "Flask"),
    "spring": ("spring", "spring", "Spring Framework"),
    "spring boot": ("spring-boot", "spring boot", "Spring Boot"),
    "html": ("html", "html", "HTML"),
    "css": ("css", "css", "CSS"),

    # Business & Functional
    "business analysis": ("business-analysis", "business analysis", "Business Analysis"),
    "business analyst": ("business-analysis", "business analysis", "Business Analysis"),
    "project management": ("project-management", "project management", "Project Management"),
    "digital marketing": ("digital-marketing", "digital marketing", "Digital Marketing"),
    "seo": ("seo", "seo", "SEO"),
    "search engine optimization": ("seo", "seo", "SEO"),
    "sem": ("sem", "sem", "SEM"),
    "search engine marketing": ("sem", "sem", "SEM"),
    "social media marketing": ("social-media-marketing", "social media marketing", "Social Media Marketing"),
    "content marketing": ("content-marketing", "content marketing", "Content Marketing"),
    "market research": ("market-research", "market research", "Market Research"),
    "finance": ("finance", "finance", "Finance"),
    "financial analysis": ("financial-analysis", "financial analysis", "Financial Analysis"),
    "accounting": ("accounting", "accounting", "Accounting"),
    "banking": ("banking", "banking", "Banking"),
    "sales": ("sales", "sales", "Sales"),
    "agile": ("agile", "agile", "Agile"),
    "scrum": ("scrum", "scrum", "Scrum"),
    "crm": ("crm", "crm", "CRM"),
    "salesforce": ("salesforce", "salesforce", "Salesforce"),
    "sap": ("sap", "sap", "SAP"),
}


def clean_raw_token(raw_token: str) -> Optional[str]:
    """
    Cleans individual raw skill token:
    - Strips leading/trailing ellipses (...), quotes, asterisks, brackets, bullets, hyphens.
    - Normalizes internal multiple whitespace.
    - Discards empty tokens or noise words.
    - Preserves single-letter programming languages like 'R' and 'C'.
    """
    if not raw_token:
        return None
    token = str(raw_token).strip()

    # Strip surrounding quotes, ellipses, brackets, asterisks, dashes (preserving leading dot for .net)
    is_dot_net = token.lower().startswith(".net")
    token = re.sub(r"^[\*\"\'\-\–\—\s\(\)\[\]]+|[\.\*\"\'\-\–\—\s\(\)\[\]]+$", "", token).strip()
    if not is_dot_net:
        token = re.sub(r"^\.+", "", token).strip()

    # Collapse internal multiple whitespace
    token = re.sub(r"\s+", " ", token)

    if not token:
        return None

    token_lower = token.lower()

    # Handle single-character programming languages explicitly
    if token_lower in ("r", "c"):
        return token.upper()

    # Discard 1-letter noise or generic punctuation
    if len(token) < 2:
        return None

    # Non-skill employment status and noise terms to discard
    NOISE_TERMS = {
        "...", "..", "etc", "na", "null", "none", "n/a", "others", "any", "all",
        "work from home", "freelancing", "present job", "part time", "full time",
        "fresher", "freshers", "urgent requirement", "immediate joiner",
        "immediate joining", "notice period", "walk-in", "walkin", "male", "female"
    }
    if token_lower in NOISE_TERMS:
        return None

    # Pure non-word or punctuation tokens
    if re.match(r"^[\W_]+$", token):
        return None

    return token


def to_canonical_display_name(raw_name: str) -> str:
    """
    Formats a clean skill string into a professional human-readable display name,
    respecting acronyms and technical naming conventions.
    """
    words = raw_name.split()
    formatted = []
    for w in words:
        w_clean = re.sub(r"[^\w\+\#\./]", "", w)
        w_lower = w_clean.lower()
        if w_lower in ACRONYMS:
            formatted.append(w_lower.upper())
        elif w_lower in ("in", "of", "and", "or", "to", "for", "with", "on", "at") and formatted:
            formatted.append(w_lower)
        elif w_lower.startswith("."):
            formatted.append("." + w_lower[1:].upper())
        elif "+" in w_clean or "#" in w_clean:
            formatted.append(w.upper())
        else:
            formatted.append(w.capitalize())
    return " ".join(formatted)


def canonicalize_skill(raw_skill: str) -> Optional[Dict[str, str]]:
    """
    Transforms any raw skill token into a standardized canonical skill representation:
    - skill_id: unique, URL-safe slug
    - canonical_name: normalized lowercase key
    - display_name: human-readable canonical display label
    """
    cleaned = clean_raw_token(raw_skill)
    if not cleaned:
        return None

    cleaned_lower = cleaned.lower()

    # 1. Check exact canonical aliases
    if cleaned_lower in CANONICAL_ALIASES:
        slug, canon_name, display = CANONICAL_ALIASES[cleaned_lower]
        return {
            "skill_id": slug,
            "canonical_name": canon_name,
            "display_name": display,
        }

    # 2. Normalize minor punctuation variants (e.g. 'c ++' -> 'c++', 'pl - sql' -> 'pl/sql')
    normalized_variation = re.sub(r"\s*-\s*", "-", cleaned_lower)
    normalized_variation = re.sub(r"\s*/\s*", "/", normalized_variation)
    normalized_variation = re.sub(r"\s*\+\s*", "+", normalized_variation)
    if normalized_variation in CANONICAL_ALIASES:
        slug, canon_name, display = CANONICAL_ALIASES[normalized_variation]
        return {
            "skill_id": slug,
            "canonical_name": canon_name,
            "display_name": display,
        }

    # 3. Dynamic slug and display name generation
    # Normalize slug: lowercase alphanumeric, hyphens
    slug = cleaned_lower.replace("++", "-plus-plus").replace("#", "-sharp").replace(".", "dot-")
    slug = re.sub(r"[^\w\s\-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug).strip("-")
    if not slug:
        return None

    display = to_canonical_display_name(cleaned)
    return {
        "skill_id": slug,
        "canonical_name": cleaned_lower,
        "display_name": display,
    }


def extract_and_canonicalize_skills(raw_skills_field: Any) -> List[Dict[str, str]]:
    """
    Parses full key_skills field string, extracts, standardizes,
    and returns a deduplicated list of canonical skill dictionaries for a job posting.
    Each unique skill is counted at most once per posting.
    """
    if raw_skills_field is None or str(raw_skills_field).strip() in ("", "nan", "null", "None"):
        return []

    text = str(raw_skills_field)

    # Delimiters: comma and semicolon are the primary delimiters
    parts = re.split(r"[,;]+", text)
    seen_ids: Set[str] = set()
    result: List[Dict[str, str]] = []

    for part in parts:
        canon = canonicalize_skill(part)
        if canon and canon["skill_id"] not in seen_ids:
            seen_ids.add(canon["skill_id"])
            result.append(canon)

    return result
