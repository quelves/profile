---
title: "Arquitectura de Eventos para Feed Vertical: Construyendo la Super App MEGA"
date: "2025-08-15"
category: "Enterprise Architecture"
excerpt: "Cómo diseñamos el sistema de eventos que alimenta el feed vertical de la Super App MEGA — integrando noticias editorial, interacción social y pagos en una arquitectura CQRS + Event Sourcing con Go, Kafka y Redis."
tags: ["Event-Driven", "CQRS", "Kafka", "Go", "Super App", "Feed"]
lang: "es"
---

Un feed vertical no es una lista de publicaciones. Es un sistema distribuido en miniatura donde cada scroll dispara una cadena de eventos: un usuario vio contenido, reaccionó, comentó, siguió a un programa de TV, o inició una suscripción. En la Super App MEGA, estos eventos atraviesan seis bounded contexts diferentes antes de que el usuario vea el próximo post.

Este artículo describe el diseño del sistema de eventos que estamos construyendo para el feed vertical de la Super App MEGA — integrando contenido editorial de Meganoticias.cl y Mega.cl con interacción social de usuarios autenticados. No es teoría: son decisiones arquitectónicas tomadas para soportar 100K usuarios concurrentes con latencia p95 < 300ms.

## El Problema: Feed Vertical como Sistema Distribuido

Un feed vertical de estilo TikTok/Reels impone requisitos que una arquitectura request-response tradicional no resuelve eficientemente:

- **Alta escritura**: Cada visualización genera métricas de engagement que deben persistirse
- **Lectura crítica**: El scroll infinito requiere <300ms de latencia para no perder atención del usuario
- **Interacción social en tiempo real**: Comentarios y reacciones deben aparecer sin recargar
- **Consistencia eventual aceptable**: Un comentario puede tardar 200ms en propagarse; un pago no puede

La respuesta no es una sola base de datos ni una sola API. Es una arquitectura orientada a eventos con separación explícita entre comandos (escrituras) y consultas (lecturas): CQRS.

## Bounded Contexts del Feed

Basado en Domain-Driven Design, identificamos seis dominios que operan como contextos delimitados independientes:

| Bounded Context | Responsabilidad | Eventos Principales |
|---|---|---|
| **Feed** | Publicaciones, contenido vertical | `FeedPublished`, `FeedEdited`, `FeedDeleted`, `FeedPromoted` |
| **Reactions** | Reacciones, comentarios, compartidos | `ReactionAdded`, `CommentPosted`, `ShareCreated` |
| **News** | Noticias, curación editorial | `NewsPublished`, `NewsUpdated`, `NewsArchived` |
| **Users** | Perfiles, preferencias, autenticación | `UserRegistered`, `UserProfileUpdated`, `FollowCreated` |
| **Payments** | Suscripciones, pagos dentro del feed | `PaymentInitiated`, `SubscriptionActivated`, `SubscriptionCancelled` |
| **Notifications** | Push, in-app, email | `NotificationRequested`, `NotificationDelivered` |
| **Analytics** | Métricas, engagement, reporting | `FeedViewed`, `EngagementAggregated` |

Cada contexto publica eventos que otros consumen sin conocerse entre sí. El servicio de Reactions no sabe que el servicio de Notifications existe; simplemente emite `ReactionAdded` y confía en que quien necesite reaccionar, lo hará.

## El Bus de Eventos: Kafka como Columna Vertebral

La arquitectura de eventos de la Super App MEGA se construye sobre el mismo cluster de Kafka que ya opera el backend de MEGA GO. Pero el feed introduce requisitos nuevos:

| Topic | Particiones | RF | Retención | Caso de uso |
|---|---|---|---|---|
| `feed.events` | 6 | 3 | 7 días | Publicaciones, ediciones, eliminaciones |
| `reaction.events` | 6 | 3 | 7 días | Reacciones, comentarios, shares |
| `engagement.batch` | 12 | 3 | 1 día | Vistas batch desde apps móviles |
| `user.events` | 3 | 3 | 30 días | Registro, follows, preferencias |
| `payment.events` | 3 | 3 | 30 días | Suscripciones iniciadas, completadas, fallidas |
| `notification.events` | 3 | 3 | 3 días | Solicitudes de push e in-app |

El topic `engagement.batch` tiene más particiones porque es el más denso: cada usuario genera decenas de eventos de vista por sesión. Las apps móviles acumulan vistas en buffer local y envían lotes de 20-50 cada 30 segundos para reducir tráfico de red.

### Ordenamiento por Partition Key

Para garantizar consistencia donde es necesaria:

- **Feed events**: partition key = `feedId` (todas las operaciones sobre un post van a la misma partición)
- **Reactions**: partition key = `feedId` (las reacciones de un post se procesan en orden)
- **User events**: partition key = `userId` (las suscripciones de un usuario se procesan secuencialmente)
- **Engagement**: partition key = `userId` (evita contar dos veces la misma vista de un usuario)

## CQRS: Separar lo que Escribe de lo que Lee

El patrón CQRS divide la arquitectura en dos lados:

**Command Side (Escritura)**
- API Go (Gin/Fiber) recibe comandos: `PublishFeed`, `AddReaction`, `ProcessPayment`
- Valida, persiste en PostgreSQL (estado de verdad), emite evento a Kafka
- Latencia objetivo: <100ms para aceptar el comando

**Query Side (Lectura)**
- Consumidores de Kafka proyectan eventos en modelos de lectura optimizados
- PostgreSQL almacena vistas denormalizadas del feed
- Redis cachea timelines por usuario y contadores en tiempo real
- API de consulta responde desde cache primero, PostgreSQL como fallback

```
App Móvil → Command API → PostgreSQL (Write) → Kafka
                                            ↓
App Móvil ← Query API ← Redis/PostgreSQL (Read) ← Consumers
```

Esta separación permite optimizar cada lado independientemente: el lado de escritura prioriza consistencia transaccional; el lado de lectura prioriza latencia sub-100ms.

## Eventos del Feed Vertical

### Eventos de Contenido

Cuando un periodista publica una noticia desde el CMS headless (Strapi), el flujo de eventos es:

```
CMS Strapi → NewsPublished → Kafka
    → Feed Processor: crear vista denormalizada en Read DB
    → Search Indexer: actualizar Elasticsearch
    → Notification Service: push a seguidores del programa
    → Analytics: trackear publicación
```

Un solo evento produce cuatro acciones independientes. El CMS no conoce a los seguidores; el Notification Service consulta el grafo de follows en PostgreSQL para determinar quién recibe el push.

### Eventos de Engagement (Batch)

Las apps móviles no envían una petición por cada vista. Acumulan en buffer local:

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

El envío batch reduce el tráfico de red en 95%: una sesión promedio de 5 minutos genera ~40 vistas, pero solo 1-2 requests al servidor.

El consumer de engagement batch:
1. Descompone el lote en vistas individuales
2. Actualiza contadores en Redis (HIncrBy por tipo de reacción)
3. Persiste vistas en PostgreSQL para análisis posterior
4. Alimenta el algoritmo de recomendación con señales de interés

### Eventos de Interacción Social

Las reacciones y comentarios requieren baja latencia perceptual pero no consistencia inmediata en todas las réplicas:

```
Usuario reacciona → Command API → PostgreSQL (Write)
                              → Kafka: ReactionAdded
                                  → Feed Processor: actualizar contador
                                  → Notification Service: notificar autor
                                  → Real-time: WebSocket broadcast a viewers
```

El WebSocket (Socket.io con Redis Adapter) difunde la reacción a clientes conectados viendo el mismo post. Los clientes que no están conectados reciben la actualización en el próximo pull-to-refresh.

## Saga Pattern: Suscripción Desde el Feed

El feed vertical incluye monetización: los usuarios pueden suscribirse a contenido premium directamente desde un post. Este flujo cruza múltiples servicios y requiere coordinación sin transacciones distribuidas.

Usamos Saga con orquestación para el flujo de suscripción:

```
1. UserSubscribes (Command desde feed)
   ↓
2. PaymentInitiated → Kafka
   ↓
3. PaymentProcessed (o PaymentFailed)
   │   └── Si falla → Compensation: liberar reserva
   ↓
4. SubscriptionActivated → Kafka
   ↓
5. NotificationRequested → Push de bienvenida
   ↓
6. FeatureUnlocked → Habilitar contenido premium en feed
```

Cada paso es un evento. Si el pago falla, emitimos `PaymentFailed` que dispara compensación: liberar la reserva de suscripción y notificar al usuario. No hay bloqueos distribuidos ni 2PC.

## Read Models: Optimizados para el Feed

El modelo de lectura del feed es una tabla denormalizada en PostgreSQL diseñada para consultas rápidas de scroll infinito:

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
    -- Índices para queries del feed
    CONSTRAINT idx_feed_views_created_at DESC
);

CREATE INDEX idx_feed_views_user_created 
    ON feed_views(user_id, created_at DESC);
    
CREATE INDEX idx_feed_views_program 
    ON feed_views(program_id, created_at DESC) 
    WHERE program_id IS NOT NULL;
```

El scroll infinito consulta esta tabla con cursor-based pagination:

```sql
SELECT * FROM feed_views 
WHERE created_at < $cursor 
ORDER BY created_at DESC 
LIMIT 20;
```

Cursor-based pagination evita el offset problem a escala y es cacheable en Redis con TTL de 30 segundos.

## El Algoritmo del Feed: Eventos como Señales

El feed personalizado no es una query SQL simple. Es un pipeline de eventos:

1. **Candidate Generation**: Los eventos `FollowCreated` alimentan una lista de fuentes por usuario. `NewsPublished` y `FeedPublished` generan candidatos.
2. **Ranking**: Señales de engagement (vistas, reacciones, tiempo de visualización) ponderan cada candidato. Un post con 80% de view-through-rate recibe mayor score.
3. **Ad Injection**: Eventos de campaña publicitaria insertan anuncios nativos cada N posts.
4. **Deduplication**: El evento `FeedViewed` marca posts ya vistos para no repetir.

Este pipeline corre en consumers de Kafka que mantienen el feed pre-computado por usuario en Redis, actualizándose en tiempo real a medida que llegan eventos.

## Lecciones Operacionales

### Idempotencia con Event IDs

En un sistema distribuido, los mismos eventos pueden llegar dos veces (retries de Kafka, redeliveries de WebSocket). Cada evento lleva un `event_id` UUID v4. Los consumers verifican en Redis antes de procesar:

```go
func (c *Consumer) handleFeedPublished(ctx context.Context, event FeedPublished) error {
    key := fmt.Sprintf("idempotency:%s", event.EventID)
    if exists, _ := c.redis.Exists(ctx, key).Result(); exists > 0 {
        return nil // Ya procesado, skip silencioso
    }
    
    // ... lógica de negocio ...
    
    return c.redis.Set(ctx, key, "1", 24*time.Hour).Err()
}
```

Sin esta protección, una reacción duplicada incrementaría el contador dos veces.

### Schema Evolution con Protobuf

Los eventos se serializan en Protobuf con reglas estrictas de backward compatibility:

- ✅ Añadir campos: siempre `optional` o con `default`
- ✅ Renombrar campos: usar `reserved` para evitar colisiones
- ❌ Eliminar campos requeridos: rompe consumers
- ❌ Cambiar tipos: incompatible

El campo `version` en cada evento permite evolucionar el schema. Un consumer puede manejar `FeedPublished_v1` y `FeedPublished_v2` mientras migra.

### Backpressure y Consumer Lag

Durante un evento en vivo masivo (la final de un reality show), el topic `engagement.batch` puede recibir 50K mensajes/segundo. Si los consumers de analytics no procesan rápido, el lag crece.

Monitoreamos con Prometheus:

```yaml
- alert: FeedConsumerLagHigh
  expr: kafka_consumer_group_lag{topic=~"feed.events|reaction.events"} > 5000
  for: 2m
  labels:
    severity: warning
```

La mitigación es automática: si el lag excede 10K mensajes, el HPA (Horizontal Pod Autoscaler) escala los consumers de 3 a 12 instancias. Si el lag persiste, activamos sampling en analytics (procesar 1 de cada 5 eventos) hasta recuperación.

### Dead Letter Topics

Cuando un consumer falla procesando un evento (bug, dependencia caída), el mensaje va a un dead letter topic después de 3 retries con backoff exponencial:

```
feed.events → Consumer falla → Retry 1 (1s) → Retry 2 (5s) → Retry 3 (25s)
    → feed.dead (persiste 30 días para análisis y reinyección manual)
```

Los mensajes en dead letter se inspeccionan, se corrige el bug, y se reinyectan al topic original para procesamiento.

## La Super App como Ecosistema de Eventos

El feed vertical no opera aislado. Es un nodo en el grafo de eventos de la Super App MEGA:

- Un `FollowCreated` en el feed activa `SubscriptionRecommended` en el módulo de pagos
- Un `PaymentProcessed` habilita `PremiumContentUnlocked` en el feed
- Un `FeedViewed` con duración >60s genera `RecommendationSignal` para el motor de ML
- Un `CommentPosted` con palabras clave dispara `NewsTipCreated` para el equipo editorial

Estos flujos cruzan bounded contexts sin acoplamiento directo. El servicio de pagos no importa el paquete del feed; ambos hablan Kafka.

## La Lección

Construir un feed vertical con arquitectura orientada a eventos no es sobre elegir Kafka o Redis. Es sobre diseñar sistemas donde cada dominio publica lo que le sucede y se suscribe a lo que le importa — sin conocer quién está del otro lado.

El CQRS nos permite optimizar escrituras para consistencia y lecturas para velocidad. El Saga pattern nos permite coordinar flujos de negocio complejos sin bloqueos. Los eventos de engagement batch nos permiten escalar métricas sin colapsar la red.

La métrica que más importa no es cuántos eventos procesamos. Es cuántos eventos procesamos sin que el usuario note que hay un sistema distribuido detrás. Cuando un usuario reacciona a un post y la reacción aparece en 150ms en otro dispositivo, no está viendo Kafka, Redis o WebSocket. Está viendo un sistema que funciona.
