---
title: "From Master's Thesis to Product Thinking: Designing the QUALIFY Platform"
date: "2015-12-07"
category: "Digital Platforms & Product Strategy"
excerpt: "A 71-page master's thesis that anticipated today's platform economy. Designing a business model and technology architecture for a community of experts, users and companies to qualify, recommend and commercialize products and services."
tags: ["Product Strategy", "Business Model Canvas", "Lean Startup", "SOA", "Platform Architecture"]
lang: "en"
---

In 2015, while completing my Master's in Information Technology and Management at Pontificia Universidad Católica de Chile, I faced a question that remains relevant today: **how do consumers make good decisions when they are overwhelmed by infinite choice?**

This question became the foundation of my graduation thesis — a 71-page work that designed both the business model and technology architecture for **QUALIFY INC**, a platform to help consumers navigate complexity through expert validation and community-driven recommendations.

## The Paradox of Choice

The thesis started with Barry Schwartz's observation: more choice does not lead to better decisions. When consumers face hundreds of similar products, they experience decision paralysis, stress and ultimately poor outcomes. This was true in 2005 when Schwartz published *The Paradox of Choice*. It is exponentially more true today.

The specific context was the Chilean e-commerce market, which was growing rapidly but lacked mechanisms for consumers to validate quality before purchase. Users had access to products, but not to trustworthy qualification systems.

## Business Model Design

The thesis applied a dual-lens approach:

**Business Innovation Lens**: Using Business Model Canvas, Lean Canvas and Lean Startup methodology, I designed a platform where three actors interact:
- **Experts** who validate and qualify products
- **Users** who access recommendations and community reviews
- **Companies** who commercialize qualified products

The revenue model combined B2C subscriptions, B2B marketplace fees and premium expert services. The Lean Canvas helped prioritize riskiest assumptions: would users trust expert opinions? Would companies pay for qualified leads?

**Technology Architecture Lens**: The platform architecture was designed as a Service-Oriented Architecture (SOA) with REST APIs, using:
- Java Spring Framework for backend services
- Angular for the web community platform
- AWS cloud infrastructure for elasticity
- MongoDB and MySQL for polyglot persistence
- SCRUM as the development methodology

The architecture separated concerns into independent services: user management, product catalog, qualification engine, recommendation system and commercial transactions.

## Methodology and Validation

The thesis followed the Customer Development Process combined with Agile iterations:
1. **Problem discovery** — interviews with 50+ potential users and 15 companies
2. **Solution hypothesis** — prototype of the qualification workflow
3. **MVP design** — minimum platform to test the core loop
4. **Pivot or persevere** — data-driven decision framework

ArchiMate was used for enterprise architecture modeling, ensuring alignment between business processes, applications and technology infrastructure.

## Why This Matters Today

Looking back from 2024, several elements of this 2015 thesis proved prescient:

- **Platform-mediated trust** — the core idea that expert validation reduces decision fatigue is the foundation of modern review platforms, influencer commerce and AI recommendation systems
- **SOA and microservices** — the architectural approach of decoupled services communicating via APIs became the industry standard
- **Lean Startup in enterprise** — the thesis applied startup methodology inside an academic context, anticipating the corporate innovation labs that followed
- **Cloud-native by default** — designing for AWS elasticity from day one was forward-thinking in 2015

The thesis also taught me something about the relationship between research and practice. A 71-page academic document is not a product. But the discipline of documenting assumptions, testing hypotheses and architecting for scale — that discipline translates directly into the enterprise transformation work I do today.

## Key Learnings

**On business model innovation**: The Canvas frameworks are not templates to fill. They are thinking tools to surface hidden assumptions. The most valuable output of the exercise was not the canvas itself, but the list of hypotheses that needed validation.

**On technology architecture**: Designing the architecture before building taught me that every technical decision is a business decision. The choice between monolith and services, between SQL and NoSQL, between self-hosted and cloud — each carries implications for speed, cost and organizational capability.

**On product-market fit**: The thesis concluded that the Chilean market of 2015 was not mature enough for a pure QUALIFY model. The recommendation was to start B2B (qualifying products for companies) before expanding to consumer marketplace. This sequencing insight — B2B first, B2C second — remains a valid go-to-market pattern.

## The Document

The full 71-page thesis (in Spanish) covers business model design, competitive analysis, technology architecture, development methodology and financial projections. It was supervised by Professor Rodrigo Sandoval Urrich at PUC Chile's Department of Computer Science.

It represents the bridge between my earlier work in enterprise systems and my later focus on digital transformation: the moment when I began to understand that technology strategy and business strategy are the same conversation.
