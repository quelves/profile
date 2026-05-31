---
title: "Arquitetura Orientada a Eventos: Quando Kafka Encontra Firebase"
date: "2025-06-18"
category: "Enterprise Architecture"
excerpt: "Como combinamos Kafka para streaming de eventos backend com Firebase para push de cliente em tempo real para construir uma arquitetura orientada a eventos que gerencia 150K usuários concurrentes sem perder uma única mensagem."
tags: ["Event-Driven", "Kafka", "Firebase", "Microsserviços", "Arquitetura"]
lang: "pt"
---

A arquitetura orientada a eventos é fácil de entender e difícil de operar. O conceito — os serviços se comunicam produzindo e consumindo eventos em vez de se chamarem diretamente — é intuitivo. A realidade de garantir entrega de mensagens, lidar com backpressure e manter ordenação através de consumidores distribuídos é qualquer coisa menos intuitiva.

Este artigo descreve como a Megamedia combina dois sistemas de eventos — **Apache Kafka** para microsserviços backend e **Firebase Cloud Messaging** para push de cliente — para criar uma arquitetura híbrida de eventos que serve 150K usuários concurrentes durante eventos ao vivo.

## Por Que Dois Sistemas de Eventos?

O backend precisa do Kafka. O cliente precisa do Firebase. Eles servem propósitos diferentes:

| Dimensão | Kafka (Backend) | Firebase (Cliente) |
|----------|-----------------|-------------------|
| **Throughput** | 1M+ mensagens/seg | 500K mensagens/seg |
| **Latência** | Milissegundos | Segundos (best effort) |
| **Durabilidade** | Persistente (disco) | Efêmero (memória) |
| **Ordenação** | Garantida a nível de partição | Best effort |
| **Modelo de consumidor** | Pull (consumidores leem) | Push (servidor envia) |
| **Caso de uso** | Eventos serviço-a-serviço | Notificações servidor-a-cliente |

Usar ambos os sistemas não é redundância. É especialização.

## A Coluna Vertebral de Eventos Backend: Kafka

O backend do MEGA GO usa Kafka como o sistema nervoso central para comunicação cross-service. Os fluxos de eventos core são:

### Fluxo de Pagamentos
```
PAY API → PaymentInitiated → Kafka → OTT API (estender assinatura)
                           → Kafka → SSO API (atualizar direitos)
                           → Kafka → NOTIFY API (enviar recibo)
                           → Kafka → ANALYTICS (tracket receitas)
```

Quando um usuário se inscreve, a PAY API produz um único evento `PaymentInitiated`. Quatro consumidores independentes o processam sem que a PAY API saiba que eles existem. Se adicionarmos um quinto consumidor amanhã (digamos, uma integração CRM), a PAY API requer zero mudanças.

Esta é a promessa de desacoplamento da arquitetura orientada a eventos: produtores e consumidores evoluem independentemente.

### Fluxo de Publicação de Conteúdo
```
CMS → ContentPublished → Kafka → OTT API (atualizar catálogo)
                      → Kafka → MDS API (preparar streaming)
                      → Kafka → CDN (purge de cache)
                      → Kafka → SEARCH API (atualizar índice)
                      → Kafka → FIREBASE (notificar clientes)
```

Quando um produtor de conteúdo publica uma nova série, cinco sistemas reagem simultaneamente. O CMS não chama cinco APIs. Produz um evento.

### Fluxo de Evento ao Vivo
```
LIVE STREAM → ViewerJoined → Kafka → ANALYTICS (contador em tempo real)
            → ViewerLeft   → Kafka → ANALYTICS (atualizar contador)
            → StreamEnded  → Kafka → OTT API (atualizar catálogo)
                           → Kafka → CDN (purge de cache ao vivo)
```

Durante o Festival de Viña, o sistema de analytics consome eventos `ViewerJoined` e `ViewerLeft` para manter um contador em tempo real de espectadores concurrentes. Este contador alimenta o sistema de auto-scaling que provisiona capacidade adicional de CDN quando os limiares são excedidos.

## Configuração de Kafka para Produção

Nosso cluster de Kafka roda na Huawei Cloud com a seguinte configuração de produção:

**Design de Topics**: Cada tipo de evento de negócio tem seu próprio topic:
- `payments` (3 partições, fator de replicação 3)
- `content-publications` (6 partições, RF 3)
- `user-activities` (12 partições, RF 3)
- `live-events` (6 partições, RF 3)

A contagem de partições é determinada pelo paralelismo de consumidores. O topic `user-activities` tem mais partições porque tem mais consumidores independentes (analytics, personalização, CRM, detecção de fraude).

**Consumer Groups**: Cada serviço tem seu próprio consumer group, permitindo escalamento independente:
- `ott-api-consumer-group` (3 instâncias)
- `analytics-consumer-group` (6 instâncias)
- `notify-consumer-group` (2 instâncias)

**Retenção**: 7 dias para a maioria dos topics, 30 dias para `payments` (requisito de auditoria), 1 dia para `live-events` (dados transitorios).

## A Camada de Eventos do Cliente: Firebase

Enquanto o Kafka lida com comunicação serviço-a-serviço, o Firebase Cloud Messaging (FCM) lida com notificações push servidor-a-cliente:

**Tipos de Eventos Push a Clientes**:
- `NEW_CONTENT`: Novo episódio ou filme disponível
- `SUBSCRIPTION_EXPIRING`: Lembrete 3 dias antes da expiração
- `LIVE_EVENT_STARTING`: Festival de Viña começa em 15 minutos
- `PERSONALIZED_RECOMMENDATION`: Sugestão de conteúdo gerada por IA
- `FEATURE_FLAG_CHANGE`: Nova micro-app habilitada na Super App

Cada evento carrega um payload com URL de deep-link, título, corpo e URL de imagem. O app mobile recebe o push, exibe a notificação, e roteia o usuário para a tela correta quando tocada.

**Decisão Crítica**: FCM é entrega best-effort. Para eventos críticos de negócio (confirmações de pagamento), o app faz polling da PAY API no próximo lançamento para reconciliar. O push é uma dica, não uma garantia.

## A Ponte: Quando Kafka Encontra Firebase

A questão arquitetônica interessante é: como os eventos backend se tornam pushes de cliente?

Usamos Firebase Cloud Functions como a ponte:

```
Kafka → Cloud Function (disparada por connector de Kafka)
     → Avaliar: este evento deveria fazer push a clientes?
     → Sim: Consultar tokens FCM para usuários afetados
     → Enviar mensagens FCM em batch
     → Logar métricas de entrega
```

Por exemplo, quando o evento `ContentPublished` é consumido pela Cloud Function, ela:
1. Consulta o banco de dados de usuários para assinantes do gênero daquele conteúdo
2. Agrupa tokens FCM em grupos de 500
3. Envia mensagens multicast via FCM HTTP v1 API
4. Loga contagens de enviados/entregues/falhados ao BigQuery

Este padrão de ponte separa responsabilidades: Kafka lida com confiabilidade backend, Firebase lida com alcance de cliente, e a Cloud Function lida com a tradução entre os dois mundos.

## Backpressure e o Problema de 150K

O problema mais difícil de arquitetura orientada a eventos que enfrentamos foi o Festival de Viña 2026. No pico, 150K usuários se uniram ao stream ao vivo dentro de uma janela de 5 minutos. Isso produziu:
- 150K eventos `ViewerJoined`
- 150K verificações de autenticação
- 150K solicitações de licença DRM
- 150K cache misses de CDN edge (para usuários em novas regiões)

O cluster de Kafka lidou com o volume de eventos facilmente. Os consumidores downstream não.

O consumer group de analytics atrasou 12 minutos porque seus inserts por lotes ao BigQuery não podiam manter o ritmo. A solução foi tripla:

1. **Aumentar instâncias de consumidor**: 3 → 6 consumidores de analytics
2. **Otimização de tamanho de lote**: Reduzir lote do BigQuery de 1,000 para 500 linhas, aumentando frequência de flush
3. **Circuit breaker**: Quando o lag excede 10 minutos, mudar para sampling (processar 1 de cada 10 eventos) até recuperar

**Lição**: Arquiteturas orientadas a eventos não eliminam problemas de escalamento. Eles os movem do produtor para o consumidor. Monitore o lag do consumidor como sua métrica operativa principal.

## Ordenação vs. Paralelismo

Kafka garante ordenação dentro de uma partição. Mas se você precisa de ordenação global através de todas as partições, sacrifica paralelismo.

Para pagamentos, usamos o `userId` como partition key. Isso garante que todos os eventos para um único usuário sejam processados em ordem — crítico porque `PaymentInitiated` deve ser processado antes que `PaymentConfirmed`.

Para eventos ao vivo, não precisamos de ordenação global. Os eventos `ViewerJoined` de diferentes usuários não têm relação causal. Usamos particionamento round-robin para maximizar paralelismo.

**Lição**: Não use ordenação global por padrão. Use partition keys que reflitam requisitos reais de causalidade.

## A Lição

A arquitetura orientada a eventos não se trata de escolher Kafka ou Firebase. Trata-se de projetar sistemas onde os componentes se comunicam através de canais duráveis, observáveis e escaláveis em vez de chamadas diretas frágeis.

A combinação de Kafka para confiabilidade backend e Firebase para alcance de cliente provou ser resiliente através de 150K usuários concurrentes, 1.9M dispositivos ativos e operações 24/7. Os eventos carregam o sistema para a frente — uma mensagem de cada vez.
