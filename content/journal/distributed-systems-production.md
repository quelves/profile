---
title: "Distributed Systems in Production: What 60M Health Records Taught Me About OTT Scale"
date: "2025-04-20"
category: "Enterprise Architecture"
excerpt: "The same distributed systems principles I applied building Brazil's national health registry for 60 million users in 1998 are the ones I use today for OTT platforms serving 150K concurrent viewers. Some patterns are timeless."
tags: ["Distributed Systems", "CORBA", "Microservices", "Scalability", "Architecture"]
lang: "en"
---

In 1998 I built a distributed system using CORBA, COM/DCOM and Delphi to register 60 million users into Brazil's Unified Health System (SUS). In 2024 I designed a hybrid on-premise/cloud architecture for an OTT platform serving 150K concurrent users during live events.

The technologies could not be more different. The principles are identical.

This article connects two decades of distributed systems practice — from CORBA components to Kubernetes microservices — through the patterns that transcend any specific technology stack.

## Pattern 1: Service Boundaries Define Everything

In 1998, the SUS registry used CORBA to decouple:
- **Identity Service**: Person matching across 60M records
- **Compensation Service**: Medical reimbursement processing
- **Scheduling Service**: Appointment booking

Each service had its own data model, its own deployment unit, and communicated via ORB (Object Request Broker). The boundaries were physical — separate processes on separate servers.

In 2024, MEGA GO uses the same boundary logic:
- **OTT API**: Content catalog and streaming
- **PAY API**: Subscription and payment processing
- **SSO API**: Authentication and identity
- **MDS API**: Media delivery and DRM

The communication protocol changed from CORBA IIOP to HTTP/REST and gRPC. The boundary philosophy did not.

**Lesson**: Service boundaries should be drawn around business capabilities, not technical layers. The Identity Service in 1998 and the SSO Service in 2024 do the same thing: answer the question "who is this user?"

## Pattern 2: Location Transparency Creates Flexibility

CORBA's core promise was location transparency: a client calls a method on an object without knowing whether that object is in the same process, another process on the same machine, or a server across the network.

In 1998, this allowed us to start with monolithic deployment (all services on one server) and gradually distribute as load increased — without changing client code.

In 2024, Kubernetes delivers the same promise through Service Discovery and DNS. A microservice calls `http://ott-api:8080` without knowing whether the target is a pod on the same node, another node in the same cluster, or a pod in a different region.

**Lesson**: Design for location transparency from day one. The ability to move services without changing callers is the foundation of scalable architecture.

## Pattern 3: The Fallacies of Distributed Computing Still Hurt

Peter Deutsch's Eight Fallacies of Distributed Computing were published in 1994. They are still the primary source of production outages in 2024:

| Fallacy | 1998 Lesson | 2024 Lesson |
|---------|-------------|-------------|
| The network is reliable | CORBA timeouts during peak hospital hours | HTTP retries during live events |
| Latency is zero | ORB marshaling overhead | Kubernetes service mesh latency |
| Bandwidth is infinite | 64Kbps hospital connections | 4K HDR streaming requirements |
| The network is secure | No TLS in CORBA | Zero-trust service mesh |
| Topology doesn't change | Server relocations broke references | Pod rescheduling changes IPs |
| There is one administrator | Federal + state + hospital IT | Platform + DevOps + SRE teams |
| Transport cost is zero | ORB licensing fees | Cloud egress charges |
| The network is homogeneous | HP-UX + Windows + Solaris | x86 + ARM + GPU nodes |

Every distributed system I have built — 1998 or 2024 — eventually violated at least three of these fallacies in production.

**Lesson**: The fallacies are not theoretical. They are the checklist you should review before every architectural decision.

## Pattern 4: State Management Is the Hard Problem

In 1998, the SUS registry used Orbix's persistent object service to maintain state across server restarts. In 2024, MEGA GO uses:

- **PostgreSQL**: Transactional state (subscriptions, payments, user profiles)
- **MongoDB**: Content catalog (flexible schema for diverse media types)
- **Redis**: Session state and rate limiting (sub-millisecond access)
- **Neo4j**: Identity graph (relationships between users, devices, profiles)
- **Firestore**: Real-time configuration and feature flags

The technology changed. The problem did not: **how do you maintain consistency across distributed state?**

In 1998 we used two-phase commit across CORBA services. In 2024 we use Saga pattern across microservices. Both approaches have trade-offs:

- **2PC**: Strong consistency, but blocking and fragile under partition
- **Saga**: Eventual consistency, but resilient and non-blocking

For MEGA GO's payment flow, we use Saga: PAY API processes the charge, emits a PaymentCompleted event, OTT API extends the subscription, SSO API updates entitlements. If any step fails, compensating transactions rollback the previous steps.

**Lesson**: There is no universal answer to distributed state. Choose consistency models based on business requirements, not technology preferences.

## Pattern 5: Observability Is Not Optional

In 1998, debugging a distributed CORBA system meant reading ORB logs across multiple servers and correlating timestamps manually. A single user complaint could take days to trace.

In 2024, MEGA GO uses:
- **Distributed tracing** (OpenTelemetry) across all seven APIs
- **Structured logging** (JSON) with correlation IDs
- **Metrics** (Prometheus) for latency, throughput and error rates
- **Real-user monitoring** (Youbora) for video quality experience

When a user reports buffering during Festival de Viña, we can trace the exact request path: device → CDN → MDS API → DRM license server → playback. The root cause identification time dropped from days to minutes.

**Lesson**: Build observability into the architecture, not as an afterthought. Every service boundary should emit telemetry that can be correlated across the distributed system.

## The Timeless Principles

After 25 years of building distributed systems, these principles remain constant:

1. **Boundaries around business capabilities**, not technical layers
2. **Location transparency** as a design constraint
3. **Respect the fallacies** — they will bite you
4. **Choose consistency models** based on business needs
5. **Observability is architecture**, not infrastructure

The technologies will change again. CORBA gave way to SOAP, then REST, then gRPC, then GraphQL. The principles will not.
