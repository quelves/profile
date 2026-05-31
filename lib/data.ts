export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface StrategicInitiative {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  company: string;
  strategicObjective: string;
  scope: string;
  description: string;
  businessImpact: {
    metric: string;
    value: string;
    context?: string;
  }[];
  governance: string[];
  architecture: string[];
  technologies: string[];
  role: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  company: string;
  description: string;
  role: string;
  impact: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: string;
}

export interface Publication {
  id: string;
  title: string;
  year?: string;
  type?: "paper" | "thesis" | "book" | "report";
  institution?: string;
  url?: string;
  description?: string;
}

export const experiences: Experience[] = [
  {
    id: "megamedia",
    company: "Megamedia",
    role: "Gerente de TI",
    period: "2018 — Presente",
    location: "Santiago, Chile",
    description:
      "Liderazgo de la dirección tecnológica de la empresa, impulsando la transformación digital, optimizando arquitecturas cloud-native y reduciendo costos operacionales mediante la implementación de infraestructura en la nube y gestión ágil de proyectos.",
    highlights: [
      "Transformación digital y adopción de arquitecturas cloud-native",
      "Optimización de costos operacionales mediante infraestructura en la nube",
      "Gestión ágil de proyectos con SCRUM y XP",
      "Desarrollo y mantenimiento de plataformas digitales escalables",
      "Cultivo de equipos de alto rendimiento",
    ],
    technologies: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Node.js", "Java", "Python"],
  },
  {
    id: "imagemaker",
    company: "Imagemaker S.A.",
    role: "Software Development Manager",
    period: "2017 — 2018",
    location: "Santiago, Chile",
    description:
      "Gestión del ciclo completo de desarrollo de software, liderando equipos en la entrega de soluciones empresariales con enfoque en calidad, escalabilidad y alineación con objetivos de negocio.",
    highlights: [
      "Turned around a development area with no sales for ~1 year, closing $200K+ in new projects within 3 months",
      "Delivered scalable enterprise solutions on JEE and .NET platforms",
      "Aligned technology decisions with business objectives",
    ],
    technologies: ["Java", "Spring", "Oracle", "AWS"],
  },
  {
    id: "guru",
    company: "gurú",
    role: "IT Application Development Manager",
    period: "2007 — 2017",
    location: "Santiago, Chile",
    description:
      "Liderazgo en el desarrollo de portales y aplicaciones móviles para productos como miportal.gurusoluciones.com.ar, amarillas.cl, ecommerce.amarillas.cl, blancas.cl. Gestión de clusters de motores de búsqueda, sistemas de clasificación e indexación.",
    highlights: [
      "Led development of portals and mobile applications generating ~30% of company revenue",
      "Managed Solr search engines and large-scale indexing systems",
      "Consolidated LATAM platforms: reduced 3 platforms per country to 1 unified architecture",
      "Built Customer Portal LATAM with microservices and open-source stack",
      "Developed statistical Solr plugin for media advertising platform",
      "Applied agile methodologies SCRUM and XP across distributed teams",
    ],
    technologies: [
      "Java",
      "Spring",
      "Solr",
      "Oracle",
      "MySQL",
      "MongoDB",
      "Informix",
      "AWS (EC2, S3)",
      "JBoss",
      "Tomcat",
      "Apache",
      "Linux",
    ],
  },
  {
    id: "guiamais-sm",
    company: "GuiaMais",
    role: "System Manager",
    period: "2006 — 2007",
    location: "São Paulo, Brasil",
    description:
      "Planificación, dirección, supervisión y control de procesos, proyectos y sistemas de información alineados a la estrategia de la empresa. Participación en la evaluación de requerimientos organizacionales y necesidades estructurales.",
    highlights: [
      "Coordinated full development of www.amarillas.cl portal using componentized architecture",
      "Built web services for reusability across LATAM products",
      "Tuned EJB search engines and Oracle backends for performance",
      "Developed classification tool based on thesauri (webthesaurus)",
    ],
    technologies: ["J2EE", "Oracle", "EJB", "Linux", "Tomcat", "JBoss", "Apache", "CORBA"],
  },
  {
    id: "guiamais-pm",
    company: "GuiaMais",
    role: "Project Manager",
    period: "2002 — 2006",
    location: "São Paulo, Brasil",
    description:
      "Liderazgo y desarrollo de proyectos informáticos orientados al análisis, diseño, documentación, construcción e implementación del sitio www.guiamais.com.br. El sitio representaba el 20% de los ingresos de TPI de Brasil.",
    highlights: [
      "Migrated applications from CORBA to J2EE web architecture — site represented ~20% of TPI de Brasil revenue",
      "Used Oracle databases (SQL, PL/SQL) for high-volume directory data",
      "Deployed on open-source stack: Linux, Tomcat, JBoss, Apache",
      "Generated and maintained products for Brazil, Chile, Argentina and Peru",
    ],
    technologies: ["Java", "J2EE", "Oracle", "CORBA", "Linux", "Tomcat", "JBoss", "Apache"],
  },
  {
    id: "unifesp",
    company: "Universidade Federal de São Paulo (UNIFESP)",
    role: "Software Development",
    period: "1998 — 2001",
    location: "São Paulo, Brasil",
    description:
      "Desarrollo de aplicación para la compensación establecida por el Artículo 32 de la Ley N° 9.656/1998. Uso de componentes distribuidos CORBA, COM/DCOM sobre Delphi para identificación de personas y procesos médicos.",
    highlights: [
      "Built distributed compensation application using CORBA/COM/DCOM components over Delphi",
      "Delivered National Registry for 60 million users of Brazil's Unified Health System (SUS)",
      "Implemented OMG identity service for large-scale person matching",
      "Reduced operational costs and waiting times for medical appointments",
      "Published research on object-relational mapping and process mining",
    ],
    technologies: ["Delphi", "CORBA", "COM/DCOM", "Orbix", "ActiveX"],
  },
];

export const strategicInitiatives: StrategicInitiative[] = [
  {
    id: "mega-ott",
    title: "MEGA GO OTT Platform",
    subtitle: "Transformación de modelo de negocio tradicional a plataforma digital de streaming líder en LATAM",
    period: "2022 — Presente",
    company: "Megamedia",
    strategicObjective:
      "Migrar el modelo de negocio de media tradicional a una plataforma OTT (Over-The-Top) de streaming directo al consumidor, posicionándola como líder regional en Entertainment y generando nuevas líneas de ingreso digitales.",
    scope:
      "Ecosistema completo: backend multi-tenant, 7 plataformas cliente (Web, iOS, Android, Android TV, Samsung Tizen, LG webOS, Roku), CDN propio, pasarelas de pago multi-país, DRM enterprise y monetización multi-modal.",
    description:
      "Diseño y gobernanza de arquitectura híbrida on-premise/cloud para escalar a 1M+ usuarios concurrentes. Liderazgo técnico de portafolio de 57 épicas, 2,888+ SP, 28 sprints (~14 meses). Implementación de microservicios con DDD, seguridad enterprise (SSO, DRM multi-platform, App Attestation), y monetización multi-modal (subscripciones, PPV, publicidad IMA-DAI).",
    businessImpact: [
      { metric: "Descargas Android", value: "1.91M+", context: "#1 Entertainment Chile Play Store" },
      { metric: "Dispositivos Activos", value: "473K+", context: "Base mensual activa" },
      { metric: "Suscriptores", value: "180K+", context: "Recurrentes con churn controlado" },
      { metric: "Usuarios Concurrentes (pico)", value: "150K", context: "Festival de Viña del Mar 2026" },
      { metric: "SLA", value: "99.95%", context: "Disponibilidad comprometida" },
      { metric: "Throughput", value: "10K+ RPS", context: "Requests por segundo en pico" },
    ],
    governance: [
      "Auditoría continua de 39 repositorios satélite con análisis de consistencia",
      "Framework de Specification-Driven Development (SDD) con gates de calidad",
      "Análisis de Bus Factor y planes de mitigación de riesgo operacional",
      "Compliance fiscal internacional: DTE/SII Chile, CFDI México, AFIP Argentina",
    ],
    architecture: [
      "Arquitectura híbrida on-premise (Docker Swarm) + cloud (Huawei Cloud Kubernetes)",
      "Microservicios con DDD: 6 dominios (Contenido, Usuario, Pago, Auth, Streaming, Notificación)",
      "Patrones: API Gateway, BFF, Saga Pattern, CQRS/Event Sourcing",
      "Seguridad enterprise: Keycloak custom, OAuth2/OIDC/JWT, tokens firmados CDN",
      "DRM cross-platform: Widevine (Android/Web), FairPlay (iOS), PlayReady (Smart TV/Roku)",
    ],
    technologies: [
      "Node.js",
      "Express",
      "Java",
      "Spring Boot",
      "React",
      "SwiftUI",
      "Kotlin",
      "MongoDB Sharded",
      "PostgreSQL HA",
      "Redis",
      "Keycloak",
      "Kubernetes",
      "Docker Swarm",
      "Huawei Cloud",
      "MediaStream CDN",
      "Datadog",
    ],
    role: "Arquitecto Enterprise & Líder Técnico",
  },
  {
    id: "mega-ia",
    title: "MEGA IA Skills Framework",
    subtitle: "Gobernanza de agentes de IA para acelerar la velocidad de desarrollo manteniendo calidad enterprise",
    period: "2024 — Presente",
    company: "Megamedia",
    strategicObjective:
      "Transformar la productividad del equipo de ingeniería mediante la orquestación de agentes de IA especializados, reduciendo time-to-market sin degradar calidad, seguridad ni gobernanza técnica.",
    scope:
      "Framework multi-skill para Kimi Code CLI: 15 roles de agentes IA, arquitectura multi-stack (Node, Python, Java, .NET, Go, Flutter), gobernanza ML/MLOps, inteligencia de diseño UI/UX, y automatización CI/CD.",
    description:
      "Diseño de sistema multi-agente con Checkpoint Protocol (CP-0..CP-8) para memoria persistente, modo Swarm con sincronización cada 15 min, y gates secuenciales de calidad (SDD → TDD → BDD → CodeRev → SecRev → QA → Leader Approval). Implementación de motor BM25 propio en Python puro para inteligencia de diseño basada en datos.",
    businessImpact: [
      { metric: "Roles de Agentes IA", value: "15+", context: "Especializados con responsabilidades claras" },
      { metric: "Skills Desarrollados", value: "6", context: "Team, Arch, ML, UI/UX, DevOps, SAP" },
      { metric: "Factor de Estimación", value: "10.7h/SP", context: "Calibrado con datos reales del equipo" },
      { metric: "Datasets Curados", value: "~1,100", context: "Registros para toma de decisiones de diseño" },
      { metric: "Documentación Normativa", value: "~5,000+", context: "Líneas de especificación" },
    ],
    governance: [
      "Human-in-the-Loop: aprobación humana explícita para commits, merges, épicas, ADRs y deploys",
      "Checkpoint Protocol (CP-0 a CP-8): memoria persistente entre sesiones de agentes IA",
      "Specification-Driven Development: sin spec package aprobado no hay feature branch",
      "Auditoría periódica: QA Report, CodeRev Report, SecRev Report con hallazgos documentados",
    ],
    architecture: [
      "Arquitectura desacoplada: skill principal (@mega-ia-team) puro en metodología",
      "Skills técnicos separados (@mega-ia-arch) con reglas por stack",
      "Motor BM25 implementado desde cero en Python stdlib para information retrieval",
      "Patrón Master + Overrides para design systems con persistencia",
    ],
    technologies: [
      "Python 3",
      "BM25",
      "Markdown",
      "YAML",
      "Mermaid",
      "Git",
      "SemVer",
      "Kimi Code CLI",
    ],
    role: "Chief AI Officer & Arquitecto de Procesos",
  },
  {
    id: "mega-sam",
    title: "Super App MEGA (SAM)",
    subtitle: "Evolución estratégica de OTT vertical a ecosistema digital unificado multi-vertical",
    period: "2025 — Presente",
    company: "Megamedia",
    strategicObjective:
      "Evolutionar la plataforma OTT hacia una Super App que unifique OTT + Noticias/Farándula + Social + Shop + Radios + Señales en Vivo, aumentando ARPU y retención mediante mayor engagement y touchpoints con el usuario.",
    scope:
      "Arquitectura Shell + Micro-Apps sobre base monolítica evolutiva. 5 fases, 6 proyectos paralelos, ~3,000 SP. 7 plataformas cliente, 5 APIs backend, 4 bases de datos, 2 orquestadores de contenedores.",
    description:
      "Dirección estratégica de evolución arquitectónica con análisis riguroso de trade-offs (Fork vs. Feature Flags con 8 criterios cuantificados). 10 ADRs formales, modelado económico con ROI 1,500% y payback 4 semanas. Gobernanza de 12 sub-proyectos con sincronización bidireccional y detección de divergencias críticas.",
    businessImpact: [
      { metric: "ROI Proyectado", value: "1,500%", context: "Retorno sobre inversión estimado" },
      { metric: "Payback", value: "4 semanas", context: "Recuperación de inversión inicial" },
      { metric: "Ahorro vs. Tradicional", value: "$3.96M", context: "$4.2M tradicional vs. $240K IA-asistido" },
      { metric: "ADRs Formales", value: "10", context: "Decisiones arquitectónicas documentadas" },
      { metric: "Documentación", value: "83K+", context: "Líneas de Markdown normativo" },
    ],
    governance: [
      "Jerarquía de planificación: Program Epic → Project Epic → Story con sincronización bidireccional",
      "Auditoría cross-repo: detección de 7 divergencias críticas entre Mega GO y SAM",
      "Control de versiones semántico para documentos: 26+ documentos sincronizados",
      "Due diligence técnica continua con matrices de funcionalidades cross-platform",
    ],
    architecture: [
      "Patrón Shell + Micro-Apps / Micro-Frontends con Module Federation 2.0",
      "Lazy Login con OAuth2/PKCE y grafo de identidad en Neo4j + embeddings Milvus",
      "Feature Flags unificados cross-platform con jerarquía padre/hijo",
      "Evolución monolítica controlada: bifurcación progresiva con rollback seguro",
      "Multi-cloud híbrido: on-premise (Docker Swarm) + Huawei Cloud (Kubernetes)",
    ],
    technologies: [
      "React",
      "React Native",
      "SwiftUI",
      "Kotlin",
      "Node.js",
      "Go",
      "NestJS",
      "Neo4j",
      "Milvus",
      "PostgreSQL",
      "MongoDB",
      "Redis Cluster",
      "Kafka",
      "Kubernetes",
      "Helm",
      "Traefik",
      "Keycloak",
    ],
    role: "VP of Engineering & Arquitecto Estratégico",
  },
  {
    id: "mega-sales-platform",
    title: "Mega Sales Platform (MSP)",
    subtitle: "Transformación enterprise completa: reemplazo de ERP legacy por plataforma comercial cloud-native para media companies",
    period: "2026 — 2027",
    company: "Megamedia",
    strategicObjective:
      "Reemplazar el sistema legado APLO/SISCOM (Java 7 + Adobe Flex, 2008) por un ERP comercial de clase mundial, unificando la gestión comercial, operativa, de contenidos y financiera para TV lineal, TV paga, OTT, radio y productos digitales.",
    scope:
      "ERP completo multi-dominio: 11 microservicios planificados, 13 schemas PostgreSQL, frontend React 19 + Vite, dual datasource (PostgreSQL + SQL Server legacy), Kafka event bus, observabilidad completa (Prometheus/Grafana), y equipo híbrido humano-IA (8.75 FTE + 18 agentes IA).",
    description:
      "Dirección de transformación enterprise con arquitectura DDD, migración Strangler Fig desde monolito legacy hacia microservicios. Diseño de CI/CD multi-ambiente con Jenkins + MPB, Docker Swarm production-grade con zero-downtime deploys, y metodología Agile Agent Leader Swarm con productividad 2.5x demostrada.",
    businessImpact: [
      { metric: "Timeline Reducido", value: "12-14 meses", context: "vs 24 meses tradicionales" },
      { metric: "Factor Productividad IA", value: "2.5x–4x", context: "vs desarrollo tradicional" },
      { metric: "Revenue Proyectado", value: "+20%", context: "Incremento por automatización comercial" },
      { metric: "Reducción Horas Manuales", value: "-70%", context: "Automatización de procesos comerciales" },
      { metric: "Reducción Deuda Técnica", value: "-90%", context: "Migración desde legacy Java 7/Flex" },
      { metric: "Épicas Planificadas", value: "27", context: "~220 historias, ~1,944 SP" },
    ],
    governance: [
      "Metodología Agile Agent Leader Swarm: 18 agentes IA especializados con gates de calidad (SDD→TDD→BDD→CodeRev→SecRev→QA→Leader)",
      "Calibración real basada en datos de MEGA GO Android (621 SP, 74.1% completado)",
      "Análisis exhaustivo legacy: 323 tablas, ~50 SPs, 273 pantallas Flex, 18 módulos Maven",
      "Spring Batch partitioner con delta sync cada 15 min durante operación paralela",
    ],
    architecture: [
      "Domain-Driven Design con 11 bounded contexts y evolución Monolito Modular → Microservicios",
      "Strangler Fig Pattern para migración progresiva sin downtime del legacy",
      "Dual datasource Spring Boot: PostgreSQL 15 (nuevo) + SQL Server (legacy APOLO)",
      "Event-Driven Architecture con Kafka como Event Bus y CQRS/Event Sourcing propuesto",
      "Docker Swarm production-grade: zero-downtime deploys, rollback automático, resource quotas",
      "Observabilidad completa: Prometheus, Grafana, cAdvisor, Node Exporter, PostgreSQL/Redis Exporters",
    ],
    technologies: [
      "Java 21 LTS",
      "Spring Boot 3.2.5",
      "React 19",
      "Vite 8",
      "TypeScript",
      "Tailwind CSS v4",
      "PostgreSQL 15",
      "SQL Server",
      "Redis 7",
      "Kafka (Confluent 7.5.0)",
      "MinIO",
      "Docker Swarm",
      "Traefik v2",
      "Jenkins",
      "Prometheus",
      "Grafana",
      "Python 3.11",
      "FastAPI",
      "Vertex AI",
      "Gemini",
    ],
    role: "Chief Technology Officer & Arquitecto Enterprise",
  },
];

export const projects: Project[] = [
  {
    id: "customer-portal-latam",
    title: "Customer Portal LATAM",
    period: "2016 — 2017",
    company: "gurú",
    description:
      "Implementación de un portal de clientes con consulta de información, pago de facturas, apertura de tickets y consultas. Arquitectura de microservicios en plataforma Java con base de datos Informix, Oracle, MariaDB, MongoDB y servicios AWS.",
    role: "IT Application Development Manager",
    impact: [
      "Unificación del acceso al cliente en LATAM",
      "Arquitectura abierta y escalable con microservicios",
      "Integración multiservicio AWS (S3, EC2)",
    ],
    technologies: ["Java", "Microservicios", "Informix", "Oracle", "MariaDB", "MongoDB", "AWS S3", "AWS EC2"],
  },
  {
    id: "consolidation-latam",
    title: "Consolidación de Plataformas LATAM",
    period: "2015 — 2016",
    company: "gurú",
    description:
      "Consolidación de plataformas web y móviles de Páginas Amarillas y Páginas Blancas en países LATAM, reduciendo tres plataformas por país a una única plataforma unificada.",
    role: "IT Application Development Manager",
    impact: [
      "Reducción de 3 plataformas por país a 1",
      "Reducción significativa de costos de mantenimiento",
      "Tiempo de proyecto: ~12 meses",
      "Motor de búsqueda Solr integrado",
    ],
    technologies: ["Java", "Linux", "MySQL", "Solr", "Open Source"],
  },
  {
    id: "solr-statistical",
    title: "Buscador Estadístico Solr",
    period: "2014 — 2015",
    company: "gurú / Yell Chile",
    description:
      "Desarrollo de un plugin para el motor de búsqueda Solr que permitió realizar búsquedas estadísticas, mejorando las posibilidades de visualización de anuncios con inversión mínima.",
    role: "IT Application Development Manager",
    impact: [
      "Mayor visibilidad de anuncios para los clientes",
      "Inversión mínima con alto retorno",
      "Extensibilidad del motor de búsqueda existente",
    ],
    technologies: ["Solr", "Java", "Plugin Development"],
  },
  {
    id: "yell-chile",
    title: "Portal Yell Chile / GuiaMais",
    period: "2006 — 2007",
    company: "GuiaMais",
    description:
      "Construcción del nuevo sitio www.amarillas.cl basado en componentización y uso de webservices. Migración de aplicaciones CORBA a aplicación web J2EE.",
    role: "Project Manager / System Manager",
    impact: [
      "Nuevo portal con arquitectura basada en componentes",
      "Integración de webservices en todos los productos",
      "Migración exitosa de CORBA a J2EE",
      "Representaba ingresos significativos para la empresa",
    ],
    technologies: ["J2EE", "Java", "Oracle", "CORBA", "Webservices", "Linux", "Tomcat", "JBoss", "Apache"],
  },
  {
    id: "sus-national-registry",
    title: "Registro Nacional SUS — 60 Millones de Usuarios",
    period: "1998 — 2000",
    company: "UNIFESP",
    description:
      "Responsable por el registro de la población de Brasil. Sistema construido en Delphi con componentes usando fuertes conceptos de Orientación a Objetos y modelo de componentes para desacoplar la lógica de negocio.",
    role: "Software Developer",
    impact: [
      "Registro de 60 millones de usuarios del Sistema Único de Salud",
      "Reducción de costos de operación",
      "Reducción de tiempos de espera",
      "Habilitación de agendamiento de consultas médicas",
      "Implementación del servicio de identificación de personas OMG",
    ],
    technologies: ["Delphi", "CORBA", "COM/DCOM", "Orbix", "ActiveX", "Object Orientation"],
  },
];

export const education: Education[] = [
  {
    id: "phd",
    institution: "Pontificia Universidad Católica de Chile",
    degree: "Candidato a Doctorado (PhD in progress)",
    field: "Ciencias de la Computación — Sistemas Autónomos y Auto-Reparables con IA",
    period: "2016 — En curso",
  },
  {
    id: "master",
    institution: "Pontificia Universidad Católica de Chile",
    degree: "Magíster",
    field: "Tecnologías de Información y Gestión",
    period: "2013 — 2015",
  },
  {
    id: "technologist",
    institution: "Universidade Estadual Paulista Júlio de Mesquita Filho (UNESP)",
    degree: "Tecnólogo",
    field: "Procesamiento de Datos",
    period: "1996 — 2000",
  },
];

export const publications: Publication[] = [
  {
    id: "pub4",
    title: "Diseño del Modelo de Negocio y Arquitectura de una Plataforma Tecnológica para la Comunidad Comercial de Expertos, Usuarios y Empresas (QUALIFY INC)",
    year: "2015",
    type: "thesis",
    institution: "Pontificia Universidad Católica de Chile — Magíster en Tecnologías de la Información y Gestión",
    url: "/profile/docs/DASilva-Informe-AG.pdf",
    description: "Tesis de magíster que diseña el modelo de negocio y arquitectura de una plataforma SaaS para cualificar, recomendar y comercializar productos y servicios. Aplica Business Model Canvas, Lean Canvas, Lean Startup, SCRUM, SOA y ArchiMate. 71 páginas.",
  },
  {
    id: "pub2",
    title: "Business process analysis in advertising: An extension to a methodology based on process mining projects",
    year: "2016",
    type: "paper",
    institution: "IEEE",
    url: "https://ieeexplore.ieee.org/document/7528423",
    description: "Extensión de metodología de Process Mining aplicada al análisis de procesos publicitarios.",
  },
  {
    id: "pub1",
    title: "Object mapping database related data using Delphi",
    type: "paper",
    institution: "ResearchGate",
    url: "https://www.researchgate.net/publication/283005776_Object_Mapping_Database_Related_Data_Using_Delphi",
    description: "Mapeo objeto-relacional usando Delphi para sistemas de registro nacional de salud.",
  },
  {
    id: "pub3",
    title: "Building Components DCOM / CORBA / Active X with Orbix",
    type: "paper",
    institution: "ResearchGate",
    url: "https://www.researchgate.net/publication/283005779_Building_Components_DCOM_CORBA_ActiveX_with_Orbix",
    description: "Construcción de componentes distribuidos DCOM, CORBA y ActiveX usando Orbix.",
  },
];

export const skills = {
  management: [
    "IT Management",
    "Agile Project Management (SCRUM, XP)",
    "Service Management",
    "Team Training & Development",
    "Stakeholder Management",
  ],
  architecture: [
    "Cloud-Native Architecture",
    "Distributed Architecture",
    "SOA / BPM",
    "Microservices",
    "ArchiMate, BPMN, UML",
  ],
  development: [
    "Java / JEE / Spring",
    "Node.js / REST APIs",
    "Python",
    "PHP",
    "Delphi",
    "Mobile (Android, iOS)",
  ],
  devops: [
    "CI/CD Automation",
    "Docker",
    "Kubernetes",
    "AWS, Azure, GCP, Huawei",
    "Linux Administration",
  ],
  data: [
    "Oracle",
    "MySQL / MariaDB",
    "MongoDB",
    "Solr / Search Engines",
    "Machine Learning",
  ],
};
