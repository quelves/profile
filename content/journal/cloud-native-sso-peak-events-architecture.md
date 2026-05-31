---
title: "Cloud-Native Architecture for SSO: Supporting 150K Users During Peak Events"
date: "2025-09-10"
category: "Enterprise Architecture"
excerpt: "How we designed Megamedia's SSO on Kubernetes to support everything from normal operations to 150K concurrent users during the Festival de Viña del Mar — and why automatic autoscaling is the wrong answer for live events."
tags: ["Cloud-Native", "SSO", "Keycloak", "Kubernetes", "Scalability", "Huawei Cloud"]
lang: "en"
---

Single Sign-On is the most invisible and most critical infrastructure in any digital platform. When it works, nobody mentions it. When it fails, nothing else works. At Megamedia, MEGA GO's SSO authenticates 1.91 million active users, and during the Festival de Viña del Mar 2026 it supported 150,000 concurrent users without a single authentication incident.

This article is not a Keycloak guide. It is a narrative of cloud-native architectural decisions made to transform a monolithic authentication system into a platform that scales from 150 RPS on a regular Tuesday to 500 RPS peak during a massive event — and does so predictably, not reactively.

## The Problem: When Login Becomes the Bottleneck

In 2024, Megamedia's SSO ran on two static virtual machines. It worked well for normal operations. But when a sports event generated a push notification to 100,000 simultaneous users, the system collapsed within minutes. Not because Keycloak was slow, but because the underlying architecture was not designed for wave-pattern traffic spikes.

Live events — sports or cultural — do not generate uniform load. They generate a wave pattern:

| Phase | Time | What Happens | SSO Load |
|---|---|---|---|
| **Pre-event** | 19:30 | Configuration deploy, pre-warming | Low, preparatory |
| **Wave 1** | 20:00 | Push notification → mass login | Authentication peak |
| **Show** | 20:30 | Users on CDN watching content | Low (core free) |
| **Wave 2** | 21:45 | Artist change / halftime | Refresh tokens |
| **Wave 3+** | 23:30, 01:30 | More transitions | Repeated peaks |

The trap is that between waves CPU drops to 25-35%. A reactive autoscaler would interpret this as "excess resources" and reduce pods. When the next wave arrives, the pods are gone — and Huawei Cloud takes 2 minutes to provision new nodes. Two minutes during an authentication peak is an eternity.

## The Strategic Vision: SSO as Platform, Not Application

The most important strategic decision was to reconceptualize SSO. It is not an application that "we need to keep running." It is an identity platform that must operate with the same reliability standards as a financial system:

- **Availability target**: 99.9% (maximum 8.7 hours downtime per year)
- **RPO/RTO**: RPO = 0 (we don't lose active sessions), RTO < 5 minutes
- **Operational capacity**: From 150 RPS base to 5,000 RPS peak with the same architecture
- **Predictable cost**: Don't pay for idle capacity, but don't risk uptime for savings

This vision led to three fundamental architectural decisions:

1. **Cloud-native from the ground up**: Kubernetes StatefulSet on Huawei Cloud CCE, not static VMs
2. **Pre-calculated RPS configurations**: Don't adjust resources on the fly during an event
3. **Anti-scaling during events**: Pre-warm and hold, never reduce between waves

## Cloud-Native Architecture: Kubernetes + Keycloak + Infinispan

The current architecture runs on Huawei Cloud CCE (Kubernetes 1.31+) as a Helm-managed StatefulSet:

```
Users → CDN/WAF → Huawei ELB → Traefik Ingress
                                    ↓
                        ┌───────────────────────┐
                        │   Kubernetes CCE      │
                        │  ┌─────┐ ┌─────┐     │
                        │  │KC-0 │ │KC-1 │ ... │  StatefulSet
                        │  │ 8c  │ │ 8c  │     │  (3-15 pods)
                        │  │17GB │ │17GB │     │
                        │  └──┬──┘ └──┬──┘     │
                        │     └───────┘        │
                        │    JGroups TCP        │
                        │  Infinispan Cache     │
                        │   CACHE_OWNERS=2      │
                        └──────────┬────────────┘
                                   ↓
                        ┌───────────────────────┐
                        │  RDS PostgreSQL 14    │
                        │  (4,200 connections)  │
                        └───────────────────────┘
```

### Why StatefulSet and not Deployment?

Keycloak with distributed Infinispan requires persistent pod identity. Each pod has:
- A stable name (`keycloak-0`, `keycloak-1`)
- A JGroups cluster view that survives restarts
- A distributed cache fragment with `CACHE_OWNERS_COUNT=2`

A Deployment recreates pods with random names, breaking cluster membership. The StatefulSet allows a restarted pod to rejoin the cluster with the same identity and recover its cache fragment.

### Discovery with DNS_PING

In Kubernetes, pods discover each other via `DNS_PING` over Keycloak's headless service. When a new pod starts:

1. Resolves the service DNS to get existing peer IPs
2. Joins the JGroups cluster via TCP (not UDP, due to Huawei Cloud network restrictions)
3. Initiates state transfer from peers that hold its data
4. Once synchronized, begins serving traffic

State transfer of 100,000 sessions takes 2-5 minutes. This is the fundamental reason for anti-scaling: we cannot allow a cold pod to warm up during a wave.

## Two Operating Modes: OPT-V4 and FVM 2026

SSO operation is divided into two pre-calculated configurations, not dynamic adjustments:

### OPT-V4: Normal Operations

| Parameter | Value | Justification |
|---|---|---|
| **Node** | c6.3xlarge.2 (12 vCPU / 24 GB) | Optimized CPU/thread ratio |
| **CPU/Pod** | 8 vCPU (67% of node) | 70% Huawei safety margin |
| **RAM/Pod** | 17 GB (70% of node) | Avoids CCE critical alerts |
| **JVM Heap** | ~8.5 GB (50% of RAM) | Efficient G1GC, <200ms pauses |
| **Undertow Workers** | 192 | 20:1 ratio, CPU-bound |
| **DB Pool** | 80 connections/pod | 400 total at 5 pods, 90% DB margin |
| **Replicas** | 3-15 (manual) | Controlled scaling |

OPT-V4 is the base configuration validated on March 6, 2026. With 5 pods it supported 1,500 RPS in k6 tests with 0% errors. For normal operations (<150 RPS), it runs with 3 pods. For predictable peaks, manually scale to 5-8.

### FVM 2026: Massive Event

| Parameter | Value | Justification |
|---|---|---|
| **Node** | c7n.6xlarge.2 (24 vCPU / 48 GB) | Double capacity per pod |
| **CPU/Pod** | 16 vCPU (67% of node) | 70% safety on larger flavor |
| **RAM/Pod** | 32 GB | 16 GB heap + 4 GB DirectMemory + margin |
| **JVM Heap** | 16 GB (50%) | G1GC <50ms pauses |
| **Undertow Workers** | 320 | 20:1 ratio on 16 vCPU |
| **DB Pool** | 80 connections/pod | 1,200 total at 15 pods, 71% margin |
| **Replicas** | 5-15 (pre-warmed) | No HPA during event |

FVM 2026 was the configuration used for the Festival de Viña del Mar 2026. It started with 5 pre-warmed pods at 19:30 and manually scaled to 8 during waves. It was never reduced between artists.

### Configuration Matrix by RPS

| Event | Concurrent Users | RPS Target | Configuration | Replicas |
|---|---|---|---|---|
| Normal operations | ~5,000-10,000 | ≤1,500 | OPT-V4 | 3-5 |
| Regular match | ~3,000-5,000 | 300-500 | 300/500 RPS | 3-4 |
| Copa del Rey | ~60,000 | 5,000 | Event | 10 |
| Festival de Viña | ~150,000 | 3,000-4,000 | FVM 2026 | 5-15 |
| El Clásico | ~100,000 | 10,000 | 10K RPS | 20 |
| Champions Final | ~250,000 | 25,000 | 25K RPS | 30 |

> **Critical note**: RPS targets are for real traffic. Synthetic k6 tests generate 3-10x more computational load per RPS due to session churn. A 1,500 RPS k6 test equates to approximately 3,000-4,000 RPS of real traffic.

## The CPU-Bound Lesson: Why We Reduced the Heap

One of the most counterintuitive technical decisions was reducing the JVM heap from 24 GB to 16 GB (and in OPT-V4, from 18 GB to 8.5 GB).

Keycloak performs intensive cryptographic operations: PBKDF2 for password hashing, RS256 JWT signing, token validation on every request. These operations saturate CPU before exhausting memory. The system is **CPU-bound, not memory-bound**.

| Configuration | Heap | G1GC Pauses | Startup | Throughput |
|---|---|---|---|---|
| OPT-V3 (previous) | 18 GB | 200-400ms | 8-10 min | Good |
| **OPT-V4** | **8.5 GB** | **<200ms** | **5-7 min** | **Optimal** |
| FVM 2026 | 16 GB | <50ms | 5-7 min | Optimal |

With a smaller heap:
- G1GC collections are more frequent but shorter
- Pod startup is faster (less heap initialization)
- Less memory pressure reduces OOM Killer risk
- Freed CPU is allocated to cryptographic computation threads

The golden rule that emerged: **heap = 50% of allocated RAM**, never more. The remainder is reserved for DirectMemory (Undertow NIO buffers), Infinispan native caches, and the operating system.

## The Wave Pattern: Anti-Scaling as Strategy

For years, cloud-native orthodoxy has preached: "scale automatically based on demand." For live events, this is dangerous. The demand valley between waves is lethal.

```
19:30 ── Pre-warm: 5 fixed pods, HPA disabled
20:00 ── WAVE 1: CPU 25% → 85% (mass login)
20:30 ── Show: CPU 85% → 25% (users on CDN)
        ❌ HPA would say "excess pods" → scale down
        ✅ We say "keep warm"
21:45 ── WAVE 2: CPU 25% → 75% (refresh tokens)
        ✅ Pods are already there, no provisioning delay
```

### FVM 2026 Operational Timeline

| Time | Action | Pods | HPA |
|---|---|---|---|
| 19:30 | Pre-warming | 5 | Disabled |
| 19:45 | Post-deploy validation | 5 | Disabled |
| 20:00 | Event start | 5-8 | Disabled |
| 20:00-03:00 | Active event | 5-15 (manual) | Disabled |
| 03:00 | Event end | 8 | Disabled |
| 03:30 | Cooldown | 8→5→3 | Gradually re-enabled |

The cost of keeping 8 idle pods between waves is insignificantly smaller than the reputation cost of users who cannot authenticate because the system is provisioning nodes.

## Production Metrics: The 3.2x Fallacy

In February 2026, before the Festival de Viña, we ran k6 load tests that reported 1,600 RPS peak with 2,000 VUs. The first interpretation was: "we have a 3.2x safety factor over the expected 500 RPS." This conclusion was mathematically correct and operationally dangerous.

### Why Synthetic Tests Don't Correlate

| Dimension | k6 Test | Real Traffic | Difference |
|---|---|---|---|
| Session churn | Login→logout every 5s | Login 1x every 3-7 days | **225x more intensive** |
| Think time | 1-2 seconds | Minutes between actions | **36x denser** |
| Token refresh | Every 4 seconds | Every 30 minutes | **450x more frequent** |
| CPU per RPS | ~50% estimated | 5% measured | **10x more efficient** |

A real user generates ~2 authentication operations per hour (login + occasional refresh). A k6 VU generated 450 auth operations/hour. The test measured synthetic throughput, not real user capacity.

### Real Metrics from Festival de Viña 2026

| Metric | Measured Value |
|---|---|
| **Concurrent users** | 150,000 |
| **Real peak RPS** | ~500 RPS |
| **CPU during peak** | ~5% |
| **P95 Latency** | 14.5 ms |
| **Error rate** | 0.00% |
| **Incidents** | 0 |

The system operated at 5% CPU during the event's highest peak. This does not mean it was overprovisioned. It means real traffic is organically different from synthetic traffic. Real users maintain long sessions, refresh tokens every 30 minutes, and spend most of their time on CDN — not hitting SSO.

### Adjusted Capacity Model

| Scenario | Real RPS | Est. CPU | P95 Latency | Status |
|---|---|---|---|---|
| Baseline | 122 | 1.2% | 10ms | ✅ Normal |
| FVM peak | 500 | 5% | 14.5ms | ✅ Event |
| Comfortable capacity | 2,000 | 20% | ~50ms | ✅ Safe |
| Thread limit | 5,000 | 50% | ~200ms | ⚠️ Saturation |
| GC collapse | 8,000+ | 80%+ | >1,000ms | 🔴 Unstable |

The system's real capacity is ~2,000 RPS with acceptable degradation, and ~5,000 RPS before Undertow workers saturate. The bottleneck is not CPU or memory: it is the number of workers available to process concurrent requests.

## Bottlenecks and Architectural Decisions

### Bottleneck #1: Huawei ELB (~8,000 RPS)

Huawei Cloud's Elastic Load Balancer has a technical limit of ~8,000 RPS. For larger events (Champions, World Cup), we have requested limit increases. This is the most critical bottleneck because it is outside our direct control.

### Bottleneck #2: Infinispan State Transfer (2-5 min)

When a new pod joins a cluster with 100,000 active sessions, it must synchronize ~50 MB of data from 19 peers (in a 20-pod cluster). During this time:
- The new pod does not serve traffic
- Peers dedicate CPU to transfer
- Cluster latency increases 10-20%

**Mitigation**: Mandatory pre-warming. Never add cold pods during a wave.

### Bottleneck #3: JGroups Overhead (+10% CPU)

In a 20-pod cluster, JGroups generates ~1,140 heartbeats/second. Estimated overhead is ~10% additional cluster CPU. Acceptable up to 15 pods. After 15, each additional replica contributes less marginal capacity.

| Replicas | Total Capacity | Efficiency | Recommendation |
|---|---|---|---|
| 5 | 3,500 RPS | 100% | ✅ Stable base |
| 8 | 5,420 RPS | 90% | ✅ FVM optimal |
| 10 | 6,800 RPS | 90% | ✅ Best cost/benefit |
| 15 | 9,000 RPS | 80% | ⚠️ Slow state transfer |
| 20 | 12,000 RPS | 70% | ⚠️ Technical maximum |

### Decision: Mandatory Node Affinity

The OPT-V4 configuration has mandatory `nodeAffinity` for `c6.3xlarge.2`. Pods will not schedule on other flavors. This is not an arbitrary restriction: thread ratios (20:1 for Undertow, 10:1 for EJB) are calculated specifically for 12 vCPUs. Running on an 8 vCPU node would cause Undertow to request 160 workers for 8 cores, generating context thrashing.

### Decision: Ban kubectl exec in Production

In February 2026 we confirmed that running `jboss-cli.sh --connect` via `kubectl exec` triggers Kubernetes' OOM Killer. The command consumes additional memory that pushes the pod over its limit, and Kubernetes kills it.

**Solution**: All configuration is applied via ConfigMap + `embed-server` (offline CLI mode). Production validations are read-only: metrics via Prometheus endpoint, logs via `kubectl logs`, and environment variables via `kubectl get pod -o jsonpath`.

## Operations: Checklists, Runbooks, and Culture

Cloud-native architecture is not just technology. It is operational culture. For each event we follow a 30+ item checklist validated by automated scripts:

**Pre-deploy (19:30)**
- [ ] Node affinity verified for correct flavor
- [ ] Resource limits ≤70% of node capacity
- [ ] JVM heap = 50% of RAM, G1GC configured
- [ ] Undertow workers = 20:1 ratio
- [ ] EJB pools: SLSB = 10:1 ratio, MDB = 2:1 ratio
- [ ] DB pool = 80 connections/pod
- [ ] JGroups cluster formed without errors
- [ ] Probes: correct timeouts (not 1s as in the January 2026 incident)
- [ ] PDB: minAvailable ≤ replicas
- [ ] Backup of previous configuration

**During event (20:00-03:00)**
- [ ] CPU < 70%, memory < 70%
- [ ] P95 latency < 500ms
- [ ] Error rate < 1%
- [ ] Ready pods = expected
- [ ] Rollback command at hand
- [ ] Emergency scaling plan (up to 15 pods)

The validation script `validar-fvm-2026-config.sh` executes these checks in ~30 seconds without touching a single running pod.

## Future Vision: Toward Autonomous SSO

The current architecture is reactive at its best. We pre-warm, monitor, scale manually. The next evolution is an SSO that configures itself automatically based on the event calendar:

1. **Integrated event calendar**: The system reads MEGA GO's schedule and pre-warms automatically 30 minutes before
2. **Configuration decision tree**: Based on event type (football, FVM, concert), applies the corresponding RPS configuration without human intervention
3. **Predictive scaling**: ML models that predict the wave based on historical patterns (which artist generates more traffic, which football match mobilizes more users)
4. **Multi-region failover**: Session replication between Huawei Cloud availability zones for region failure tolerance

The goal is not to eliminate operators. It is to eliminate repetitive mechanical decisions so operators can focus on the unpredictable.

## The Lesson

Cloud-native architecture is not about using Kubernetes, Helm, or autoscalers. It is about designing systems that understand their own behavior under stress and prepare for it predictably.

The lessons from Megamedia's SSO are applicable to any critical system facing variable loads:

1. **Know your real load**: Synthetic tests are useful for finding bottlenecks, not for estimating real user capacity
2. **Pre-warm, don't react**: Cloud provisioning takes minutes; traffic spikes last seconds
3. **Optimize for the right resource**: Keycloak is CPU-bound; a larger heap doesn't help, a more efficient GC does
4. **Document your decisions**: Every configuration value has a documented reason. There is no "magic" in the configuration
5. **Operate with checklists**: The most reliable infrastructure is the one that is validated systematically, not the one that depends on an expert's memory

> "SSO is not an operational cost. It is a strategic asset. When a user can authenticate in 14.5ms during the year's most watched event, they are not seeing Keycloak or Kubernetes. They are seeing a platform that respects their time."
