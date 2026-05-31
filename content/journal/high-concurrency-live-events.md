---
title: "Handling 150K Concurrent Users: Concurrency Strategies for Live Events"
date: "2025-08-28"
category: "Enterprise Architecture"
excerpt: "How MEGA GO survived Festival de Viña 2026 with 150K concurrent users — the architecture decisions, load testing methodology and failure modes that defined the event."
tags: ["Concurrency", "Load Testing", "CDN", "Auto-scaling", "OTT"]
lang: "en"
---

The difference between a platform that works at 1,000 users and one that works at 150,000 users is not incremental optimization. It is a different category of architecture.

This article describes how MEGA GO handled 150,000 concurrent viewers during Festival de Viña 2026 — Chile's largest live music event — without a single minute of downtime. The strategies described apply to any high-concurrency system: OTT platforms, e-commerce flash sales, ticketing systems and online gaming.

## The Event Profile

Festival de Viña has a unique traffic pattern:

| Phase | Duration | User Behavior | Load Characteristics |
|-------|----------|---------------|----------------------|
| **Pre-event** | 60 min | Users open app, browse, set reminders | Steady ramp, cache warming |
| **Opening** | 5 min | 80% of viewers join simultaneously | Extreme burst, authentication spike |
| **Live streaming** | 180 min | Sustained viewing, chat, social sharing | Steady high load, CDN-dependent |
| **Peak artist** | 15 min | New viewers join, existing viewers stay | Highest concurrent count |
| **Closing** | 10 min | Mass exit, replay requests | Connection teardown, storage writes |

The 150K concurrent peak occurred during the headline artist's performance — 15 minutes of sustained load that tested every layer of the architecture.

## Strategy 1: CDN as the Primary Defense

The most important architectural decision for live events is simple: **never serve video from origin**.

During Festival de Viña:
- 94% of video segments were served from CDN edge cache
- 6% reached the origin (cache misses for new edge regions)
- 0% of video traffic hit the application servers

The CDN architecture uses a multi-tier strategy:

**Tier 1 — Edge Nodes**: 50+ points of presence across Latin America. Each node caches HLS segments (.ts files) for 24 hours and manifest files (.m3u8) for 30 seconds.

**Tier 2 — Origin Shield**: A caching layer between edge nodes and the origin streaming server. When an edge node misses, it requests from Origin Shield rather than the origin directly. This reduces origin load by an additional 60%.

**Tier 3 — Origin**: The actual streaming server (Huawei Cloud Media) that generates HLS streams from live encoding.

**Key Decision**: Pre-position content at edge nodes before the event. We push the event's first 5 minutes of segments to all edge nodes 2 hours before go-live, ensuring zero cache misses during the opening burst.

## Strategy 2: Authentication at the Edge

The opening 5-minute burst creates an authentication avalanche. 120,000 users authenticate simultaneously, each requiring:
1. OAuth2 token validation against Keycloak
2. Entitlement check (does this user have access to live events?)
3. DRM license request
4. Session initialization

At 1,500 RPS, Keycloak can handle the load. But at 25,000 RPS during the burst, it would collapse.

Our solution is **token pre-validation**:
- 30 minutes before the event, the mobile app refreshes tokens and entitlements in background
- Tokens are cached in Redis with 15-minute TTL
- During the burst, the CDN validates JWT signatures locally using cached public keys
- Only 5% of requests reach Keycloak (users with expired tokens)

This reduced authentication traffic from 120,000 requests to 6,000 requests — well within Keycloak capacity.

## Strategy 3: Auto-scaling with Predictive Warmup

Standard auto-scaling reacts to metrics: when CPU > 70%, add instances. For live events, reactive scaling is too slow. By the time metrics detect load, users are already experiencing buffering.

We use **predictive scaling**:

1. **Historical baseline**: Festival de Viña 2025 peaked at 95K users. We projected 150K based on marketing spend and app install growth.

2. **Pre-scaling**: 2 hours before the event, we provision:
   - CDN capacity: 200% of projected peak
   - API servers: 300% of normal capacity
   - Database connections: 250% of normal pool
   - Redis cluster: Added 2 read replicas

3. **Scheduled scaling**: Using Huawei Cloud's scheduled scaling policies, instances are added at T-60 minutes, T-30 minutes, and T-5 minutes — matching the traffic ramp pattern.

4. **Reactive fallback**: If actual load exceeds projections by 20%, reactive auto-scaling kicks in with 2-minute instance provisioning.

**Key Decision**: Over-provision rather than optimize. The cost of idle capacity for 4 hours is negligible compared to the cost of a failed live event.

## Strategy 4: Graceful Degradation

When load exceeds capacity, the system must degrade gracefully rather than fail catastrophically. We defined four degradation levels:

**Level 0 — Normal**: All features operational. 100% video quality, real-time chat, social sharing.

**Level 1 — Chat disabled**: When concurrent users exceed 100K, Firebase Realtime Database throttles. Chat is disabled with a banner: "Chat paused due to high demand. Enjoy the show!"

**Level 2 — Quality reduction**: When CDN edge nodes approach capacity, clients are instructed to switch from HD to SD. This reduces bandwidth per user by 60% and increases CDN capacity by 2.5x.

**Level 3 — Regional fallback**: If a regional CDN node fails, traffic routes to the nearest healthy node with slightly higher latency. Users experience a 2-3 second buffering pause, then normal playback resumes.

**Level 4 — Emergency mode**: If the origin streaming server fails, we serve the last 30 seconds of buffered content on loop while engineers restore the origin. This has never been needed in production.

**Key Decision**: Degradation decisions are automated based on real-time metrics, not manual. Human reaction time is too slow for live events.

## Strategy 5: Load Testing with Production Fidelity

We tested Festival de Viña capacity using k6 with a test script that mimicked real user behavior:

```javascript
export const options = {
  stages: [
    { duration: '60m', target: 50000 },   // Pre-event ramp
    { duration: '5m', target: 150000 },    // Opening burst
    { duration: '180m', target: 150000 },  // Sustained load
    { duration: '15m', target: 150000 },   // Peak artist
    { duration: '10m', target: 0 },        // Mass exit
  ],
};
```

The test infrastructure mirrored production:
- Same CDN configuration (different domain)
- Same API servers (isolated cluster)
- Same databases (read replicas only)
- Same DRM license servers (staging environment)

**Critical Finding**: At 140K concurrent users, we discovered that the MDS API's connection pool to MongoDB was exhausting. The pool size was 100 connections; at 140K users, concurrent catalog queries exceeded 100. We increased the pool to 500 and added connection pooling at the application layer (PgBouncer-style for MongoDB).

Without this test, the production event would have failed.

## The Failure Modes We Did Not See

Every live event has surprises. Festival de Viña had two:

**Surprise 1 — Geographic shift**: 40% of viewers were in regions we had not seen in previous events (northern Chile, rural areas). These regions had smaller CDN edge nodes that were not pre-warmed. We saw 12% cache miss rate in these regions vs. 2% in Santiago. Next event, we pre-warm all nodes regardless of historical patterns.

**Surprise 2 — Device diversity**: 8% of viewers used devices we had not tested (old Samsung TVs, generic Android boxes). These devices had different DRM capabilities and stream format support. We added device detection and format fallback logic during the event — a risky change that required emergency deployment. Next event, we test the top 50 device models rather than the top 20.

## The Cost of Scale

Running a live event at 150K concurrent users has real infrastructure costs:

| Component | Normal Day | Festival de Viña | Increase |
|-----------|-----------|------------------|----------|
| CDN bandwidth | 15 TB/day | 850 TB/day | 57x |
| API servers | 6 instances | 24 instances | 4x |
| Database | 2 replicas | 6 replicas | 3x |
| Redis | 3 nodes | 5 nodes | 1.7x |
| DRM licenses | 50K/day | 180K/day | 3.6x |
| **Total cost** | $1,200/day | $48,000/day | 40x |

The $48,000 event day cost is recovered through advertising revenue ($120K) and new subscriptions ($85K) generated during the event. But the cost model requires accurate forecasting — over-provision by 50% and profitability disappears.

## The Lesson

High-concurrency architecture is not about handling average load. It is about handling peak load while degrading gracefully when assumptions fail.

The strategies that matter:
1. **CDN-first**: Serve everything from edge nodes
2. **Pre-validate auth**: Reduce real-time authentication to the minimum
3. **Predictive scaling**: Provision before the event, not during
4. **Graceful degradation**: Define what features turn off and in what order
5. **Production-fidelity testing**: Test with real user behavior patterns, not synthetic load

Festival de Viña 2026 proved that these strategies work. Festival de Viña 2027 will test whether we learned from the surprises.
