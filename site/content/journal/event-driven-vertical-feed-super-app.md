---
title: "Event-Driven Architecture for Vertical Feeds: Building the MEGA Super App"
date: "2025-08-15"
category: "Enterprise Architecture"
excerpt: "How we designed the event system powering the MEGA Super App's vertical feed — integrating editorial news, social interaction, and payments in a CQRS + Event Sourcing architecture with Go, Kafka, and Redis."
tags: ["Event-Driven", "CQRS", "Kafka", "Go", "Super App", "Feed"]
lang: "en"
---

A vertical feed is not a list of posts. It is a miniature distributed system where every scroll triggers a chain of events: a user viewed content, reacted, commented, followed a TV program, or started a subscription. In the MEGA Super App, these events traverse six different bounded contexts before the user sees the next post.

This article describes the event system we are building for the MEGA Super App's vertical feed — integrating editorial content from Meganoticias.cl and Mega.cl with authenticated user social interaction. This is not theory: it is architectural design built to support 100K concurrent users with p95 latency under 300ms.

## The Problem: Vertical Feed as a Distributed System

A TikTok/Reels-style vertical feed imposes requirements that traditional request-response architecture cannot solve efficiently:

- **High write volume**: Every view generates engagement metrics that must be persisted
- **Critical reads**: Infinite scroll requires <300ms latency or the user's attention is lost
- **Real-time social interaction**: Comments and reactions must appear without refreshing
- **Acceptable eventual consistency**: A comment may take 200ms to propagate; a payment cannot

The answer is not a single database or a single API. It is an event-driven architecture with explicit separation between commands (writes) and queries (reads): CQRS.

## Feed Bounded Contexts

Based on Domain-Driven Design, we identified six domains operating as independent bounded contexts:

| Bounded Context | Responsibility | Key Events |
|---|---|---|
| **Feed** | Posts, vertical content | `FeedPublished`, `FeedEdited`, `FeedDeleted`, `FeedPromoted` |
| **Reactions** | Reactions, comments, shares | `ReactionAdded`, `CommentPosted`, `ShareCreated` |
| **News** | News, editorial curation | `NewsPublished`, `NewsUpdated`, `NewsArchived` |
| **Users** | Profiles, preferences, authentication | `UserRegistered`, `UserProfileUpdated`, `FollowCreated` |
| **Payments** | Subscriptions, in-feed payments | `PaymentInitiated`, `SubscriptionActivated`, `SubscriptionCancelled` |
| **Notifications** | Push, in-app, email | `NotificationRequested`, `NotificationDelivered` |
| **Analytics** | Metrics, engagement, reporting | `FeedViewed`, `EngagementAggregated` |

Each context publishes events that others consume without knowing each other. The Reactions service does not know the Notifications service exists; it simply emits `ReactionAdded` and trusts that whoever needs to react, will.

## The Event Bus: Kafka as Backbone

The MEGA Super App's event architecture builds on the same Kafka cluster already running MEGA GO's backend. But the feed introduces new requirements:

| Topic | Partitions | RF | Retention | Use Case |
|---|---|---|---|---|
| `feed.events` | 6 | 3 | 7 days | Publications, edits, deletions |
| `reaction.events` | 6 | 3 | 7 days | Reactions, comments, shares |
| `engagement.batch` | 12 | 3 | 1 day | Batch views from mobile apps |
| `user.events` | 3 | 3 | 30 days | Registration, follows, preferences |
| `payment.events` | 3 | 3 | 30 days | Subscriptions initiated, completed, failed |
| `notification.events` | 3 | 3 | 3 days | Push and in-app requests |

The `engagement.batch` topic has more partitions because it is the densest: each user generates dozens of view events per session. Mobile apps accumulate views in a local buffer and send batches of 20-50 every 30 seconds to reduce network traffic.

### Partition Key Ordering

To guarantee consistency where needed:

- **Feed events**: partition key = `feedId` (all operations on a post go to the same partition)
- **Reactions**: partition key = `feedId` (reactions on a post are processed in order)
- **User events**: partition key = `userId` (a user's subscriptions are processed sequentially)
- **Engagement**: partition key = `userId` (prevents double-counting the same user's view)

## CQRS: Separate Writes from Reads

The CQRS pattern divides the architecture into two sides:

**Command Side (Write)**
- Go API (Gin/Fiber) receives commands: `PublishFeed`, `AddReaction`, `ProcessPayment`
- Validates, persists in PostgreSQL (source of truth), emits event to Kafka
- Target latency: <100ms to accept the command

**Query Side (Read)**
- Kafka consumers project events into optimized read models
- PostgreSQL stores denormalized feed views
- Redis caches per-user timelines and real-time counters
- Query API responds from cache first, PostgreSQL as fallback

```
Mobile App → Command API → PostgreSQL (Write) → Kafka
                                            ↓
Mobile App ← Query API ← Redis/PostgreSQL (Read) ← Consumers
```

This separation allows each side to be optimized independently: the write side prioritizes transactional consistency; the read side prioritizes sub-100ms latency.

## Feed Vertical Events

### Content Events

When a journalist publishes news from the headless CMS (Strapi), the event flow is:

```
CMS Strapi → NewsPublished → Kafka
    → Feed Processor: create denormalized view in Read DB
    → Search Indexer: update Elasticsearch
    → Notification Service: push to program followers
    → Analytics: track publication
```

A single event produces four independent actions. The CMS does not know the followers; the Notification Service queries the follows graph in PostgreSQL to determine who receives the push.

### Engagement Events (Batch)

Mobile apps do not send a request per view. They accumulate in a local buffer:

```go
type FeedViewed struct {
    EventID      string    `json:"event_id"`
    UserID       string    `json:"user_id"`
    FeedID       string    `json:"feed_id"`
    Duration     int       `json:"duration_ms"`
    Percentage   float64   `json:"view_percentage"`
    Device       string    `json:"device"`
    AppVersion   string    `json:"app_version"`
    Timestamp    time.Time `json:"timestamp"`
}

type BatchViewEvent struct {
    EventID   string       `json:"event_id"`
    UserID    string       `json:"user_id"`
    Views     []FeedViewed `json:"views"`
    Timestamp time.Time    `json:"timestamp"`
}
```

Batch sending reduces network traffic by 95%: a 5-minute average session generates ~40 views, but only 1-2 requests to the server.

The engagement batch consumer:
1. Decomposes the batch into individual views
2. Updates counters in Redis (HIncrBy by reaction type)
3. Persists views in PostgreSQL for later analysis
4. Feeds the recommendation algorithm with interest signals

### Social Interaction Events

Reactions and comments require low perceptual latency but not immediate consistency across all replicas:

```
User reacts → Command API → PostgreSQL (Write)
                        → Kafka: ReactionAdded
                            → Feed Processor: update counter
                            → Notification Service: notify author
                            → Real-time: WebSocket broadcast to viewers
```

WebSocket (Socket.io with Redis Adapter) diffuses the reaction to connected clients viewing the same post. Clients not connected receive the update on the next pull-to-refresh.

## Saga Pattern: Subscription from the Feed

The vertical feed includes monetization: users can subscribe to premium content directly from a post. This flow crosses multiple services and requires coordination without distributed transactions.

We use Saga with orchestration for the subscription flow:

```
1. UserSubscribes (Command from feed)
   ↓
2. PaymentInitiated → Kafka
   ↓
3. PaymentProcessed (or PaymentFailed)
   │   └── If fails → Compensation: release reservation
   ↓
4. SubscriptionActivated → Kafka
   ↓
5. NotificationRequested → Welcome push
   ↓
6. FeatureUnlocked → Enable premium content in feed
```

Each step is an event. If payment fails, we emit `PaymentFailed` triggering compensation: release the subscription reservation and notify the user. No distributed locks or 2PC.

## Read Models: Optimized for the Feed

The feed read model is a denormalized table in PostgreSQL designed for fast infinite scroll queries:

```sql
CREATE TABLE feed_views (
    feed_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    content JSONB NOT NULL,
    content_type VARCHAR(20) NOT NULL, -- 'text', 'image', 'video_vertical', 'video_horizontal'
    media_urls TEXT[],
    reaction_counts JSONB DEFAULT '{}',
    comment_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    program_id UUID,
    -- Indexes for feed queries
    CONSTRAINT idx_feed_views_created_at DESC
);

CREATE INDEX idx_feed_views_user_created 
    ON feed_views(user_id, created_at DESC);
    
CREATE INDEX idx_feed_views_program 
    ON feed_views(program_id, created_at DESC) 
    WHERE program_id IS NOT NULL;
```

Infinite scroll queries this table with cursor-based pagination:

```sql
SELECT * FROM feed_views 
WHERE created_at < $cursor 
ORDER BY created_at DESC 
LIMIT 20;
```

Cursor-based pagination avoids the offset problem at scale and is cacheable in Redis with 30-second TTL.

## The Feed Algorithm: Events as Signals

The personalized feed is not a simple SQL query. It is an event pipeline:

1. **Candidate Generation**: `FollowCreated` events feed a per-user source list. `NewsPublished` and `FeedPublished` generate candidates.
2. **Ranking**: Engagement signals (views, reactions, view time) weight each candidate. A post with 80% view-through-rate gets a higher score.
3. **Ad Injection**: Advertising campaign events insert native ads every N posts.
4. **Deduplication**: The `FeedViewed` event marks already-viewed posts to prevent repetition.

This pipeline runs in Kafka consumers that maintain a pre-computed feed per user in Redis, updating in real-time as events arrive.

## Operational Lessons

### Idempotency with Event IDs

In a distributed system, the same events can arrive twice (Kafka retries, WebSocket redeliveries). Each event carries a v4 UUID `event_id`. Consumers check Redis before processing:

```go
func (c *Consumer) handleFeedPublished(ctx context.Context, event FeedPublished) error {
    key := fmt.Sprintf("idempotency:%s", event.EventID)
    if exists, _ := c.redis.Exists(ctx, key).Result(); exists > 0 {
        return nil // Already processed, silent skip
    }
    
    // ... business logic ...
    
    return c.redis.Set(ctx, key, "1", 24*time.Hour).Err()
}
```

Without this protection, a duplicated reaction would increment the counter twice.

### Schema Evolution with Protobuf

Events are serialized in Protobuf with strict backward compatibility rules:

- ✅ Add fields: always `optional` or with `default`
- ✅ Rename fields: use `reserved` to avoid collisions
- ❌ Remove required fields: breaks consumers
- ❌ Change types: incompatible

The `version` field in each event allows schema evolution. A consumer can handle both `FeedPublished_v1` and `FeedPublished_v2` during migration.

### Backpressure and Consumer Lag

During a massive live event (a reality show finale), the `engagement.batch` topic can receive 50K messages/second. If analytics consumers cannot keep up, lag grows.

We monitor with Prometheus:

```yaml
- alert: FeedConsumerLagHigh
  expr: kafka_consumer_group_lag{topic=~"feed.events|reaction.events"} > 5000
  for: 2m
  labels:
    severity: warning
```

Mitigation is automatic: if lag exceeds 10K messages, HPA scales consumers from 3 to 12 instances. If lag persists, we activate sampling in analytics (process 1 of every 5 events) until recovery.

### Dead Letter Topics

When a consumer fails processing an event (bug, down dependency), the message goes to a dead letter topic after 3 retries with exponential backoff:

```
feed.events → Consumer fails → Retry 1 (1s) → Retry 2 (5s) → Retry 3 (25s)
    → feed.dead (persists 30 days for analysis and manual re-injection)
```

Messages in dead letter are inspected, the bug is fixed, and they are re-injected into the original topic for processing.

## The Super App as an Event Ecosystem

The vertical feed does not operate in isolation. It is a node in the MEGA Super App's event graph:

- A `FollowCreated` in the feed triggers `SubscriptionRecommended` in the payments module
- A `PaymentProcessed` enables `PremiumContentUnlocked` in the feed
- A `FeedViewed` with duration >60s generates `RecommendationSignal` for the ML engine
- A `CommentPosted` with keywords triggers `NewsTipCreated` for the editorial team

These flows cross bounded contexts without direct coupling. The payments service does not import the feed's package; both speak Kafka.

## The Lesson

Building a vertical feed with event-driven architecture is not about choosing Kafka or Redis. It is about designing systems where each domain publishes what happens to it and subscribes to what it cares about — without knowing who is on the other side.

CQRS lets us optimize writes for consistency and reads for speed. The Saga pattern lets us coordinate complex business flows without locks. Batch engagement events let us scale metrics without collapsing the network.

The metric that matters most is not how many events we process. It is how many events we process without the user noticing there is a distributed system behind the scenes. When a user reacts to a post and the reaction appears in 150ms on another device, they are not seeing Kafka, Redis, or WebSocket. They are seeing a system that works.
