---
title: "Caching Strategies for High-Concurrency Media Platforms"
date: "2025-05-12"
category: "Enterprise Architecture"
excerpt: "A production-tested caching hierarchy for OTT platforms: from HTTP client cache and Room database on the device, through Redis and CDN at the edge, to in-memory indexes in the search cluster."
tags: ["Cache", "Redis", "CDN", "Performance", "OTT"]
lang: "en"
---

Caching is the single most effective performance optimization in media platforms — and the single most common source of subtle bugs. This article describes the four-layer caching hierarchy we use at Megamedia, from the user's device to the origin server, and the decisions that determine what goes where.

## Layer 1: Client-Side HTTP Cache

The first line of defense is OkHttp's built-in cache on the Android device. Every API response includes cache-control headers that tell the client how long it can reuse the response without revalidating:

```
Cache-Control: max-age=3600, stale-while-revalidate=86400
```

This means:
- For the first hour, the response is served from disk cache without any network request
- For the next 24 hours, the stale response is served immediately while a background request refreshes it

For the MEGA GO content catalog — which changes only when new content is published — this reduces API load by ~70% during normal browsing. The catalog API serves 10K+ RPS during peak; with client caching, only ~3K reach the origin.

**Key decision**: Use `stale-while-revalidate` aggressively for immutable data (content metadata, category trees) and conservatively for mutable data (user subscriptions, watch history).

## Layer 2: Local Database (Room)

Not all data fits the HTTP request/response model. User preferences, watch history, downloaded content metadata and favorites require structured local storage.

MEGA GO uses Room with the following caching strategy:

- **Write-through**: Every user action writes to Room immediately, then syncs to the remote API in background
- **Read-first**: Every read hits Room first; if data is stale (>5 minutes for subscriptions, >1 hour for catalog), a background refresh is triggered
- **Eviction**: LRU eviction with 100MB cap; downloaded content metadata is never evicted

This pattern enables the app to function fully offline. A user on a flight can browse the catalog, manage favorites and even queue downloads — all using Room data. When connectivity returns, the sync queue reconciles local changes with the server.

**Key decision**: Room is not just a cache. It is the primary data store for the client, with the remote API treated as a synchronization target.

## Layer 3: Redis (Edge Cache)

At the infrastructure layer, Redis serves three distinct caching roles:

**Session Cache**: OAuth2 tokens and user entitlements. With 150K concurrent users during live events, validating every request against Keycloak would overwhelm the SSO server. Redis caches entitlement decisions with 5-minute TTL, reducing SSO load by ~90%.

**Rate Limiting**: Sliding window counters per user and per API. Redis stores counters with 1-minute resolution, preventing abuse without database writes.

**Feature Flag Cache**: Firebase Remote Config is cached in Redis with 15-minute TTL. This prevents the mobile app from hammering Firestore on every cold start — a real problem at 1.9M active installs.

**Key decision**: Redis TTLs should be shorter than your tolerance for stale data. A 5-minute stale entitlement is acceptable; a 5-minute stale payment status is not.

## Layer 4: CDN (Content Delivery Network)

For video content, the CDN is the cache. MEGA GO uses a multi-CDN strategy:

- **Primary CDN**: Huawei Cloud CDN for Latin America (lowest latency for Chilean users)
- **Failover CDN**: AWS CloudFront for global reach and redundancy
- **Origin Shield**: A caching layer between CDNs and origin that absorbs cache misses

Video segments (HLS .ts files, DASH .m4s files) are cached at CDN edge nodes for 24 hours. Manifest files (.m3u8, .mpd) are cached for 30 seconds with stale-while-revalidate — short enough to allow mid-stream ad insertion, long enough to prevent origin overload.

During Festival de Viña 2026, the CDN served 94% of video traffic from edge cache. Only 6% of requests reached the origin — the difference between surviving the event and a cascading failure.

**Key decision**: Cache TTL for video segments should match your content update frequency. Live events need short manifest TTLs; VOD catalogs can use long segment TTLs.

## The Cache Invalidation Problem

The hardest problem in computer science is not naming things or cache invalidation. It is **knowing which cache layer is stale**.

When a content producer updates a movie title, the change propagates through:
1. PostgreSQL (origin) → 2. OTT API cache → 3. Redis edge cache → 4. CDN cache → 5. Client HTTP cache → 6. Room database

Each layer has its own TTL and invalidation mechanism. Without a coordinated invalidation strategy, users see inconsistent data across devices and sessions.

Our solution is **event-driven invalidation**:
- Content update → Kafka event → Cache invalidation workers → Redis purge + CDN purge API calls
- Mobile app receives Firebase push notification → triggers local cache refresh on next launch
- Web app uses WebSocket to receive real-time invalidation messages

**Key decision**: Do not rely on TTL alone for mutable data. Use explicit invalidation events for content that changes unpredictably.

## The Metrics That Matter

Cache effectiveness is measured by **cache hit ratio** at each layer:

| Layer | Target Hit Ratio | Actual (Peak) |
|-------|-----------------|---------------|
| Client HTTP | 60% | 73% |
| Room (read) | 80% | 85% |
| Redis | 85% | 91% |
| CDN (video) | 90% | 94% |

A 1% improvement in CDN hit ratio saves approximately $2,000/month in origin egress costs at our scale.

## The Lesson

Caching is not a performance optimization you add later. It is an architectural dimension you design from day one. Every data access path should have a caching strategy: what to cache, where to cache it, how long to keep it, and how to invalidate it when things change.

The hierarchy — client → local DB → edge cache → CDN — is not unique to media platforms. But the stakes are higher when a single cache miss during a live event can cascade into an origin overload that affects millions of viewers.
