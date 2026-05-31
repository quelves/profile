---
title: "Event-Driven Architecture: When Kafka Meets Firebase"
date: "2025-06-18"
category: "Enterprise Architecture"
excerpt: "How we combined Kafka for backend event streaming with Firebase for real-time client push to build an event-driven architecture that handles 150K concurrent users without losing a single message."
tags: ["Event-Driven", "Kafka", "Firebase", "Microservices", "Architecture"]
lang: "en"
---

Event-driven architecture is easy to understand and hard to operate. The concept — services communicate by producing and consuming events rather than calling each other directly — is intuitive. The reality of guaranteeing message delivery, handling backpressure, and maintaining ordering across distributed consumers is anything but.

This article describes how Megamedia combines two event systems — **Apache Kafka** for backend microservices and **Firebase Cloud Messaging** for client push — to create a hybrid event architecture that serves 150K concurrent users during live events.

## Why Two Event Systems?

The backend needs Kafka. The client needs Firebase. They serve different purposes:

| Dimension | Kafka (Backend) | Firebase (Client) |
|-----------|-----------------|-------------------|
| **Throughput** | 1M+ messages/sec | 500K messages/sec |
| **Latency** | Milliseconds | Seconds (best effort) |
| **Durability** | Persistent (disk) | Ephemeral (memory) |
| **Ordering** | Partition-level guaranteed | Best effort |
| **Consumer model** | Pull (consumers read) | Push (server sends) |
| **Use case** | Service-to-service events | Server-to-client notifications |

Using both systems is not redundancy. It is specialization.

## The Backend Event Backbone: Kafka

MEGA GO's backend uses Kafka as the central nervous system for cross-service communication. The core event flows are:

### Payment Flow
```
PAY API → PaymentInitiated → Kafka → OTT API (extend subscription)
                           → Kafka → SSO API (update entitlements)
                           → Kafka → NOTIFY API (send receipt)
                           → Kafka → ANALYTICS (track revenue)
```

When a user subscribes, the PAY API produces a single `PaymentInitiated` event. Four independent consumers process it without the PAY API knowing they exist. If we add a fifth consumer tomorrow (say, a CRM integration), the PAY API requires zero changes.

This is the decoupling promise of event-driven architecture: producers and consumers evolve independently.

### Content Publication Flow
```
CMS → ContentPublished → Kafka → OTT API (update catalog)
                      → Kafka → MDS API (prepare streaming)
                      → Kafka → CDN (purge cache)
                      → Kafka → SEARCH API (update index)
                      → Kafka → FIREBASE (notify clients)
```

When a content producer publishes a new series, five systems react simultaneously. The CMS does not call five APIs. It produces one event.

### Live Event Flow
```
LIVE STREAM → ViewerJoined → Kafka → ANALYTICS (real-time counter)
            → ViewerLeft   → Kafka → ANALYTICS (update counter)
            → StreamEnded  → Kafka → OTT API (update catalog)
                           → Kafka → CDN (purge live cache)
```

During Festival de Viña, the analytics system consumes `ViewerJoined` and `ViewerLeft` events to maintain a real-time concurrent viewer count. This count feeds into the auto-scaling system that provisions additional CDN capacity when thresholds are exceeded.

## Kafka Configuration for Production

Our Kafka cluster runs on Huawei Cloud with the following production configuration:

**Topic Design**: Each business event type has its own topic:
- `payments` (3 partitions, replication factor 3)
- `content-publications` (6 partitions, RF 3)
- `user-activities` (12 partitions, RF 3)
- `live-events` (6 partitions, RF 3)

Partition count is determined by consumer parallelism. The `user-activities` topic has the most partitions because it has the most independent consumers (analytics, personalization, CRM, fraud detection).

**Consumer Groups**: Each service has its own consumer group, allowing independent scaling:
- `ott-api-consumer-group` (3 instances)
- `analytics-consumer-group` (6 instances)
- `notify-consumer-group` (2 instances)

**Retention**: 7 days for most topics, 30 days for `payments` (audit requirement), 1 day for `live-events` (transient data).

## The Client Event Layer: Firebase

While Kafka handles service-to-service communication, Firebase Cloud Messaging (FCM) handles server-to-client push notifications:

**Event Types Pushed to Clients**:
- `NEW_CONTENT`: New episode or movie available
- `SUBSCRIPTION_EXPIRING`: Reminder 3 days before expiration
- `LIVE_EVENT_STARTING`: Festival de Viña begins in 15 minutes
- `PERSONALIZED_RECOMMENDATION`: AI-generated content suggestion
- `FEATURE_FLAG_CHANGE`: New micro-app enabled in Super App

Each event carries a payload with deep-link URL, title, body and image URL. The mobile app receives the push, displays the notification, and routes the user to the correct screen when tapped.

**Critical Decision**: FCM is best-effort delivery. For business-critical events (payment confirmations), the app polls the PAY API on next launch to reconcile. The push is a hint, not a guarantee.

## The Bridge: When Kafka Meets Firebase

The interesting architectural question is: how do backend events become client pushes?

We use Firebase Cloud Functions as the bridge:

```
Kafka → Cloud Function (triggered by Kafka connector)
     → Evaluate: should this event push to clients?
     → Yes: Query FCM tokens for affected users
     → Send batch FCM messages
     → Log delivery metrics
```

For example, when the `ContentPublished` event is consumed by the Cloud Function, it:
1. Queries the user database for subscribers to that content's genre
2. Batches FCM tokens into groups of 500
3. Sends multicast messages via FCM HTTP v1 API
4. Logs sent/delivered/failed counts to BigQuery

This bridge pattern separates concerns: Kafka handles backend reliability, Firebase handles client reachability, and the Cloud Function handles the translation between the two worlds.

## Backpressure and the 150K Problem

The hardest event-driven problem we faced was Festival de Viña 2026. At peak, 150K users joined the live stream within a 5-minute window. This produced:
- 150K `ViewerJoined` events
- 150K authentication checks
- 150K DRM license requests
- 150K CDN edge cache misses (for users in new regions)

The Kafka cluster handled the event volume easily. The downstream consumers did not.

The analytics consumer group fell behind by 12 minutes because its BigQuery batch inserts could not keep up. The solution was threefold:

1. **Increase consumer instances**: 3 → 6 analytics consumers
2. **Batch size optimization**: Reduce BigQuery batch from 1,000 to 500 rows, increasing flush frequency
3. **Circuit breaker**: When lag exceeds 10 minutes, switch to sampling (process 1 in 10 events) until catch-up

**Lesson**: Event-driven architectures do not eliminate scaling problems. They move them from the producer to the consumer. Monitor consumer lag as your primary operational metric.

## Ordering vs. Parallelism

Kafka guarantees ordering within a partition. But if you need global ordering across all partitions, you sacrifice parallelism.

For payments, we use the `userId` as the partition key. This guarantees that all events for a single user are processed in order — critical because `PaymentInitiated` must be processed before `PaymentConfirmed`.

For live events, we do not need global ordering. `ViewerJoined` events from different users have no causal relationship. We use round-robin partitioning to maximize parallelism.

**Lesson**: Do not default to global ordering. Use partition keys that reflect actual causality requirements.

## The Lesson

Event-driven architecture is not about choosing Kafka or Firebase. It is about designing systems where components communicate through durable, observable, scalable channels rather than fragile direct calls.

The combination of Kafka for backend reliability and Firebase for client reachability has proven resilient through 150K concurrent users, 1.9M active devices, and 24/7 operations. The events carry the system forward — one message at a time.
