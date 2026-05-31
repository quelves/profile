Voy a analizar el video y crear un tutorial completo sobre arquitectura orientada a eventos aplicada a tu plataforma de super app con feed vertical, noticias, reacciones, publicaciones y pagos.
No pude acceder directamente al video de YouTube, pero he recopilado información actualizada de 2026 sobre arquitectura orientada a eventos de fuentes autorizadas. Permíteme crear un tutorial completo y profundo adaptado específicamente a tu plataforma de super app con feed vertical, noticias, reacciones, publicaciones y pagos.

---

# 🏗️ Arquitectura Orientada a Eventos (EDA)
## Tutorial Completo para tu Super App con Feed Vertical

---

## 📋 ÍNDICE

1. [Fundamentos de EDA](#1-fundamentos)
2. [Componentes Core](#2-componentes)
3. [Patrones EDA Avanzados](#3-patrones)
4. [Arquitectura para tu Super App](#4-arquitectura-super-app)
5. [Implementación en Go + Kafka](#5-implementacion-go)
6. [Feed Vertical: Eventos y Flujos](#6-feed-vertical)
7. [Sistema de Pagos y Suscripciones](#7-pagos)
8. [Diagramas C4 / Mermaid](#8-diagramas)
9. [Checklist de Producción](#9-checklist)

---

## 1. FUNDAMENTOS DE EDA {#1-fundamentos}

### ¿Qué es la Arquitectura Orientada a Eventos?

> **EDA** es un patrón de diseño donde los sistemas se comunican **produciendo y consumiendo eventos** — registros discretos de algo que ocurrió — en lugar de llamarse directamente (request-response). 

**Principio clave**: El productor no sabe ni le importa quién consume el evento. Los servicios se desacoplan — se comunican a través de eventos, no llamadas API directas.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Service A  │────▶│ Event Bus   │◀────│  Service B  │
│  (Producer) │     │  (Kafka)    │     │  (Consumer)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Service C  │
                    │  (Consumer) │
                    └─────────────┘
```

### EDA vs Request-Response

| Aspecto | Request-Response | Event-Driven |
|---------|-----------------|--------------|
| **Acoplamiento** | Alto (conoce API del otro) | Bajo (solo publica eventos) |
| **Escalabilidad** | Limitada por dependencias | Independiente por servicio |
| **Resiliencia** | Si B cae, A también cae | Buffer del broker absorbe fallas |
| **Latencia** | Síncrona (bloqueante) | Asíncrona (no bloqueante) |
| **Trazabilidad** | Difícil rastrear | Log de eventos = auditoría completa |

**Regla de oro**: Usa **request-response** cuando necesitas el resultado antes de continuar (ej: autenticación). Usa **eventos** cuando el trabajo del productor terminó y otros servicios deben reaccionar (ej: publicación de feed, pago procesado). 

---

## 2. COMPONENTES CORE {#2-componentes}

### 2.1 Eventos, Comandos y Queries

| Tipo | Definición | Ejemplo en tu plataforma |
|------|-----------|------------------------|
| **Event** | Algo que **ya ocurrió** (pasado) | `FeedPublished`, `ReactionAdded`, `PaymentProcessed` |
| **Command** | Solicitud para **hacer algo** | `PublishFeed`, `ProcessPayment`, `SubscribeUser` |
| **Query** | Solicitud de **datos** | `GetFeedById`, `GetUserReactions`, `GetSubscriptionStatus` |

### 2.2 Componentes Estructurales

| Componente | Rol | Ejemplos para tu stack |
|------------|-----|----------------------|
| **Event Producers** | Detectan cambio de estado y publican | API Go (publicación feed), Gateway de pagos |
| **Event Broker** | Transporta y almacena eventos | **Apache Kafka**, Redpanda, Pulsar |
| **Event Consumers** | Reaccionan a eventos | Feed Processor, Notification Service, Analytics |
| **Event Store** | Log durable de eventos | Kafka topics (retención configurable) |
| **Stream Processor** | Transforma, agrega, une eventos | Kafka Streams, Flink, o consumer groups en Go |

### 2.3 Modelos de EDA

**Modelo Pub/Sub (Publish/Subscribe)**
- Eventos se publican en **topics**
- Múltiples consumers pueden suscribirse al mismo topic
- Ideal para: notificaciones, analytics, feed distribution

**Modelo Event Streaming**
- Procesamiento secuencial de streams continuos
- Identifica patrones en el flujo de eventos
- Ideal para: recomendaciones en tiempo real, detección de fraude, aggregations

---

## 3. PATRONES EDA AVANZADOS {#3-patrones}

### 3.1 Event Sourcing (Fuente de Eventos)

> Almacena **cada cambio de estado como evento inmutable** en un log append-only. El estado actual se deriva reproduciendo eventos. 

**Aplicación en tu plataforma**: Historial completo de reacciones, ediciones de publicaciones, cambios de suscripción.

```
┌─────────────────┐
│  Event Store    │
│  (Kafka Topic)  │
├─────────────────┤
│ FeedCreated_v1  │
│ ReactionAdded   │
│ FeedEdited_v2   │
│ ReactionRemoved │
│ FeedDeleted     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Replay Events  │──▶ Estado actual del feed
│  (Projection)   │
└─────────────────┘
```

### 3.2 CQRS (Command Query Responsibility Segregation)

> Separa el **path de escritura** (commands → events) del **path de lectura** (materialized views desde eventos). 

**Para tu super app**:
- **Command Side**: API Go recibe `PublishFeed`, valida, emite evento
- **Query Side**: Servicio de lectura con Redis/PostgreSQL optimizado para consultas de feed

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Command    │────▶│   Event     │
│   (App)     │     │   API (Go)  │     │   Store     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Consumers  │
                                        │  (Projectors)│
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Read DB    │
                                        │ (PostgreSQL)│
                                        └──────┬──────┘
                                               │
                                        ┌─────────────┐
                                        │   Query     │
                                        │   API (Go)  │
                                        └─────────────┘
```

### 3.3 Saga Pattern

> Coordina procesos de negocio de larga duración entre servicios **sin transacciones distribuidas**. Cada paso publica un evento; eventos compensatorios deshacen pasos previos si algo falla. 

**Ejemplo: Flujo de Suscripción**
```
1. UserSubscribes (Command)
   │
   ▼
2. PaymentAuthorized (Event) ──▶ Si falla → Compensation: ReleaseSubscription
   │
   ▼
3. SubscriptionActivated (Event)
   │
   ▼
4. WelcomeNotificationSent (Event)
   │
   ▼
5. AnalyticsLogged (Event)
```

**Dos estilos**:
- **Choreography**: Cada servicio decide qué hacer basado en eventos que observa (más simple, menor escala)
- **Orchestration**: Un coordinador (orquestador) emite comandos y reacciona a resultados (más fácil de razonar a gran escala)

---

## 4. ARQUITECTURA PARA TU SUPER APP {#4-arquitectura-super-app}

### 4.1 Contextos Delimitados (Bounded Contexts)

Basado en Domain-Driven Design, identificamos los dominios de tu super app:

| Bounded Context | Responsabilidad | Eventos Principales |
|----------------|----------------|---------------------|
| **Feed** | Publicaciones, contenido vertical | `FeedPublished`, `FeedEdited`, `FeedDeleted`, `FeedPromoted` |
| **Reactions** | Me gusta, comentarios, shares | `ReactionAdded`, `CommentPosted`, `ShareCreated` |
| **News** | Noticias, curación editorial | `NewsPublished`, `NewsUpdated`, `NewsArchived` |
| **Payments** | Suscripciones, pagos únicos | `PaymentInitiated`, `PaymentProcessed`, `PaymentFailed`, `SubscriptionActivated`, `SubscriptionCancelled` |
| **Users** | Perfiles, preferencias, autenticación | `UserRegistered`, `UserProfileUpdated`, `UserPreferencesChanged` |
| **Notifications** | Push, email, in-app | `NotificationRequested`, `NotificationDelivered`, `NotificationFailed` |
| **Analytics** | Métricas, reporting | `EventLogged`, `MetricAggregated` |

### 4.2 Topología de Eventos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KAFKA CLUSTER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ feed.events │  │reaction.events│ │payment.events│ │ user.events │   │
│  │  (3 parts)  │  │  (3 parts)   │  │  (3 parts)  │  │  (3 parts)  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │          │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  │
│  │ feed.dead   │  │react.dead   │  │pay.dead     │  │user.dead   │  │
│  │   letter    │  │   letter     │  │   letter    │  │   letter    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │notification.│  │ analytics.  │  │  audit.     │                   │
│  │   events    │  │   events    │  │   events    │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. IMPLEMENTACIÓN EN GO + KAFKA {#5-implementacion-go}

### 5.1 Estructura del Proyecto

```
superapp-eda/
├── cmd/
│   ├── api/                    # API principal (commands)
│   │   └── main.go
│   ├── feed-processor/         # Consumer: procesa feeds
│   │   └── main.go
│   ├── reaction-service/       # Consumer: reacciones
│   │   └── main.go
│   ├── payment-worker/         # Consumer: pagos
│   │   └── main.go
│   └── notification-service/   # Consumer: notificaciones
│       └── main.go
├── internal/
│   ├── domain/                 # Entidades y eventos de dominio
│   │   ├── feed/
│   │   ├── reaction/
│   │   ├── payment/
│   │   └── user/
│   ├── events/                 # Contratos de eventos (schemas)
│   │   ├── feed_events.go
│   │   ├── reaction_events.go
│   │   ├── payment_events.go
│   │   └── user_events.go
│   ├── infrastructure/
│   │   ├── kafka/              # Producer/Consumer genéricos
│   │   ├── postgres/           # Repositorios
│   │   └── redis/              # Cache/Read models
│   └── application/            # Casos de uso / handlers
├── pkg/
│   └── shared/                 # Utilidades comunes
└── deployments/
    ├── docker-compose.yml
    └── k8s/
```

### 5.2 Definición de Eventos (Schemas)

```go
// internal/events/feed_events.go
package events

import (
    "time"
    "github.com/google/uuid"
)

// FeedPublished - Evento emitido cuando un usuario publica contenido
type FeedPublished struct {
    EventID       string    `json:"event_id"`
    EventType     string    `json:"event_type"`      // "FeedPublished"
    AggregateID   string    `json:"aggregate_id"`    // feed_id
    AggregateType string    `json:"aggregate_type"`  // "Feed"
    Version       int       `json:"version"`         // 1
    Timestamp     time.Time `json:"timestamp"`
    
    // Payload específico
    FeedID        string    `json:"feed_id"`
    UserID        string    `json:"user_id"`
    Content       string    `json:"content"`
    ContentType   string    `json:"content_type"`    // "text", "image", "video"
    MediaURLs     []string  `json:"media_urls,omitempty"`
    Tags          []string  `json:"tags,omitempty"`
    Visibility    string    `json:"visibility"`      // "public", "followers", "private"
    Location      *Location `json:"location,omitempty"`
    CreatedAt     time.Time `json:"created_at"`
}

type Location struct {
    Latitude  float64 `json:"lat"`
    Longitude float64 `json:"lng"`
    Name      string  `json:"name,omitempty"`
}

// NewFeedPublished - Factory method con validaciones
func NewFeedPublished(feedID, userID, content, contentType string) (*FeedPublished, error) {
    if feedID == "" || userID == "" || content == "" {
        return nil, ErrInvalidEvent
    }
    
    return &FeedPublished{
        EventID:       uuid.New().String(),
        EventType:     "FeedPublished",
        AggregateID:   feedID,
        AggregateType: "Feed",
        Version:       1,
        Timestamp:     time.Now().UTC(),
        FeedID:        feedID,
        UserID:        userID,
        Content:       content,
        ContentType:   contentType,
        Visibility:    "public",
        CreatedAt:     time.Now().UTC(),
    }, nil
}

// ReactionAdded - Evento cuando alguien reacciona a un feed
type ReactionAdded struct {
    EventID     string    `json:"event_id"`
    EventType   string    `json:"event_type"`    // "ReactionAdded"
    Timestamp   time.Time `json:"timestamp"`
    
    ReactionID  string    `json:"reaction_id"`
    FeedID      string    `json:"feed_id"`
    UserID      string    `json:"user_id"`
    ReactionType string   `json:"reaction_type"` // "like", "love", "laugh", "angry"
    CreatedAt   time.Time `json:"created_at"`
}

// PaymentProcessed - Evento de pago completado
type PaymentProcessed struct {
    EventID       string    `json:"event_id"`
    EventType     string    `json:"event_type"`     // "PaymentProcessed"
    Timestamp     time.Time `json:"timestamp"`
    
    PaymentID     string    `json:"payment_id"`
    UserID        string    `json:"user_id"`
    SubscriptionID string   `json:"subscription_id,omitempty"`
    Amount        float64   `json:"amount"`
    Currency      string    `json:"currency"`
    Status        string    `json:"status"`         // "completed", "failed", "refunded"
    PaymentMethod string    `json:"payment_method"` // "credit_card", "pix", "boleto"
    ProcessedAt   time.Time `json:"processed_at"`
}
```

### 5.3 Producer Genérico en Go

```go
// internal/infrastructure/kafka/producer.go
package kafka

import (
    "context"
    "encoding/json"
    "fmt"
    "time"
    
    "github.com/IBM/sarama"
)

type Event interface {
    // Marker interface para eventos de dominio
}

type Producer struct {
    client sarama.SyncProducer
    config *Config
}

type Config struct {
    Brokers []string
    Retry   int
}

func NewProducer(cfg *Config) (*Producer, error) {
    saramaConfig := sarama.NewConfig()
    saramaConfig.Producer.RequiredAcks = sarama.WaitForAll
    saramaConfig.Producer.Retry.Max = cfg.Retry
    saramaConfig.Producer.Return.Successes = true
    
    // Idempotencia: exactly-once semantics
    saramaConfig.Producer.Idempotent = true
    saramaConfig.Net.MaxOpenRequests = 1
    
    client, err := sarama.NewSyncProducer(cfg.Brokers, saramaConfig)
    if err != nil {
        return nil, fmt.Errorf("failed to create producer: %w", err)
    }
    
    return &Producer{client: client, config: cfg}, nil
}

func (p *Producer) Publish(ctx context.Context, topic string, event Event) error {
    payload, err := json.Marshal(event)
    if err != nil {
        return fmt.Errorf("marshal event: %w", err)
    }
    
    // Extraer partition key para garantizar ordenamiento
    // (mismo aggregate_id va a misma partición)
    partitionKey := extractPartitionKey(event)
    
    msg := &sarama.ProducerMessage{
        Topic:     topic,
        Key:       sarama.StringEncoder(partitionKey),
        Value:     sarama.ByteEncoder(payload),
        Timestamp: time.Now().UTC(),
        Headers: []sarama.RecordHeader{
            {Key: []byte("content-type"), Value: []byte("application/json")},
            {Key: []byte("event-version"), Value: []byte("1.0")},
        },
    }
    
    _, _, err = p.client.SendMessage(msg)
    if err != nil {
        return fmt.Errorf("publish to %s: %w", topic, err)
    }
    
    return nil
}

func (p *Producer) Close() error {
    return p.client.Close()
}

func extractPartitionKey(event Event) string {
    // Usar reflection o type assertion para extraer AggregateID
    // Implementación simplificada:
    switch e := event.(type) {
    case interface{ GetAggregateID() string }:
        return e.GetAggregateID()
    default:
        return "default"
    }
}
```

### 5.4 Consumer Genérico con Graceful Shutdown

```go
// internal/infrastructure/kafka/consumer.go
package kafka

import (
    "context"
    "encoding/json"
    "fmt"
    "sync"
    "time"
    
    "github.com/IBM/sarama"
)

type Handler func(ctx context.Context, event Event) error

type Consumer struct {
    client   sarama.ConsumerGroup
    handlers map[string]Handler
    topics   []string
    groupID  string
    wg       sync.WaitGroup
}

func NewConsumer(brokers []string, groupID string, topics []string) (*Consumer, error) {
    config := sarama.NewConfig()
    config.Version = sarama.V3_0_0_0
    config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
    config.Consumer.Offsets.Initial = sarama.OffsetOldest // o OffsetNewest
    config.Consumer.Return.Errors = true
    
    client, err := sarama.NewConsumerGroup(brokers, groupID, config)
    if err != nil {
        return nil, err
    }
    
    return &Consumer{
        client:   client,
        handlers: make(map[string]Handler),
        topics:   topics,
        groupID:  groupID,
    }, nil
}

func (c *Consumer) RegisterHandler(eventType string, handler Handler) {
    c.handlers[eventType] = handler
}

func (c *Consumer) Start(ctx context.Context) error {
    handler := &consumerGroupHandler{
        consumer: c,
    }
    
    c.wg.Add(1)
    go func() {
        defer c.wg.Done()
        for {
            select {
            case <-ctx.Done():
                return
            default:
                // Consume con reconnection automática
                if err := c.client.Consume(ctx, c.topics, handler); err != nil {
                    fmt.Printf("Consumer error: %v\n", err)
                    time.Sleep(5 * time.Second) // Backoff antes de retry
                }
            }
        }
    }()
    
    return nil
}

func (c *Consumer) Stop() error {
    c.wg.Wait()
    return c.client.Close()
}

// consumerGroupHandler implementa sarama.ConsumerGroupHandler
type consumerGroupHandler struct {
    consumer *Consumer
}

func (h *consumerGroupHandler) Setup(sarama.ConsumerGroupSession) error   { return nil }
func (h *consumerGroupHandler) Cleanup(sarama.ConsumerGroupSession) error { return nil }

func (h *consumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for msg := range claim.Messages() {
        ctx := context.Background()
        
        // Extraer tipo de evento del payload o headers
        var envelope struct {
            EventType string `json:"event_type"`
        }
        if err := json.Unmarshal(msg.Value, &envelope); err != nil {
            // Dead letter: mensaje malformado
            session.MarkMessage(msg, "") // Skip
            continue
        }
        
        handler, ok := h.consumer.handlers[envelope.EventType]
        if !ok {
            // No handler registrado - puede ser expected o error
            session.MarkMessage(msg, "")
            continue
        }
        
        // Idempotencia: verificar si ya procesado (usando msg.Offset + partition)
        if err := handler(ctx, msg.Value); err != nil {
            // Retry con backoff o dead letter
            fmt.Printf("Handler error for %s: %v\n", envelope.EventType, err)
            // No marcar como procesado - Kafka reintentará
            continue
        }
        
        session.MarkMessage(msg, "")
    }
    return nil
}
```

### 5.5 API Go - Command Handler (Publish Feed)

```go
// cmd/api/handlers/feed_handler.go
package handlers

import (
    "net/http"
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    
    "superapp/internal/application"
    "superapp/internal/domain/feed"
    "superapp/internal/events"
    "superapp/internal/infrastructure/kafka"
)

type FeedHandler struct {
    feedService   *application.FeedService
    eventProducer *kafka.Producer
}

func NewFeedHandler(service *application.FeedService, producer *kafka.Producer) *FeedHandler {
    return &FeedHandler{
        feedService:   service,
        eventProducer: producer,
    }
}

type PublishFeedRequest struct {
    Content     string   `json:"content" binding:"required,max=5000"`
    ContentType string   `json:"content_type" binding:"required,oneof=text image video"`
    MediaURLs   []string `json:"media_urls,omitempty"`
    Tags        []string `json:"tags,omitempty"`
    Visibility  string   `json:"visibility" binding:"required,oneof=public followers private"`
}

// POST /api/v1/feeds
func (h *FeedHandler) PublishFeed(c *gin.Context) {
    var req PublishFeedRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    userID := c.GetString("user_id") // del JWT middleware
    feedID := uuid.New().String()
    
    // 1. Persistir en Write DB (PostgreSQL) - CQRS Command Side
    newFeed := &feed.Feed{
        ID:          feedID,
        UserID:      userID,
        Content:     req.Content,
        ContentType: req.ContentType,
        MediaURLs:   req.MediaURLs,
        Tags:        req.Tags,
        Visibility:  req.Visibility,
        CreatedAt:   time.Now().UTC(),
    }
    
    if err := h.feedService.Create(c.Request.Context(), newFeed); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create feed"})
        return
    }
    
    // 2. Emitir evento de dominio
    event, err := events.NewFeedPublished(
        feedID,
        userID,
        req.Content,
        req.ContentType,
    )
    if err != nil {
        // Log error pero no fallar la request - eventual consistency
        // El feed ya está creado, los consumers se actualizarán eventualmente
        c.JSON(http.StatusCreated, gin.H{
            "feed_id": feedID,
            "warning": "feed created but event publishing failed - will retry",
        })
        return
    }
    
    // Publicar a Kafka con exactly-once semantics
    if err := h.eventProducer.Publish(c.Request.Context(), "feed.events", event); err != nil {
        c.JSON(http.StatusCreated, gin.H{
            "feed_id": feedID,
            "warning": "event publishing failed - will retry",
        })
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{
        "feed_id": feedID,
        "status":  "published",
        "event_id": event.EventID,
    })
}
```

### 5.6 Feed Processor Consumer

```go
// cmd/feed-processor/main.go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "os"
    "os/signal"
    "syscall"
    "time"
    
    "superapp/internal/events"
    "superapp/internal/infrastructure/kafka"
    "superapp/internal/infrastructure/redis"
    "superapp/internal/infrastructure/postgres"
)

func main() {
    // Config
    brokers := []string{"kafka:9092"}
    topics := []string{"feed.events", "reaction.events"}
    groupID := "feed-processor-group"
    
    // Infra
    redisClient := redis.NewClient("redis:6379")
    pgClient := postgres.NewClient("postgres://user:pass@postgres:5432/superapp")
    
    // Consumer
    consumer, err := kafka.NewConsumer(brokers, groupID, topics)
    if err != nil {
        log.Fatal(err)
    }
    
    // Handlers
    consumer.RegisterHandler("FeedPublished", handleFeedPublished(redisClient, pgClient))
    consumer.RegisterHandler("FeedEdited", handleFeedEdited(redisClient, pgClient))
    consumer.RegisterHandler("FeedDeleted", handleFeedDeleted(redisClient, pgClient))
    consumer.RegisterHandler("ReactionAdded", handleReactionAdded(redisClient, pgClient))
    
    // Start
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    if err := consumer.Start(ctx); err != nil {
        log.Fatal(err)
    }
    
    // Graceful shutdown
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan
    
    log.Println("Shutting down feed processor...")
    shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer shutdownCancel()
    
    if err := consumer.Stop(); err != nil {
        log.Printf("Error stopping consumer: %v", err)
    }
    
    log.Println("Feed processor stopped")
}

func handleFeedPublished(redisClient *redis.Client, pgClient *postgres.Client) kafka.Handler {
    return func(ctx context.Context, eventData []byte) error {
        var event events.FeedPublished
        if err := json.Unmarshal(eventData, &event); err != nil {
            return fmt.Errorf("unmarshal FeedPublished: %w", err)
        }
        
        // 1. Actualizar Read Model en PostgreSQL (tabla denormalizada para queries)
        if err := pgClient.UpsertFeedReadModel(ctx, &event); err != nil {
            return fmt.Errorf("update read model: %w", err)
        }
        
        // 2. Invalidar/Actualizar cache en Redis (feed por usuario, feed global)
        cacheKey := fmt.Sprintf("feed:user:%s", event.UserID)
        if err := redisClient.Del(ctx, cacheKey); err != nil {
            log.Printf("Cache invalidation failed: %v", err)
            // No fallar - cache se refrescará en próximo miss
        }
        
        // 3. Actualizar feed global (timeline) - sorted set por timestamp
        globalKey := "feed:global:timeline"
        score := float64(event.CreatedAt.Unix())
        member := event.FeedID
        if err := redisClient.ZAdd(ctx, globalKey, score, member); err != nil {
            log.Printf("Timeline update failed: %v", err)
        }
        
        // 4. Indexar para búsqueda (Elasticsearch u otro)
        // ...
        
        return nil
    }
}

func handleReactionAdded(redisClient *redis.Client, pgClient *postgres.Client) kafka.Handler {
    return func(ctx context.Context, eventData []byte) error {
        var event events.ReactionAdded
        if err := json.Unmarshal(eventData, &event); err != nil {
            return err
        }
        
        // 1. Actualizar contador de reacciones en Read Model
        if err := pgClient.IncrementReactionCount(ctx, event.FeedID, event.ReactionType); err != nil {
            return err
        }
        
        // 2. Actualizar cache en tiempo real
        cacheKey := fmt.Sprintf("feed:%s:reactions", event.FeedID)
        if err := redisClient.HIncrBy(ctx, cacheKey, event.ReactionType, 1); err != nil {
            log.Printf("Reaction cache update failed: %v", err)
        }
        
        // 3. Notificar al autor del feed (emitir evento NotificationRequested)
        // ...
        
        return nil
    }
}
```

---

## 6. FEED VERTICAL: EVENTOS Y FLUJOS {#6-feed-vertical}

### 6.1 Arquitectura del Feed Vertical

Tu feed vertical (estilo TikTok/Reels) requiere **baja latencia** y **alta concurrencia**. La combinación EDA + CQRS es ideal:

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT APPS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  iOS App │  │AndroidApp│  │  Web App │  │  PWA     │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │              │
│       └─────────────┴─────────────┴─────────────┘              │
│                         │                                      │
│                         ▼                                      │
│              ┌─────────────────────┐                           │
│              │   API Gateway       │                           │
│              │   (Kong/AWS ALB)    │                           │
│              │   + Rate Limiting   │                           │
│              └──────────┬──────────┘                           │
│                         │                                      │
│              ┌──────────┴──────────┐                         │
│              │                     │                         │
│              ▼                     ▼                         │
│    ┌─────────────────┐   ┌─────────────────┐               │
│    │   Query API      │   │   Command API    │               │
│    │   (Go)           │   │   (Go)           │               │
│    │   - GET /feeds   │   │   - POST /feeds  │               │
│    │   - GET /feed/:id│   │   - POST /react  │               │
│    │   - GET /timeline│   │   - POST /pay    │               │
│    └────────┬────────┘   └────────┬────────┘               │
│             │                     │                         │
│             ▼                     ▼                         │
│    ┌─────────────────┐   ┌─────────────────┐               │
│    │   Read DB       │   │   Write DB      │               │
│    │   (PostgreSQL   │   │   (PostgreSQL   │               │
│    │    + Redis)     │   │    + Events)    │               │
│    │                 │   │                 │               │
│    │  Materialized   │   │  Event Sourcing │               │
│    │  Views para     │   │  + CQRS         │               │
│    │  queries rápidas│   │                 │               │
│    └─────────────────┘   └─────────────────┘               │
│                                                        │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Eventos del Feed Vertical

| Evento | Producer | Consumers | Descripción |
|--------|----------|-----------|-------------|
| `FeedPublished` | Command API | FeedProcessor, NotificationService, AnalyticsService, SearchIndexer | Nuevo contenido publicado |
| `FeedViewed` | Client Apps (batch) | AnalyticsService, RecommendationEngine | Usuario vio un feed |
| `FeedLiked` / `FeedShared` | Command API | FeedProcessor, NotificationService, AnalyticsService | Interacción social |
| `FeedReported` | Command API | ModerationService, AdminAlertService | Contenido reportado |
| `FeedPromoted` | Admin API | FeedProcessor, NotificationService | Contenido destacado |

### 6.3 Optimización para Feed Vertical (Infinite Scroll)

```go
// internal/application/feed_query_service.go
package application

import (
    "context"
    "fmt"
    "time"
    
    "superapp/internal/domain/feed"
)

type FeedQueryService struct {
    redisClient *redis.Client
    pgClient    *postgres.Client
}

// GetVerticalFeed - Optimizado para scroll infinito
func (s *FeedQueryService) GetVerticalFeed(
    ctx context.Context,
    userID string,
    cursor *string,      // último feed_id visto (pagination cursor)
    limit int,           // típicamente 10-20
    feedType string,     // "for_you", "following", "news"
) (*FeedPage, error) {
    
    cacheKey := fmt.Sprintf("feed:%s:%s:%s", feedType, userID, cursor)
    
    // 1. Intentar cache primero (sub-10ms)
    if cached, err := s.redisClient.GetJSON(ctx, cacheKey); err == nil {
        var page FeedPage
        if err := json.Unmarshal(cached, &page); err == nil {
            return &page, nil
        }
    }
    
    // 2. Cache miss - consultar Read Model
    var feeds []*feed.FeedView
    var nextCursor *string
    
    switch feedType {
    case "for_you":
        // Algoritmo de recomendación (ML-based o heuristic)
        feeds, nextCursor, err = s.pgClient.GetForYouFeed(ctx, userID, cursor, limit)
    case "following":
        // Feed de usuarios seguidos
        feeds, nextCursor, err = s.pgClient.GetFollowingFeed(ctx, userID, cursor, limit)
    case "news":
        // Noticias curadas
        feeds, nextCursor, err = s.pgClient.GetNewsFeed(ctx, cursor, limit)
    }
    
    if err != nil {
        return nil, err
    }
    
    // 3. Enriquecer con datos en tiempo real (reacciones, comentarios)
    for _, f := range feeds {
        reactions, _ := s.redisClient.HGetAll(ctx, fmt.Sprintf("feed:%s:reactions", f.ID))
        f.ReactionCounts = reactions
    }
    
    page := &FeedPage{
        Feeds:      feeds,
        NextCursor: nextCursor,
        HasMore:    nextCursor != nil,
    }
    
    // 4. Guardar en cache (TTL 30 segundos para contenido dinámico)
    s.redisClient.SetJSON(ctx, cacheKey, page, 30*time.Second)
    
    return page, nil
}
```

### 6.4 Eventos de Engagement (Views, Likes)

```go
// internal/events/engagement_events.go
package events

// FeedViewed - Evento batch enviado desde client apps
type FeedViewed struct {
    EventID   string    `json:"event_id"`
    UserID    string    `json:"user_id"`
    FeedID    string    `json:"feed_id"`
    Duration  int       `json:"duration_ms"`     // cuánto tiempo vio
    Percentage float64  `json:"view_percentage"` // 0.0 - 1.0
    Timestamp time.Time `json:"timestamp"`
    Device    string    `json:"device"`          // "ios", "android", "web"
    AppVersion string   `json:"app_version"`
}

// BatchViewEvent - Agrupación para eficiencia
type BatchViewEvent struct {
    EventID    string      `json:"event_id"`
    UserID     string      `json:"user_id"`
    Views      []FeedViewed `json:"views"`  // batch de 10-50 views
    Timestamp  time.Time   `json:"timestamp"`
}
```

**Client App (iOS/Android) - Envío batch de views**:
```swift
// iOS - ViewTracker.swift
class FeedViewTracker {
    private var pendingViews: [FeedViewed] = []
    private let batchSize = 20
    private let flushInterval: TimeInterval = 30 // segundos
    
    func trackView(feedId: String, duration: Int, percentage: Double) {
        let view = FeedViewed(
            feedId: feedId,
            duration: duration,
            percentage: percentage,
            timestamp: Date()
        )
        pendingViews.append(view)
        
        if pendingViews.count >= batchSize {
            flush()
        }
    }
    
    private func flush() {
        guard !pendingViews.isEmpty else { return }
        
        let batch = BatchViewEvent(views: pendingViews)
        APIClient.shared.sendEngagementBatch(batch) // POST /api/v1/engagement/batch
        
        pendingViews.removeAll()
    }
}
```

---

## 7. SISTEMA DE PAGOS Y SUSCRIPCIONES {#7-pagos}

### 7.1 Eventos de Pagos

| Evento | Producer | Consumers | Descripción |
|--------|----------|-----------|-------------|
| `PaymentInitiated` | Payment API | PaymentProcessor, FraudDetection | Inicio de pago |
| `PaymentProcessed` | PaymentProcessor | SubscriptionService, NotificationService, AnalyticsService | Pago completado |
| `PaymentFailed` | PaymentProcessor | SubscriptionService, NotificationService, RetryService | Pago fallido |
| `SubscriptionActivated` | SubscriptionService | NotificationService, FeatureService, AnalyticsService | Suscripción activa |
| `SubscriptionCancelled` | SubscriptionService | NotificationService, FeatureService, AnalyticsService | Suscripción cancelada |
| `SubscriptionRenewed` | SubscriptionService | NotificationService, AnalyticsService | Renovación automática |

### 7.2 Saga Pattern para Suscripciones

```go
// internal/application/subscription_saga.go
package application

import (
    "context"
    "fmt"
    "time"
    
    "superapp/internal/events"
    "superapp/internal/infrastructure/kafka"
)

// SubscriptionSaga - Orquestador del flujo de suscripción
type SubscriptionSaga struct {
    producer      *kafka.Producer
    paymentClient PaymentClient
    userService   UserService
}

func (s *SubscriptionSaga) StartSubscription(ctx context.Context, cmd StartSubscriptionCommand) error {
    sagaID := generateSagaID()
    
    // Paso 1: Validar usuario
    user, err := s.userService.GetUser(ctx, cmd.UserID)
    if err != nil {
        return fmt.Errorf("validate user: %w", err)
    }
    
    // Paso 2: Iniciar pago (request-response con timeout)
    paymentReq := PaymentRequest{
        UserID:   cmd.UserID,
        Amount:   cmd.Plan.Price,
        Currency: cmd.Plan.Currency,
        Method:   cmd.PaymentMethod,
    }
    
    paymentResult, err := s.paymentClient.Authorize(ctx, paymentReq)
    if err != nil {
        // No compensation needed yet
        return fmt.Errorf("payment authorization failed: %w", err)
    }
    
    // Emitir evento: PaymentInitiated
    event := &events.PaymentInitiated{
        SagaID:     sagaID,
        PaymentID:  paymentResult.ID,
        UserID:     cmd.UserID,
        Amount:     cmd.Plan.Price,
        PlanID:     cmd.Plan.ID,
    }
    s.producer.Publish(ctx, "payment.events", event)
    
    // Paso 3: Esperar evento PaymentProcessed (async)
    // El orquestador se suscribe a payment.events y continúa
    
    return nil
}

// HandlePaymentProcessed - Callback cuando el pago se procesa
func (s *SubscriptionSaga) HandlePaymentProcessed(ctx context.Context, event *events.PaymentProcessed) error {
    if event.Status != "completed" {
        // Compensation: liberar reserva de pago
        return s.compensatePayment(ctx, event)
    }
    
    // Paso 4: Activar suscripción
    subEvent := &events.SubscriptionActivated{
        UserID:        event.UserID,
        SubscriptionID: generateID(),
        PlanID:        event.PlanID,
        PaymentID:     event.PaymentID,
        ActivatedAt:   time.Now().UTC(),
        ExpiresAt:     time.Now().UTC().Add(30 * 24 * time.Hour),
    }
    
    if err := s.producer.Publish(ctx, "subscription.events", subEvent); err != nil {
        // Compensation: refund del pago
        return s.refundPayment(ctx, event.PaymentID)
    }
    
    // Paso 5: Notificar al usuario
    notifEvent := &events.NotificationRequested{
        UserID:  event.UserID,
        Type:    "subscription_activated",
        Title:   "¡Suscripción activada!",
        Body:    "Tu suscripción premium está activa.",
    }
    s.producer.Publish(ctx, "notification.events", notifEvent)
    
    return nil
}

// Compensation: Reembolsar pago si falla activación
func (s *SubscriptionSaga) refundPayment(ctx context.Context, paymentID string) error {
    return s.paymentClient.Refund(ctx, paymentID)
}
```

### 7.3 Webhook Handler para Gateway de Pagos (Stripe/PayU/etc)

```go
// cmd/payment-webhook/main.go
package main

import (
    "net/http"
    "encoding/json"
    
    "github.com/gin-gonic/gin"
    "superapp/internal/events"
    "superapp/internal/infrastructure/kafka"
)

func main() {
    r := gin.Default()
    producer := kafka.NewProducer(/* config */)
    
    // Stripe webhook endpoint
    r.POST("/webhooks/stripe", func(c *gin.Context) {
        var stripeEvent StripeEvent
        if err := c.ShouldBindJSON(&stripeEvent); err != nil {
            c.JSON(400, gin.H{"error": "invalid payload"})
            return
        }
        
        // Verificar firma del webhook
        if !verifyStripeSignature(c) {
            c.JSON(401, gin.H{"error": "invalid signature"})
            return
        }
        
        switch stripeEvent.Type {
        case "payment_intent.succeeded":
            handlePaymentSuccess(c, producer, stripeEvent)
        case "payment_intent.payment_failed":
            handlePaymentFailure(c, producer, stripeEvent)
        case "invoice.payment_succeeded":
            handleSubscriptionRenewal(c, producer, stripeEvent)
        }
        
        c.JSON(200, gin.H{"status": "processed"})
    })
    
    r.Run(":8080")
}

func handlePaymentSuccess(c *gin.Context, producer *kafka.Producer, event StripeEvent) {
    payload := event.Data.Object
    
    domainEvent := &events.PaymentProcessed{
        PaymentID:     payload.ID,
        UserID:        payload.Metadata["user_id"],
        Amount:        float64(payload.Amount) / 100, // Stripe usa centavos
        Currency:      payload.Currency,
        Status:        "completed",
        PaymentMethod: payload.PaymentMethod,
        ProcessedAt:   time.Now().UTC(),
    }
    
    producer.Publish(c.Request.Context(), "payment.events", domainEvent)
}
```

---

## 8. DIAGRAMAS C4 / MERMAID {#8-diagramas}

### 8.1 Diagrama de Contexto (C4 Nivel 1)

```mermaid
C4Context
    title Sistema de Super App - Nivel de Contexto

    Person(usuario, "Usuario", "Usa la super app para contenido, noticias y servicios")
    Person(admin, "Administrador", "Gestiona contenido, usuarios y monetización")

    System(superapp, "Super App Platform", "Plataforma de feed vertical, noticias, reacciones y pagos con arquitectura orientada a eventos")

    System_Ext(stripe, "Stripe / PayU", "Procesamiento de pagos y suscripciones")
    System_Ext(fcm, "Firebase Cloud Messaging", "Notificaciones push")
    System_Ext(s3, "AWS S3 / MinIO", "Almacenamiento de media")
    System_Ext(cdn, "CloudFront / Cloudflare", "CDN para contenido estático")

    Rel(usuario, superapp, "Publica, reacciona, paga", "HTTPS/JSON")
    Rel(admin, superapp, "Gestiona contenido", "HTTPS/JSON")
    Rel(superapp, stripe, "Procesa pagos", "HTTPS/Webhooks")
    Rel(superapp, fcm, "Envía notificaciones", "HTTPS")
    Rel(superapp, s3, "Almacena media", "HTTPS")
    Rel(superapp, cdn, "Distribuye contenido", "HTTPS")
```

### 8.2 Diagrama de Contenedores (C4 Nivel 2)

```mermaid
C4Container
    title Super App - Nivel de Contenedores (EDA)

    Person(usuario, "Usuario", "Usa iOS/Android/Web apps")
    Person(admin, "Admin", "Panel de administración")

    Container_Boundary(mobile, "Client Apps") {
        Container(ios, "iOS App", "Swift", "Feed vertical, reacciones, pagos in-app")
        Container(android, "Android App", "Kotlin", "Feed vertical, reacciones, pagos in-app")
        Container(web, "Web App", "React/Next.js", "Feed vertical, PWA")
    }

    Container_Boundary(api, "API Layer") {
        Container(gateway, "API Gateway", "Kong/AWS ALB", "Rate limiting, auth, routing")
        Container(command_api, "Command API", "Go/Gin", "POST/PUT/DELETE - publicar, reaccionar, pagar")
        Container(query_api, "Query API", "Go/Gin", "GET - feeds, timeline, perfil")
    }

    Container_Boundary(services, "Microservicios (Event-Driven)") {
        Container(feed_service, "Feed Service", "Go", "Gestión de publicaciones")
        Container(reaction_service, "Reaction Service", "Go", "Reacciones y comentarios")
        Container(payment_service, "Payment Service", "Go", "Pagos y suscripciones")
        Container(notification_service, "Notification Service", "Go", "Push, email, in-app")
        Container(analytics_service, "Analytics Service", "Go", "Métricas y reporting")
        Container(search_service, "Search Service", "Go", "Búsqueda de contenido")
    }

    ContainerDb(kafka, "Kafka Cluster", "Apache Kafka", "Event bus - topics por dominio")
    ContainerDb(write_db, "Write DB", "PostgreSQL", "Datos transaccionales, event sourcing")
    ContainerDb(read_db, "Read DB", "PostgreSQL + Redis", "Materialized views, cache")
    ContainerDb(s3, "Object Storage", "AWS S3", "Imágenes, videos")

    Rel(usuario, ios, "Usa", "HTTPS")
    Rel(usuario, android, "Usa", "HTTPS")
    Rel(usuario, web, "Usa", "HTTPS")
    
    Rel(ios, gateway, "API calls", "HTTPS/JSON")
    Rel(android, gateway, "API calls", "HTTPS/JSON")
    Rel(web, gateway, "API calls", "HTTPS/JSON")
    
    Rel(gateway, command_api, "Commands", "HTTP")
    Rel(gateway, query_api, "Queries", "HTTP")
    
    Rel(command_api, write_db, "Persiste", "SQL")
    Rel(command_api, kafka, "Publica eventos", "Kafka Protocol")
    
    Rel(feed_service, kafka, "Consume feed.events", "Kafka Protocol")
    Rel(reaction_service, kafka, "Consume reaction.events", "Kafka Protocol")
    Rel(payment_service, kafka, "Consume payment.events", "Kafka Protocol")
    Rel(notification_service, kafka, "Consume notification.events", "Kafka Protocol")
    Rel(analytics_service, kafka, "Consume all events", "Kafka Protocol")
    
    Rel(feed_service, read_db, "Actualiza views", "SQL")
    Rel(feed_service, s3, "Almacena media", "HTTPS")
    Rel(query_api, read_db, "Consulta", "SQL/Redis")
```

### 8.3 Diagrama de Componentes - Feed Service (C4 Nivel 3)

```mermaid
C4Component
    title Feed Service - Nivel de Componentes

    Container_Boundary(feed, "Feed Service") {
        Component(handler, "Feed Handler", "Go", "HTTP handlers para publicar/editar/eliminar feeds")
        Component(validator, "Feed Validator", "Go", "Validación de contenido, spam, moderación")
        Component(producer, "Event Producer", "Go", "Publica eventos a Kafka")
        Component(projector, "Feed Projector", "Go", "Consumer: actualiza read models desde eventos")
        Component(recommender, "Recommender", "Go", "Algoritmo de feed personalizado")
        Component(cache_manager, "Cache Manager", "Go", "Invalidación y warm-up de Redis")
        
        ComponentDb(event_store, "Event Store", "PostgreSQL", "Feed events append-only")
        ComponentDb(read_model, "Read Model", "PostgreSQL", "Vistas denormalizadas para queries")
        ComponentDb(redis, "Redis", "Redis", "Timeline cache, contadores en tiempo real")
    }

    Container(kafka, "Kafka", "Apache Kafka", "Event bus")
    Container(query_api, "Query API", "Go", "API de lectura")

    Rel(handler, validator, "Valida", "Func call")
    Rel(handler, producer, "Emite eventos", "Func call")
    Rel(handler, event_store, "Guarda estado", "SQL")
    
    Rel(producer, kafka, "Publish feed.events", "Kafka")
    
    Rel(projector, kafka, "Consume feed.events", "Kafka")
    Rel(projector, read_model, "Actualiza views", "SQL")
    Rel(projector, redis, "Actualiza cache", "Redis Protocol")
    
    Rel(recommender, read_model, "Consulta datos", "SQL")
    Rel(recommender, redis, "Cache scores", "Redis Protocol")
    
    Rel(query_api, read_model, "Consulta feeds", "SQL")
    Rel(query_api, redis, "Cache hit", "Redis Protocol")
```

### 8.4 Secuencia - Publicación de Feed

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Client App
    participant G as API Gateway
    participant Cmd as Command API (Go)
    participant WDB as Write DB
    participant K as Kafka
    participant FP as Feed Processor
    participant RDB as Read DB
    participant R as Redis
    participant NS as Notification Service
    
    U->>C: Publica contenido (texto + imagen)
    C->>G: POST /api/v1/feeds (JWT)
    G->>Cmd: Forward + Rate Limit Check
    
    Cmd->>Cmd: Validar contenido
    Cmd->>WDB: INSERT feed (estado: pending)
    WDB-->>Cmd: feed_id generado
    
    Cmd->>K: Publish FeedPublished event
    K-->>Cmd: Ack
    
    Cmd-->>G: 201 Created {feed_id}
    G-->>C: 201 Created
    C-->>U: "Publicado! Procesando..."
    
    Note over K,FP: Async Processing
    
    K->>FP: Consume FeedPublished
    FP->>FP: Procesar imagen (resize, OCR)
    FP->>S3: Upload media optimizado
    FP->>RDB: Upsert feed read model
    FP->>R: Update timeline cache
    FP->>R: Invalidate user feed cache
    FP->>K: Publish FeedProcessed event
    
    K->>NS: Consume FeedProcessed
    NS->>NS: Generar notificaciones
    NS->>FCM: Send push a followers
    
    Note over U,C: Eventual Consistency (~100-500ms)
    
    C->>G: GET /api/v1/feeds/{feed_id}
    G->>Cmd: Forward
    Cmd->>RDB: SELECT feed view
    RDB-->>Cmd: Feed data (con media URLs)
    Cmd-->>G: 200 OK
    G-->>C: 200 OK
    C-->>U: Muestra feed con media
```

---

## 9. CHECKLIST DE PRODUCCIÓN {#9-checklist}

### 9.1 Infraestructura Kafka

| Item | Recomendación | Prioridad |
|------|--------------|-----------|
| **Particiones** | Mínimo 3-6 por topic (escalar con throughput) | 🔴 Alta |
| **Replication Factor** | 3 (tolerancia a fallos de broker) | 🔴 Alta |
| **Retention** | 7 días mínimo (para replay y debugging) | 🟡 Media |
| **Compression** | `lz4` o `zstd` (reducir network I/O) | 🟡 Media |
| **Min ISR** | 2 (garantizar durability) | 🔴 Alta |
| **Dead Letter Topics** | `*.dead` para cada topic principal | 🔴 Alta |

### 9.2 Observabilidad

```yaml
# prometheus-rules.yml - Alertas críticas para EDA
groups:
  - name: kafka-alerts
    rules:
      - alert: KafkaConsumerLagHigh
        expr: kafka_consumer_group_lag > 10000
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Consumer lag alto en {{ $labels.topic }}"
          
      - alert: KafkaBrokerDown
        expr: up{job="kafka"} < 1
        for: 1m
        labels:
          severity: critical
          
      - alert: EventProcessingLatencyHigh
        expr: histogram_quantile(0.99, event_processing_duration_seconds) > 5
        for: 3m
        labels:
          severity: warning
```

### 9.3 Idempotencia y Exactly-Once

```go
// internal/infrastructure/kafka/idempotency.go
package kafka

import (
    "context"
    "fmt"
    "time"
    
    "github.com/redis/go-redis/v9"
)

type IdempotencyChecker struct {
    redis *redis.Client
    ttl   time.Duration
}

func NewIdempotencyChecker(redis *redis.Client) *IdempotencyChecker {
    return &IdempotencyChecker{
        redis: redis,
        ttl:   24 * time.Hour, // Ventana de deduplicación
    }
}

// IsProcessed - Verifica si un evento ya fue procesado
func (c *IdempotencyChecker) IsProcessed(ctx context.Context, eventID string) (bool, error) {
    key := fmt.Sprintf("idempotency:%s", eventID)
    exists, err := c.redis.Exists(ctx, key).Result()
    return exists > 0, err
}

// MarkProcessed - Marca evento como procesado
func (c *IdempotencyChecker) MarkProcessed(ctx context.Context, eventID string) error {
    key := fmt.Sprintf("idempotency:%s", eventID)
    return c.redis.Set(ctx, key, "1", c.ttl).Err()
}

// Uso en consumer:
func handleFeedPublished(redisClient *redis.Client) kafka.Handler {
    checker := kafka.NewIdempotencyChecker(redisClient)
    
    return func(ctx context.Context, eventData []byte) error {
        var event events.FeedPublished
        json.Unmarshal(eventData, &event)
        
        // 1. Check idempotencia
        if processed, _ := checker.IsProcessed(ctx, event.EventID); processed {
            return nil // Ya procesado, skip silenciosamente
        }
        
        // 2. Procesar evento
        // ... lógica de negocio ...
        
        // 3. Marcar como procesado (transactional con el procesamiento)
        if err := checker.MarkProcessed(ctx, event.EventID); err != nil {
            return fmt.Errorf("mark processed: %w", err)
        }
        
        return nil
    }
}
```

### 9.4 Schema Evolution (Avro/Protobuf)

```protobuf
// schemas/feed_events.proto
syntax = "proto3";

package superapp.events;

import "google/protobuf/timestamp.proto";

message FeedPublished {
    string event_id = 1;
    string event_type = 2;
    string aggregate_id = 3;
    int32 version = 4;
    google.protobuf.Timestamp timestamp = 5;
    
    string feed_id = 10;
    string user_id = 11;
    string content = 12;
    string content_type = 13;
    repeated string media_urls = 14;
    repeated string tags = 15;
    string visibility = 16;
    
    // NUEVO en v2 - backward compatible
    optional Location location = 17;
    optional string language = 18;
}

message Location {
    double lat = 1;
    double lng = 2;
    optional string name = 3;
}
```

**Reglas de evolución**:
- ✅ **Añadir campos**: Siempre `optional` o con `default`
- ✅ **Renombrar campos**: No romper consumers (usar `reserved`)
- ❌ **Eliminar campos requeridos**: Rompe consumers
- ❌ **Cambiar tipos**: Incompatible

### 9.5 Docker Compose para Desarrollo

```yaml
# docker-compose.yml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: superapp
      POSTGRES_PASSWORD: superapp
      POSTGRES_DB: superapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: cmd/api/Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      - kafka
      - postgres
      - redis
    environment:
      KAFKA_BROKERS: kafka:9092
      POSTGRES_DSN: postgres://superapp:superapp@postgres:5432/superapp?sslmode=disable
      REDIS_ADDR: redis:6379

  feed-processor:
    build:
      context: .
      dockerfile: cmd/feed-processor/Dockerfile
    depends_on:
      - kafka
      - postgres
      - redis
    environment:
      KAFKA_BROKERS: kafka:9092
      POSTGRES_DSN: postgres://superapp:superapp@postgres:5432/superapp?sslmode=disable
      REDIS_ADDR: redis:6379

volumes:
  postgres_data:
```

---

## 📚 RESUMEN EJECUTIVO

| Aspecto | Decisión para tu Super App |
|---------|---------------------------|
| **Broker** | Apache Kafka (3 brokers, replication factor 3) |
| **Lenguaje API** | Go (alto throughput, baja latencia) |
| **Patrón principal** | CQRS + Event Sourcing para feed y pagos |
| **Coordination** | Saga Pattern (orchestration) para suscripciones |
| **Read Models** | PostgreSQL + Redis (timeline cache) |
| **Client Apps** | iOS, Android, Web (todas consumen Query API) |
| **Idempotencia** | Redis con TTL 24h + event_id único |
| **Observability** | Prometheus + Grafana + Distributed Tracing (Jaeger) |
| **Schema** | Protobuf con reglas de backward compatibility |

---

¿Te gustaría que profundice en algún componente específico? Por ejemplo:
- 🔧 **Configuración de Kafka en Kubernetes** con Helm charts
- 🔐 **Seguridad**: JWT entre microservicios, mTLS, API keys
- 📊 **Analytics**: Kafka → ClickHouse para reporting en tiempo real
- 🤖 **ML**: Recomendaciones de feed usando eventos de engagement