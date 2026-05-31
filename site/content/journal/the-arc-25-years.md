---
title: "The Arc: 25 Years of Technology Transformation"
date: "2025-09-15"
category: "Leadership"
excerpt: "A personal reflection on twenty-five years of technology leadership — from distributed systems for 60 million health users to autonomous AI frameworks. The arc is not a CV. It is a continuous thread connecting every phase into one coherent narrative."
tags: ["Career", "Leadership", "Transformation", "Autonomous Systems", "Architecture"]
lang: "en"
---

When I interview technology executives, I often ask them to tell me the story of their career as a single arc. Most cannot. They describe a sequence of jobs — company A, then company B, then company C — without connecting the intellectual thread that links one phase to the next.

This is the article I wish someone had asked me to write twenty years ago. It is not a CV. It is an attempt to show that a technology career can have the same narrative coherence as a doctoral thesis: every chapter builds on the previous one, every experiment informs the next hypothesis, and the conclusion is only possible because of the journey that preceded it.

## Phase I: Distributed Systems (1998–2001)

I started building software in 1998 at the Universidade Federal de São Paulo (UNIFESP), working on Brazil's national health registry system. The challenge was deceptively simple: register 60 million citizens into a unified database so they could schedule medical appointments, process reimbursements, and access public health services.

The technology stack — Delphi, CORBA, COM/DCOM, Orbix — is now obsolete. But the architectural problem was timeless: **how do you build a system that handles millions of records across distributed servers while maintaining consistency, availability and fault tolerance?**

We built the system using component-based design. Each service (identity matching, compensation processing, scheduling) was a separate CORBA object that could be deployed independently. The identity service used the OMG specification for person matching across millions of records — a problem that today we would call "entity resolution" and solve with graph databases.

Two publications came from this work: one on object-relational mapping using Delphi, and another on building distributed components with DCOM, CORBA and ActiveX. At the time, I thought these were just academic exercises. In retrospect, they were the foundation of everything that followed.

**What I learned**: Service boundaries matter more than technology. The decision to separate identity matching from scheduling — made in 1999 — is the same decision I make today when designing microservices. The protocol changed from CORBA IIOP to HTTP/REST. The boundary logic did not.

## Phase II: Digital Platforms LATAM (2002–2017)

After UNIFESP, I moved to GuiaMais — then part of Telefónica Publicidad e Información — to build directory and search platforms. The problem was different but related: **how do you help users find the right business among millions of listings when they cannot spell the name correctly?**

This was my first exposure to search engines. We built phonetic indexing systems using Solr and Lucene, implemented statistical finders for advertisement visibility, and migrated legacy CORBA systems to J2EE web architectures. The site I built represented approximately 20% of TPI de Brasil revenue.

The most important technical lesson from this period was about **information retrieval** — the same discipline that powers today's RAG (Retrieval-Augmented Generation) and semantic search systems. In 2004, we were building phonetic matching algorithms to handle misspelled business names. In 2024, that same problem space powers vector embeddings and similarity search for AI systems.

In 2007, I joined gurú (Yell LATAM) to lead platform consolidation across Chile, Argentina and Peru. The challenge: **reduce three platforms per country to one unified architecture without breaking existing user experiences or business processes.**

We consolidated using open-source stacks (Linux, Java, MySQL, Solr) and agile methodologies (SCRUM, XP). The products I led generated approximately 30% of company revenue. But the real learning was organizational: **platform consolidation is not a technical problem. It is a business process problem that requires technical solutions.**

The migration from three platforms to one required mapping every business process across three countries, identifying inconsistencies, negotiating standardization with local teams, and building adapters that allowed gradual transition rather than big-bang replacement. This experience — managing change across organizational boundaries — proved more valuable than any technical skill I acquired.

**What I learned**: Search and information retrieval are foundational for AI. The Solr clusters I managed in 2012 taught me about inverted indexes, TF-IDF scoring and query optimization — concepts directly applicable to today's vector databases and embedding models. And organizational change management is as critical as architecture design.

## Phase III: Digital Transformation (2018–Present)

In 2018, I joined Megamedia to lead technology transformation. The company was a traditional media broadcaster trying to become a digital platform. The challenge: **build an OTT streaming service that could compete with Netflix, Disney+ and Amazon Prime while leveraging local content advantages.**

MEGA GO became the #1 Entertainment app in Chile. The technical architecture — hybrid on-premise/cloud, microservices with DDD, multi-DRM, multi-CDN — is well-documented in other articles. What matters for this narrative is how the previous phases informed the architecture:

- The **distributed systems** experience (Phase I) taught me that service boundaries should be drawn around business capabilities, not technical layers. The OTT API, PAY API, SSO API and MDS API each own a business domain.
- The **search platform** experience (Phase II) taught me that information retrieval is critical for content discovery. MEGA GO's recommendation engine uses the same principles — inverted indexes, similarity scoring, user behavior signals — that I learned building directory search in 2004.
- The **platform consolidation** experience (Phase II) taught me that organizational change requires gradual evolution, not revolution. We adopted Feature Flags and evolutionary architecture for the Super App MEGA transformation rather than rewriting the codebase.

The most consequential project of this phase is not MEGA GO itself. It is the **MEGA IA Skills framework** — a multi-agent AI system with 15+ specialized roles, persistent memory, and sequential quality gates. This framework demonstrates 2.5x–4x productivity gain versus traditional development and is being validated as part of my doctoral research.

**What I learned**: Digital transformation fails when technology is treated as a project rather than as a capability. The organizations that succeed build technology as a muscle — not as a one-time initiative. And AI is not a tool you adopt. It is an organizational capability you cultivate.

## Phase IV: Autonomous Systems (Next)

I am a PhD Candidate in Computer Science at Pontificia Universidad Católica de Chile. My thesis — provisional title: *"Autonomous Enterprise Systems: Self-Integration and Self-Correction Using Intelligent Agents"* — explores a question that connects all previous phases:

**What if enterprise systems could detect their own failures, diagnose root causes, and implement repairs without human intervention?**

This is not science fiction. The MEGA IA Skills framework is the first production validation. The agents already perform code review, security audits, test generation and architectural analysis. The next step is autonomous process correction: systems that observe their own execution, identify anomalies, and adapt behavior in real time.

The intellectual lineage is clear:
- **1998**: Distributed systems that communicate via service boundaries
- **2004**: Search systems that retrieve information from massive indexes
- **2016**: Process mining systems that extract knowledge from execution logs
- **2024**: Agentic AI systems that act autonomously within governance guardrails
- **Next**: Self-adaptive systems that integrate all of the above

## The Coherence of the Arc

When I look back, the arc is not a sequence of disconnected jobs. It is a continuous exploration of one question: **how do you build systems that operate reliably at scale with minimal human intervention?**

Each phase addressed a different dimension:
- **Phase I** (Distributed Systems): How do components communicate across boundaries?
- **Phase II** (Digital Platforms): How do users find what they need among millions of options?
- **Phase III** (Digital Transformation): How do organizations evolve their technology without disruption?
- **Phase IV** (Autonomous Systems): How do systems manage themselves?

The technologies changed — CORBA to REST, Solr to vector databases, manual deployment to AI agents — but the underlying question remained constant. This coherence is not accidental. It is the result of deliberately choosing each next step to build upon the previous one.

## The Rare Combination

What makes this arc valuable in today's market is not any individual phase. It is the combination:

- **PhD-level research** in autonomous systems
- **Enterprise architecture** at scale (1.9M users, 150K concurrent)
- **Production AI governance** (15+ agents, 2.5x–4x productivity)
- **Business impact metrics** (revenue, cost reduction, market position)
- **25 years of continuous practice** across Brazil and Chile

Most technology executives have either deep research or deep production experience. Very few have both — and fewer still can articulate how the research informs the production work and vice versa. My doctoral research is not abstract. It is validated daily in production enterprise environments. The MEGA IA Skills framework exists because I need it to manage the complexity of the platforms I lead.

## The Positioning

After twenty-five years, I do not position myself as a CTO, a Cloud Architect, or an IT Manager. Those are job titles. I position myself as a **Technology Transformation Executive** — someone who bridges scientific research, business strategy and technology execution to help organizations navigate the autonomous enterprise era.

The arc proves that this positioning is earned, not claimed. Every phase of the journey contributes evidence that the next phase is a natural evolution rather than a forced pivot.

## For the Next Generation

If you are early in your technology career, the lesson is not to copy my path. It is to **build your own arc deliberately**. Ask yourself:

1. What is the underlying question that connects your current work to your future ambitions?
2. Does each new role build upon the previous one, or does it restart from zero?
3. Can you articulate the intellectual thread that makes your trajectory coherent?

A career without an arc is a sequence of jobs. A career with an arc is a narrative that compounds. The difference is not talent. It is intentionality.

---

*This article was written as a personal reflection, not as a professional service offering. If you are navigating a technology transformation and want to discuss the intersection of research, strategy and execution, I am available for advisory conversations.*
