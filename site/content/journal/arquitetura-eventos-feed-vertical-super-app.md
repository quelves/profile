---
title: "Arquitetura de Eventos para Feed Vertical: Construindo a Super App MEGA"
date: "2025-08-15"
category: "Enterprise Architecture"
excerpt: "Como desenhamos o sistema de eventos que alimenta o feed vertical da Super App MEGA — integrando notícias editorial, interação social e pagamentos em uma arquitetura CQRS + Event Sourcing com Go, Kafka e Redis."
tags: ["Event-Driven", "CQRS", "Kafka", "Go", "Super App", "Feed"]
lang: "pt"
---

Um feed vertical não é uma lista de publicações. É um sistema distribuído em miniatura onde cada scroll dispara uma cadeia de eventos: um usuário viu conteúdo, reagiu, comentou, seguiu um programa de TV, ou iniciou uma assinatura. Na Super App MEGA, esses eventos atravessam seis bounded contexts diferentes antes que o usuário veja o próximo post.

Este artigo descreve o design do sistema de eventos que estamos construindo para o feed vertical da Super App MEGA — integrando conteúdo editorial de Meganoticias.cl e Mega.cl com interação social de usuários autenticados. Não é teoria: são decisões arquitetônicas tomadas para suportar 100K usuários simultâneos com latência p95 < 300ms.

## O Problema: Feed Vertical como Sistema Distribuído

Um feed vertical estilo TikTok/Reels impõe requisitos que uma arquitetura request-response tradicional não resolve eficientemente:

- **Alta escrita**: Cada visualização gera métricas de engagement que devem persistir
- **Leitura crítica**: O scroll infinito requer <300ms de latência para não perder a atenção do usuário
- **Interação social em tempo real**: Comentários e reações devem aparecer sem recarregar
- **Consistência eventual aceitável**: Um comentário pode demorar 200ms para propagar; um pagamento não pode

A resposta não é um único banco de dados nem uma única API. É uma arquitetura orientada a eventos com separação explícita entre comandos (escritas) e consultas (leituras): CQRS.

## Bounded Contexts do Feed

Baseado em Domain-Driven Design, identificamos seis domínios que operam como contextos delimitados independentes:

| Bounded Context | Responsabilidade | Eventos Principais |
|---|---|---|
| **Feed** | Publicações, conteúdo vertical | `FeedPublished`, `FeedEdited`, `FeedDeleted`, `FeedPromoted` |
| **Reactions** | Reações, comentários, compartilhamentos | `ReactionAdded`, `CommentPosted`, `ShareCreated` |
| **News** | Notícias, curadoria editorial | `NewsPublished`, `NewsUpdated`, `NewsArchived` |
| **Users** | Perfis, preferências, autenticação | `UserRegistered`, `UserProfileUpdated`, `FollowCreated` |
| **Payments** | Assinaturas, pagamentos dentro do feed | `PaymentInitiated`, `SubscriptionActivated`, `SubscriptionCancelled` |
| **Notifications** | Push, in-app, email | `NotificationRequested`, `NotificationDelivered` |
| **Analytics** | Métricas, engagement, reporting | `FeedViewed`, `EngagementAggregated` |

Cada contexto publica eventos que outros consomem sem se conhecerem. O serviço de Reactions não sabe que o serviço de Notifications existe; simplesmente emite `ReactionAdded` e confia que quem precisar reagir, o fará.

## O Barramento de Eventos: Kafka como Coluna Vertebral

A arquitetura de eventos da Super App MEGA se constrói sobre o mesmo cluster de Kafka que já opera o backend do MEGA GO. Mas o feed introduz requisitos novos:

| Topic | Partições | RF | Retenção | Caso de uso |
|---|---|---|---|---|
| `feed.events` | 6 | 3 | 7 dias | Publicações, edições, eliminações |
| `reaction.events` | 6 | 3 | 7 dias | Reações, comentários, shares |
| `engagement.batch` | 12 | 3 | 1 dia | Visualizações batch desde apps móveis |
| `user.events` | 3 | 3 | 30 dias | Registro, follows, preferências |
| `payment.events` | 3 | 3 | 30 dias | Assinaturas iniciadas, completadas, falhas |
| `notification.events` | 3 | 3 | 3 dias | Solicitações de push e in-app |

O topic `engagement.batch` tem mais partições porque é o mais denso: cada usuário gera dezenas de eventos de visualização por sessão. Os apps móveis acumulam visualizações em buffer local e enviam lotes de 20-50 a cada 30 segundos para reduzir tráfego de rede.

### Ordenação por Partition Key

Para garantir consistência onde é necessária:

- **Feed events**: partition key = `feedId` (todas as operações sobre um post vão para a mesma partição)
- **Reactions**: partition key = `feedId` (as reações de um post são processadas em ordem)
- **User events**: partition key = `userId` (as assinaturas de um usuário são processadas sequencialmente)
- **Engagement**: partition key = `userId` (evita contar duas vezes a mesma visualização de um usuário)

## CQRS: Separar o que Escreve do que Lê

O padrão CQRS divide a arquitetura em dois lados:

**Command Side (Escrita)**
- API Go (Gin/Fiber) recebe comandos: `PublishFeed`, `AddReaction`, `ProcessPayment`
- Valida, persiste em PostgreSQL (estado de verdade), emite evento para Kafka
- Latência objetivo: <100ms para aceitar o comando

**Query Side (Leitura)**
- Consumidores de Kafka projetam eventos em modelos de leitura otimizados
- PostgreSQL armazena vistas denormalizadas do feed
- Redis cacheia timelines por usuário e contadores em tempo real
- API de consulta responde desde cache primeiro, PostgreSQL como fallback

```
App Móvel → Command API → PostgreSQL (Write) → Kafka
                                            ↓
App Móvel ← Query API ← Redis/PostgreSQL (Read) ← Consumers
```

Esta separação permite otimizar cada lado independentemente: o lado de escrita prioriza consistência transacional; o lado de leitura prioriza latência sub-100ms.

## Eventos do Feed Vertical

### Eventos de Conteúdo

Quando um jornalista publica uma notícia desde o CMS headless (Strapi), o fluxo de eventos é:

```
CMS Strapi → NewsPublished → Kafka
    → Feed Processor: criar vista denormalizada no Read DB
    → Search Indexer: atualizar Elasticsearch
    → Notification Service: push para seguidores do programa
    → Analytics: trackear publicação
```

Um único evento produz quatro ações independentes. O CMS não conhece os seguidores; o Notification Service consulta o grafo de follows em PostgreSQL para determinar quem recebe o push.

### Eventos de Engagement (Batch)

Os apps móveis não enviam uma petição por cada visualização. Acumulam em buffer local:

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

O envio batch reduz o tráfego de rede em 95%: uma sessão média de 5 minutos gera ~40 visualizações, mas apenas 1-2 requests ao servidor.

O consumer de engagement batch:
1. Decompõe o lote em visualizações individuais
2. Atualiza contadores no Redis (HIncrBy por tipo de reação)
3. Persiste visualizações em PostgreSQL para análise posterior
4. Alimenta o algoritmo de recomendação com sinais de interesse

### Eventos de Interação Social

As reações e comentários requerem baixa latência perceptual mas não consistência imediata em todas as réplicas:

```
Usuário reage → Command API → PostgreSQL (Write)
                          → Kafka: ReactionAdded
                              → Feed Processor: atualizar contador
                              → Notification Service: notificar autor
                              → Real-time: WebSocket broadcast para viewers
```

O WebSocket (Socket.io com Redis Adapter) difunde a reação para clientes conectados vendo o mesmo post. Os clientes que não estão conectados recebem a atualização no próximo pull-to-refresh.

## Saga Pattern: Assinatura Desde o Feed

O feed vertical inclui monetização: os usuários podem assinar conteúdo premium diretamente desde um post. Este fluxo cruza múltiplos serviços e requer coordenação sem transações distribuídas.

Usamos Saga com orquestração para o fluxo de assinatura:

```
1. UserSubscribes (Command desde feed)
   ↓
2. PaymentInitiated → Kafka
   ↓
3. PaymentProcessed (ou PaymentFailed)
   │   └── Se falha → Compensation: liberar reserva
   ↓
4. SubscriptionActivated → Kafka
   ↓
5. NotificationRequested → Push de boas-vindas
   ↓
6. FeatureUnlocked → Habilitar conteúdo premium no feed
```

Cada passo é um evento. Se o pagamento falha, emitimos `PaymentFailed` que dispara compensação: liberar a reserva de assinatura e notificar o usuário. Não há bloqueios distribuídos nem 2PC.

## Read Models: Otimizados para o Feed

O modelo de leitura do feed é uma tabela denormalizada em PostgreSQL desenhada para consultas rápidas de scroll infinito:

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
    -- Índices para queries do feed
    CONSTRAINT idx_feed_views_created_at DESC
);

CREATE INDEX idx_feed_views_user_created 
    ON feed_views(user_id, created_at DESC);
    
CREATE INDEX idx_feed_views_program 
    ON feed_views(program_id, created_at DESC) 
    WHERE program_id IS NOT NULL;
```

O scroll infinito consulta esta tabela com cursor-based pagination:

```sql
SELECT * FROM feed_views 
WHERE created_at < $cursor 
ORDER BY created_at DESC 
LIMIT 20;
```

Cursor-based pagination evita o offset problem em escala e é cacheable no Redis com TTL de 30 segundos.

## O Algoritmo do Feed: Eventos como Sinais

O feed personalizado não é uma query SQL simples. É um pipeline de eventos:

1. **Candidate Generation**: Os eventos `FollowCreated` alimentam uma lista de fontes por usuário. `NewsPublished` e `FeedPublished` geram candidatos.
2. **Ranking**: Sinais de engagement (visualizações, reações, tempo de visualização) ponderam cada candidato. Um post com 80% de view-through-rate recebe maior score.
3. **Ad Injection**: Eventos de campanha publicitária inserem anúncios nativos a cada N posts.
4. **Deduplication**: O evento `FeedViewed` marca posts já vistos para não repetir.

Este pipeline roda em consumers de Kafka que mantêm o feed pré-computado por usuário no Redis, atualizando-se em tempo real à medida que chegam eventos.

## Lições Operacionais

### Idempotência com Event IDs

Em um sistema distribuído, os mesmos eventos podem chegar duas vezes (retries de Kafka, redeliveries de WebSocket). Cada evento leva um `event_id` UUID v4. Os consumers verificam no Redis antes de processar:

```go
func (c *Consumer) handleFeedPublished(ctx context.Context, event FeedPublished) error {
    key := fmt.Sprintf("idempotency:%s", event.EventID)
    if exists, _ := c.redis.Exists(ctx, key).Result(); exists > 0 {
        return nil // Já processado, skip silencioso
    }
    
    // ... lógica de negócio ...
    
    return c.redis.Set(ctx, key, "1", 24*time.Hour).Err()
}
```

Sem esta proteção, uma reação duplicada incrementaria o contador duas vezes.

### Schema Evolution com Protobuf

Os eventos são serializados em Protobuf com regras estritas de backward compatibility:

- ✅ Adicionar campos: sempre `optional` ou com `default`
- ✅ Renomear campos: usar `reserved` para evitar colisões
- ❌ Eliminar campos requeridos: quebra consumers
- ❌ Mudar tipos: incompatível

O campo `version` em cada evento permite evoluir o schema. Um consumer pode manejar `FeedPublished_v1` e `FeedPublished_v2` enquanto migra.

### Backpressure e Consumer Lag

Durante um evento ao vivo massivo (a final de um reality show), o topic `engagement.batch` pode receber 50K mensagens/segundo. Se os consumers de analytics não processarem rápido, o lag cresce.

Monitoramos com Prometheus:

```yaml
- alert: FeedConsumerLagHigh
  expr: kafka_consumer_group_lag{topic=~"feed.events|reaction.events"} > 5000
  for: 2m
  labels:
    severity: warning
```

A mitigação é automática: se o lag excede 10K mensagens, o HPA escala os consumers de 3 para 12 instâncias. Se o lag persiste, ativamos sampling em analytics (processar 1 de cada 5 eventos) até recuperação.

### Dead Letter Topics

Quando um consumer falha processando um evento (bug, dependência caída), a mensagem vai para um dead letter topic após 3 retries com backoff exponencial:

```
feed.events → Consumer falha → Retry 1 (1s) → Retry 2 (5s) → Retry 3 (25s)
    → feed.dead (persiste 30 dias para análise e reinyeção manual)
```

As mensagens em dead letter são inspecionadas, corrige-se o bug, e reinyetam-se no topic original para processamento.

## A Super App como Ecossistema de Eventos

O feed vertical não opera isolado. É um nó no grafo de eventos da Super App MEGA:

- Um `FollowCreated` no feed ativa `SubscriptionRecommended` no módulo de pagamentos
- Um `PaymentProcessed` habilita `PremiumContentUnlocked` no feed
- Um `FeedViewed` com duração >60s gera `RecommendationSignal` para o motor de ML
- Um `CommentPosted` com palavras-chave dispara `NewsTipCreated` para a equipe editorial

Estes fluxos cruzam bounded contexts sem acoplamento direto. O serviço de pagamentos não importa o pacote do feed; ambos falam Kafka.

## A Lição

Construir um feed vertical com arquitetura orientada a eventos não é sobre escolher Kafka ou Redis. É sobre desenhar sistemas onde cada domínio publica o que lhe sucede e se inscreve no que lhe importa — sem saber quem está do outro lado.

O CQRS nos permite otimizar escritas para consistência e leituras para velocidade. O Saga pattern nos permite coordenar fluxos de negócio complexos sem bloqueios. Os eventos de engagement batch nos permitem escalar métricas sem colapsar a rede.

A métrica que mais importa não é quantos eventos processamos. É quantos eventos processamos sem que o usuário note que há um sistema distribuído por trás. Quando um usuário reage a um post e a reação aparece em 150ms em outro dispositivo, não está vendo Kafka, Redis ou WebSocket. Está vendo um sistema que funciona.
