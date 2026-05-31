---
title: "Database Selection for Multi-Domain Platforms: SQL, NoSQL, or Both?"
date: "2025-07-22"
category: "Enterprise Architecture"
excerpt: "How we chose PostgreSQL, MongoDB, Redis, Neo4j and Firestore for different domains in the MEGA GO platform — and why using one database for everything is usually the wrong answer."
tags: ["Databases", "PostgreSQL", "MongoDB", "Redis", "Neo4j", "Architecture"]
lang: "en"
---

The most common database mistake I see in platform architecture is not choosing the wrong database. It is choosing one database for everything, then forcing every use case to fit its model.

MEGA GO uses five different databases. Each serves a specific domain where its data model provides a competitive advantage. This article explains the selection criteria, trade-offs and operational lessons from running a polyglot persistence architecture at scale.

## Theoretical Framework: CAP and PACELC

Before choosing a database, you need to understand what guarantees a distributed system can offer. The CAP theorem states that in the presence of a network partition, only two of three properties can be guaranteed: consistency (C), availability (A), and partition tolerance (P). PACELC extends this framework: during normal operation (without partitions), you must choose between latency (L) and consistency (C).

| Database | CAP / PACELC | Implication for MEGA GO |
|---|---|---|
| PostgreSQL | CP / EC | Strong consistency for payments; read replicas with acceptable lag |
| MongoDB | CP / EC | Configurable consistency; sharding for availability |
| Redis | AP / EL | Availability and low latency; eventual consistency in cluster |
| Neo4j | CP / EC | Consistency in graph transactions; deterministic traversals |
| Firestore | AP / EL | High availability and real-time synchronization |

This matrix guides every decision. The content catalog can tolerate eventual consistency because a user won't notice if a new series appears 500ms later on a replica. Payments cannot: strong consistency is non-negotiable.

## The Database Landscape

| Database | Domain | Data Model | Why It Was Chosen |
|----------|--------|------------|-------------------|
| **PostgreSQL** | Subscriptions, payments, user profiles | Relational (ACID) | Financial consistency, complex queries |
| **MongoDB** | Content catalog, categories, metadata | Document (BSON) | Flexible schema for diverse media types |
| **Redis** | Sessions, rate limits, feature flags | Key-value (in-memory) | Sub-millisecond access, high throughput |
| **Neo4j** | Identity graph, cross-device relationships | Graph (nodes/edges) | Relationship traversal, identity resolution |
| **Firestore** | Configuration, A/B tests, real-time sync | Document (NoSQL) | Native Firebase integration, real-time listeners |

## PostgreSQL: The System of Record

PostgreSQL is our system of record for anything involving money or legal compliance:

- **User accounts**: Registration date, email, legal consent flags
- **Subscriptions**: Plan type, billing cycle, renewal dates, cancellation reason
- **Payments**: Transaction IDs, amounts, currencies, payment methods, refund status
- **Entitlements**: What content each user can access, until when

These tables require ACID transactions. When a user upgrades from Free to Premium, three operations must atomically succeed: charge the payment method, extend the entitlement, and update the subscription record. If any step fails, the entire transaction rolls back.

**Key Decision**: PostgreSQL 14 with read replicas for analytics queries. Write operations go to the primary; read-heavy reporting queries go to replicas, preventing analytical workloads from impacting transaction latency.

**Operational Lesson**: Partition large tables by date. The `payments` table grew to 50M rows in 18 months. Monthly partitioning reduced index size by 80% and improved query performance by 3x.

### Why Not Oracle or SQL Server?

We evaluated Oracle and SQL Server in 2019. Both offered superior enterprise features, but licensing costs for a growing OTT were prohibitive. PostgreSQL covered 100% of our ACID requirements with zero licensing cost and an active community in LATAM. Extensibility with PostGIS (for live event geolocation) and pg_stat_statements (for slow query analysis) were decisive differentiators.

## MongoDB: The Content Catalog

Media content does not fit relational schemas well. A movie has different fields than a TV series episode, which has different fields than a live event, which has different fields than a news clip.

MongoDB's document model allows each content type to have its own schema:

```json
{
  "_id": "movie-12345",
  "type": "movie",
  "title": "Festival de Viña 2026",
  "duration": 7200,
  "genres": ["Music", "Live Event"],
  "cast": [{"name": "Artista", "role": "Performer"}],
  "streams": {
    "hd": "https://cdn.../hd.m3u8",
    "sd": "https://cdn.../sd.m3u8"
  },
  "drm": {
    "widevine": "https://license...",
    "fairplay": "https://license..."
  },
  "availability": {
    "start": "2026-02-24T20:00:00Z",
    "end": "2027-02-24T20:00:00Z"
  }
}
```

The same collection can store movies, series, episodes, live events and clips — each with the fields relevant to its type. No schema migrations when adding a new content type.

**Key Decision**: MongoDB 6 with sharding by `contentId` hash. The catalog serves 10K+ RPS during peak; sharding distributes load across three replica sets.

**Operational Lesson**: Index compound queries carefully. Our initial index on `{type: 1, genre: 1}` performed well for filtered browsing but failed for text search. Adding a text index on `{title: "text", description: "text"}` reduced search latency from 800ms to 45ms.

### Comparison with DynamoDB

Amazon DynamoDB was evaluated as an alternative for the catalog. It offers automatic horizontal scaling and predictable latency, but the provisioned capacity pricing model generated unpredictable costs during live event peaks (like a reality show finale). MongoDB gave us cost control with owned infrastructure and a richer query model for complex catalog aggregations.

## Redis: The Speed Layer

Redis exists because milliseconds matter. Three use cases justify its operational complexity:

**Session Cache**: OAuth2 access tokens with 5-minute TTL. Validating every API call against Keycloak would require 1,500 RPS of SSO traffic. Redis reduces this to ~150 RPS (cache misses only).

**Rate Limiting**: Sliding window counters per user per API. Implemented as Redis sorted sets with 1-minute buckets. Prevents abuse without database writes.

**Feature Flags**: Firebase Remote Config cached with 15-minute TTL. Without Redis, 1.9M active devices would hammer Firestore on every cold start.

**Key Decision**: Redis Cluster with 3 masters and 3 replicas. Each master handles ~40K ops/sec; the cluster sustains 120K ops/sec aggregate.

**Operational Lesson**: Monitor memory fragmentation. Redis memory usage grew to 85% before we realized that frequent TTL updates were causing fragmentation. Switching from `volatile-ttl` to `allkeys-lru` eviction and running `MEMORY PURGE` weekly stabilized memory at 60%.

### Alternatives Evaluated

Memcached was dismissed because it lacks persistence and rich data structures (sorted sets, hyperloglogs). Valkey (AWS's open-source Redis fork) is being monitored as a future alternative to reduce dependency on Redis Ltd.

## Neo4j: The Identity Graph

The most interesting database choice in our architecture is Neo4j. It solves a problem that relational databases handle poorly: **identity resolution across devices and accounts**.

In the Super App MEGA, a single user might have:
- A phone (Android) with anonymous browsing history
- A TV (Android TV) with family profile
- A tablet (iPad) with personal profile
- A web browser with work profile
- Anonymous sessions before login

Neo4j models these as a graph:

```cypher
(User:registered {email: "user@example.com"})
  -[:HAS_DEVICE]-> (Device:android {id: "device-123"})
  -[:HAS_PROFILE]-> (Profile:anonymous {id: "anon-456"})
  -[:WATCHED]-> (Content:movie {id: "movie-789"})
```

When the user logs in on a new device, the graph traversal finds all related anonymous profiles and migrates their data. This operation in PostgreSQL would require 6+ JOINs across tables with complex foreign keys. In Neo4j, it is a single Cypher query with 2-hop traversal.

**Key Decision**: Neo4j 5 Community Edition. The graph is relatively small (~50M nodes, ~200M relationships) but query complexity is high. Community Edition handles the load with a single instance and daily backups.

**Operational Lesson**: Graph databases are not general-purpose. Use them only when relationships are the primary query pattern. We initially tried storing content metadata in Neo4j and regretted it — Cypher queries for simple filtering were slower than MongoDB's find() by an order of magnitude.

## Firestore: The Configuration Store

Firestore serves real-time configuration needs that do not justify operational overhead:

- **A/B test variants**: Which UI version each user sees
- **Remote configuration**: Feature toggles, maintenance banners, minimum app versions
- **Real-time analytics**: Aggregated view counts during live events

The native Firebase integration means mobile and web clients can listen to configuration changes in real time without polling.

**Key Decision**: Firestore in Datastore mode for consistent pricing. Native mode's per-document pricing became unpredictable at scale.

## Multi-Database Architectures in Production

Not all interactions are simple reads and writes to a single database. Three architectural patterns emerge when multiple databases collaborate:

### CQRS (Command Query Responsibility Segregation)

We separate write and read operations into different data models. Writes go to PostgreSQL (transactional model); complex reads (content search) consume a denormalized index generated by a change pipeline. In MEGA GO, the catalog is written to MongoDB but text search consumes a denormalized index generated by a change data pipeline.

### Strangler Fig Pattern

We migrated the content catalog from PostgreSQL to MongoDB in 2021 with zero downtime: dual-write to both databases, verify consistency, switch reads, retire PostgreSQL. This pattern mitigates migration risk by allowing rollback at each stage.

### Cache as Protective Layer

Redis is not just a cache: it is a protective barrier that absorbs traffic spikes before they reach persistent databases. During a live event launch with 500K concurrent users, Redis absorbed 95% of configuration reads, leaving Firestore and MongoDB operating within normal limits.

## The Polyglot Persistence Trade-off

Running five databases increases operational complexity:
- Five backup strategies
- Five monitoring dashboards
- Five upgrade cycles
- Five sets of expertise on the team

The alternative — one database for everything — forces every use case into a suboptimal model. We tried PostgreSQL for the content catalog in 2020. Schema migrations for new content types took weeks. Query performance for hierarchical categories degraded as the catalog grew.

The polyglot approach costs more in operations but pays back in performance, flexibility and developer velocity.

## Industry Lessons

MEGA GO's decisions are not unique. Comparing with reference platforms:

| Platform | Database Stack | Applicable Lesson |
|---|---|---|
| **Netflix** | Cassandra + EVCache + Elasticsearch + MySQL | Cassandra for user-growing data (history); MySQL for financial transactions |
| **Uber** | MySQL + Cassandra + Redis + Elasticsearch | Separate transactional data from telemetry; Cassandra for massive location writes |
| **Amazon** | DynamoDB + Aurora + Elasticsearch | DynamoDB for catalog at scale; Aurora for non-negotiable consistency transactions |
| **Twitter/X** | Manhattan + MySQL + Redis | Custom databases when requirements are extremely specific |

The convergence is clear: no platform at scale uses a single database. Polyglot persistence is not fashion — it is a consequence of specialization.

## Selection Checklist

Before adopting a new database in production, we validate these criteria:

**Data analysis**
- Are the data structured, semi-structured, or unstructured?
- Are there complex relationships between entities?
- Is the schema stable or does it evolve rapidly?
- What data volume is expected? (GB, TB, PB)

**Access patterns**
- Is it read-heavy or write-heavy?
- Are queries simple (by key) or complex (joins, aggregations)?
- Is full-text search needed?
- What latency is acceptable? (<1ms, <10ms, <100ms, <1s)

**Non-functional requirements**
- Is full ACID needed or is eventual consistency sufficient?
- What is the required RPO/RTO?
- Is horizontal or vertical scaling needed?
- What is the infrastructure budget?

**Practical validation**
- Create POC with representative dataset
- Run load benchmarks (we use k6 for APIs, YCSB for NoSQL)
- Simulate failures and recovery
- Measure p99 latency and throughput

## The Selection Framework

When evaluating a new database, we use this decision tree:

1. **Does it involve money or legal compliance?** → PostgreSQL (ACID required)
2. **Does the schema change frequently?** → MongoDB (flexible documents)
3. **Does it require sub-millisecond access?** → Redis (in-memory)
4. **Are relationships the primary query pattern?** → Neo4j (graph traversal)
5. **Does it need real-time client sync?** → Firestore (Firebase integration)
6. **Does it not fit any category above?** → Re-evaluate the use case

### Quick Selection Matrix

| Use case | SQL | Document | Key-Value | Graph | Time-Series | Search |
|---|---|---|---|---|---|---|
| Payments / subscriptions | ⭐ | | | | | |
| Content catalog | | ⭐ | | | | ⭐ |
| Cache / sessions | | | ⭐ | | | |
| User relationships | | | | ⭐ | | |
| Logs / metrics | | | | | ⭐ | ⭐ |
| Real-time configuration | | ⭐ | | | | |

## The Lesson

Database selection is not a one-time decision. It is an ongoing architectural conversation. As domains evolve, the database that served them well in year one may become a constraint in year three.

The key is to recognize when a domain has outgrown its database — and to have the operational maturity to migrate without downtime. We migrated the content catalog from PostgreSQL to MongoDB in 2021 with zero downtime using the Strangler Fig pattern: dual-write to both databases, verify consistency, switch reads, retire PostgreSQL.

Polyglot persistence is not about using many databases for the sake of complexity. It is about choosing the right data model for each domain — and accepting the operational cost as the price of performance.

> "The best database is the one your team knows well and that solves the current problem without creating future problems."
