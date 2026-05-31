---
title: "From Process Observation to Autonomous Correction: A 25-Year Arc"
date: "2025-11-20"
category: "Enterprise Architecture"
excerpt: "My 2016 IEEE paper on process mining in advertising was a first step in understanding how to extract actionable intelligence from execution logs. Today, that research evolves into systems that not only analyze processes, but autonomously correct them."
tags: ["Process Mining", "Autonomous Systems", "Process Analysis", "MEGA GO", "Research"]
lang: "en"
---

In 2016 I published an IEEE paper on process mining applied to digital advertising. The work demonstrated how to extract behavioral patterns from campaign execution logs to optimize budget allocation across channels. At that time, I thought the next step would be building more sophisticated dashboards.

I was wrong. The next step is not better visualization. The next step is **autonomous action**.

This article describes the intellectual arc connecting that 2016 paper to my current doctoral research: a journey from descriptive process analysis toward systems that observe, predict, and correct organizational processes without human intervention.

## Phase 1: Observation (1998–2016)

My first contact with knowledge extraction from execution data was in 1998, building Brazil's national health registry. The system generated logs of every transaction: who accessed what record, when, from which hospital, with what result. Back then, these logs served mainly for audit and legal compliance.

In 2004, working with search engines at GuiaMais, I began analyzing query logs to understand user behavior patterns. Which search terms led to conversions? Which navigation patterns indicated purchase intent? This was primitive descriptive analytics, but it already pointed toward something larger: **execution logs contain intelligence that traditional systems waste**.

The 2016 paper formalized this intuition. Using process mining techniques on execution logs from a digital advertising platform, we demonstrated that it was possible to:
- Reconstruct the actual business process flow (not the documented flow)
- Identify bottlenecks where campaigns lost efficiency
- Detect deviations between designed process and executed process
- Quantify the financial impact of each deviation

The paper concluded with a recommendation that I now recognize as limited: use these insights to help managers make better decisions. The limitation was not in the analysis. It was in the assumption that the correct response to an insight was to **inform a human**.

## Phase 2: Predictive Analysis (2016–2020)

After the paper, the natural work was to extend analysis from descriptive to predictive. Instead of asking *"what happened?"*, we began asking *"what will happen?"*.

At gurú (Yell LATAM), we applied predictive models over sales process logs:
- Which leads have the highest conversion probability based on their journey through the process?
- At which funnel stage are the most valuable customers lost?
- Which sales team behavior patterns correlate with higher revenue?

The results were useful but frustrating. Predictive models generated actionable insights, but action required someone to read the report, understand the recommendation, decide to act, and execute the change. The lag between prediction and action was days or weeks. By the time someone acted, conditions had changed.

The lesson was clear: **predicting without autonomous action capability is like diagnosing a disease without being able to prescribe treatment**.

## Phase 3: Automated Prescription (2020–2024)

At Megamedia, the MEGA GO platform generates millions of events daily: users authenticating, content playing, payments processing, ads being served. Each event is a data point describing the system's state at a moment in time.

We built analytics pipelines that don't just predict: **they prescribe**. For example:

**Content prescription**: When the model detects that a user segment is abandoning the platform (churn prediction), the system doesn't just alert: it automatically generates a retention campaign with personalized content, specific discounts, and targeted push notifications.

**Infrastructure prescription**: When streaming logs show video quality degradation in a specific region, the system doesn't just report: it automatically reroutes traffic to an alternative CDN and scales capacity in that region.

**Monetization prescription**: When subscription log analysis detects that a user is about to cancel, the system automatically generates a personalized retention offer based on their viewing history.

These automated prescriptions demonstrated that autonomous action was possible, but had one limitation: **each prescription was hard-coded for a specific domain**. The system knew how to retain OTT users, but didn't know how to apply the same logic to sales or support processes.

## Phase 4: Autonomous Correction (2024–Next)

My current doctoral research seeks to generalize automated prescription toward **autonomous process correction**. The difference is subtle but profound:

- **Automated prescription**: A human system designs a rule (*"if churn > 80%, send discount"*), and the system executes it automatically.
- **Autonomous correction**: The system detects a problem, formulates a hypothesis about its cause, designs a remedy, executes the remedy, and verifies whether the problem was resolved — all without a human having defined the rule in advance.

The autonomous correction architecture we are designing consists of four components:

### 1. Process Observability

Not just technical metrics (CPU, memory, latency), but **process metrics**: How long does it take a user to complete a subscription? How many steps does it require? Where do they abandon? How does this vary by segment, by hour, by device?

In MEGA GO, this is implemented through:
- **Distributed tracing** (OpenTelemetry) that follows each business transaction across microservices
- **Event sourcing** where system state is reconstructed from an immutable event log
- **Real-user monitoring** (Youbora) that measures video quality experience as a proxy for satisfaction

### 2. Process Anomaly Detection

A machine learning model trained on historical logs learns what constitutes "normal" process behavior. When current behavior deviates significantly, the system detects an anomaly.

Anomalies can be:
- **Systemic**: The entire process becomes slower (e.g., authentication latency increases 3x)
- **Segmented**: A subset of users experiences degradation (e.g., Android TV users in rural regions)
- **Structural**: The process flow changes (e.g., 40% of users skip a step they previously completed)

### 3. Causal Diagnosis

Anomaly detection answers *"something is wrong"*. Causal diagnosis answers *"why?"*.

We use causal inference techniques on execution logs to distinguish correlation from causation. For example: if subscription abandonment rate increases after a deployment, was the deployment the cause? Or was it a pricing change that happened the same day? Or CDN degradation that affected the streaming experience?

Causal diagnosis in production is difficult because enterprise systems have multiple simultaneously changing variables. Our approach combines:
- **Counterfactual analysis**: What would have happened if we hadn't made the deployment?
- **Variable isolation**: A/B tests in production where a subset of users receives the change and another doesn't
- **Causal graph modeling**: Representing domain knowledge as a causal graph that guides inference

### 4. Remedy Execution and Verification

Once the cause is diagnosed, the system executes a remedy and verifies its effectiveness:
- **Remedy**: If diagnosis indicates a microservice has a memory leak, the system restarts the instance and increases the connection pool
- **Verification**: Monitors process metrics for 15 minutes post-remedy to confirm the anomaly was resolved
- **Rollback**: If the remedy worsens the situation, the system automatically reverts and escalates the incident to a human

## Case Study: Festival de Viña 2026

During the 2026 Festival de Viña, the MEGA GO platform processed 150,000 concurrent users. The generated logs allowed us to observe an interesting case of semi-autonomous correction:

**Detected anomaly**: 40 minutes after the event started, successful authentication rate dropped from 98% to 87%. Detection was automatic (threshold-based alerting).

**Diagnosis**: Log analysis showed failures were concentrated in users with OAuth2 tokens issued more than 12 hours before. Cause: a Redis cache TTL configuration that hadn't been updated after a recent Keycloak change.

**Remedy**: The operations team manually executed a session cache flush and adjusted TTL. Total time between detection and resolution was 8 minutes.

**The lesson**: In 2026, diagnosis required a human. In 2027, the goal is for the system to detect, diagnose, and execute the remedy without human intervention — because the MEGA IA Skills Checkpoint Protocol already has the domain knowledge needed to understand the relationship between OAuth2 tokens, Redis TTL, and authentication rates.

## Connection to Doctoral Research

The Process Intelligence & Mining research line is one of the three pillars of my thesis. Its specific contribution is demonstrating that:

1. **Execution logs are an underutilized knowledge source**: Most organizations store logs for compliance and debugging, but don't use them for process optimization.

2. **Analysis must evolve from descriptive to autonomous**: Each phase of the arc (observation → prediction → prescription → correction) represents an order of magnitude of added value.

3. **Autonomous correction requires domain knowledge**: A generic system cannot diagnose why an OTT's authentication fails. It needs to understand the architecture, dependencies, and business context.

## The Lesson

Process mining is not a visualization discipline. It is an action discipline. The value is not in knowing what happened. It is in the system doing something about it before a human realizes there is a problem.

Organizations that invest in process observability today — not just technical metrics, but business metrics derived from execution logs — are building the foundation for autonomous systems tomorrow. Those that don't will continue watching dashboards while their processes silently degrade.
