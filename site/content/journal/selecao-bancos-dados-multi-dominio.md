---
title: "Seleção de Bancos de Dados para Plataformas Multi-Domínio: SQL, NoSQL ou Ambos?"
date: "2025-07-22"
category: "Enterprise Architecture"
excerpt: "Como escolhemos PostgreSQL, MongoDB, Redis, Neo4j e Firestore para diferentes domínios na plataforma MEGA GO — e por que usar um único banco de dados para tudo geralmente é a resposta errada."
tags: ["Bancos de Dados", "PostgreSQL", "MongoDB", "Redis", "Neo4j", "Arquitetura"]
lang: "pt"
---

O erro mais comum de banco de dados que vejo em arquitetura de plataformas não é escolher o banco de dados errado. É escolher um único banco de dados para tudo, depois forçar cada caso de uso a se encaixar em seu modelo.

O MEGA GO usa cinco bancos de dados diferentes. Cada um serve um domínio específico onde seu modelo de dados provee uma vantagem competitiva. Este artigo explica os critérios de seleção, trade-offs e lições operacionais de executar uma arquitetura de persistência políglota em escala.

## Marco Teórico: CAP e PACELC

Antes de escolher um banco de dados, é necessário entender quais garantias um sistema distribuído pode oferecer. O teorema CAP estabelece que na presença de uma partição de rede, só se podem garantir duas de três propriedades: consistência (C), disponibilidade (A) e tolerância a partições (P). PACELC estende este marco: em operação normal (sem partições), deve-se escolher entre latência (L) e consistência (C).

| Banco de dados | CAP / PACELC | Implicação para o MEGA GO |
|---|---|---|
| PostgreSQL | CP / EC | Consistência forte para pagamentos; réplicas de leitura com atraso aceitável |
| MongoDB | CP / EC | Consistência configurável; sharding para disponibilidade |
| Redis | AP / EL | Disponibilidade e baixa latência; consistência eventual em cluster |
| Neo4j | CP / EC | Consistência em transações de grafo; travessias determinísticas |
| Firestore | AP / EL | Alta disponibilidade e sincronização em tempo real |

Esta matriz guia cada decisão. O catálogo de conteúdo pode tolerar consistência eventual porque um usuário não nota se uma nova série aparece 500 ms depois em uma réplica. Os pagos não podem: a consistência forte é inegociável.

## O Panorama de Bancos de Dados

| Banco de Dados | Domínio | Modelo de Dados | Por Que Foi Escolhido |
|----------------|---------|-----------------|----------------------|
| **PostgreSQL** | Assinaturas, pagamentos, perfis de usuário | Relacional (ACID) | Consistência financeira, queries complexos |
| **MongoDB** | Catálogo de conteúdo, categorias, metadados | Documento (BSON) | Esquema flexível para tipos de mídias diversos |
| **Redis** | Sessões, rate limits, feature flags | Chave-valor (em memória) | Acesso sub-milissegundo, alto throughput |
| **Neo4j** | Grafo de identidade, relações cross-dispositivo | Grafo (nós/arestas) | Travessia de relações, resolução de identidade |
| **Firestore** | Configuração, testes A/B, sync em tempo real | Documento (NoSQL) | Integração nativa Firebase, listeners em tempo real |

## PostgreSQL: O Sistema de Registro

O PostgreSQL é nosso sistema de registro para qualquer coisa que envolva dinheiro ou conformidade legal:

- **Contas de usuário**: Data de registro, email, flags de consentimento legal
- **Assinaturas**: Tipo de plano, ciclo de faturamento, datas de renovação, razão de cancelamento
- **Pagamentos**: IDs de transação, montantes, moedas, métodos de pagamento, estado de reembolso
- **Direitos**: Que conteúdo cada usuário pode acessar, até quando

Estas tabelas requerem transações ACID. Quando um usuário faz upgrade de Free para Premium, três operações devem atomicamente ter sucesso: cobrar o método de pagamento, estender o direito, e atualizar o registro de assinatura. Se algum passo falha, toda a transação faz rollback.

**Decisão Chave**: PostgreSQL 14 com réplicas de leitura para queries de analytics. As operações de escrita vão para o primário; as queries de reporting intensivas vão para as réplicas, prevenindo que cargas analíticas impactem a latência de transações.

**Lição Operacional**: Particione tabelas grandes por data. A tabela `payments` cresceu para 50M linhas em 18 meses. O particionamento mensal reduziu o tamanho de índice em 80% e melhorou o desempenho de queries em 3x.

### Por que não Oracle nem SQL Server?

Avaliamos Oracle e SQL Server em 2019. Ambos ofereciam características empresariais superiores, mas o custo de licenciamento para um OTT em crescimento era proibitivo. O PostgreSQL cobria 100% de nossos requisitos ACID com custo zero de licença e uma comunidade ativa na LATAM. A capacidade de extensão com PostGIS (para geolocalização de eventos ao vivo) e pg_stat_statements (para análise de queries lentas) foram diferenciadores decisivos.

## MongoDB: O Catálogo de Conteúdo

O conteúdo de mídias não se encaixa bem em esquemas relacionais. Um filme tem campos diferentes que um episódio de série, que tem campos diferentes que um evento ao vivo, que tem campos diferentes que um clip de notícias.

O modelo de documentos do MongoDB permite que cada tipo de conteúdo tenha seu próprio esquema:

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

A mesma coleção pode armazenar filmes, séries, episódios, eventos ao vivo e clips — cada um com os campos relevantes para seu tipo. Sem migrações de esquema quando se adiciona um novo tipo de conteúdo.

**Decisão Chave**: MongoDB 6 com sharding por hash de `contentId`. O catálogo serve 10K+ RPS durante o pico; o sharding distribui a carga através de três replica sets.

**Lição Operacional**: Indexe queries compostos cuidadosamente. Nosso índice inicial em `{type: 1, genre: 1}` funcionou bem para navegação filtrada mas falhou para busca de texto. Adicionar um índice de texto em `{title: "text", description: "text"}` reduziu a latência de busca de 800ms para 45ms.

### Comparação com DynamoDB

O Amazon DynamoDB foi avaliado como alternativa para o catálogo. Oferece escalamento horizontal automático e latência previsível, mas o modelo de preços por capacidade provisionada gerou custos imprevisíveis durante picos de eventos ao vivo (como a final de um reality show). O MongoDB nos deu controle de custo com infraestrutura própria e um modelo de consulta mais rico para agregações complexas de catálogo.

## Redis: A Camada de Velocidade

O Redis existe porque os milissegundos importam. Três casos de uso justificam sua complexidade operacional:

**Cache de Sessão**: Tokens de acesso OAuth2 com TTL de 5 minutos. Validar cada chamada de API contra Keycloak requereria 1.500 RPS de tráfego SSO. O Redis reduz isso para ~150 RPS (apenas cache misses).

**Rate Limiting**: Contadores de janela deslizante por usuário por API. Implementados como sorted sets do Redis com buckets de 1 minuto. Previne abuso sem escrituras a banco de dados.

**Feature Flags**: Firebase Remote Config cacheado com TTL de 15 minutos. Sem Redis, 1.9M dispositivos ativos martelariam Firestore em cada cold start.

**Decisão Chave**: Redis Cluster com 3 masters e 3 réplicas. Cada master lida com ~40K ops/seg; o cluster sustenta 120K ops/seg agregado.

**Lição Operacional**: Monitore a fragmentação de memória. O uso de memória do Redis cresceu para 85% antes de percebermos que atualizações frequentes de TTL estavam causando fragmentação. Mudar de `volatile-ttl` para evicção `allkeys-lru` e executar `MEMORY PURGE` semanalmente estabilizou a memória em 60%.

### Alternativas avaliadas

O Memcached foi descartado porque carece de persistência e estruturas de dados ricas (sorted sets, hyperloglogs). O Valkey (fork de Redis open-source pela AWS) está sendo monitorado como alternativa futura para reduzir dependência da Redis Ltd.

## Neo4j: O Grafo de Identidade

A escolha de banco de dados mais interessante em nossa arquitetura é o Neo4j. Ele resolve um problema que bancos de dados relacionais lidam pobremente: **resolução de identidade através de dispositivos e contas**.

Na Super App MEGA, um único usuário poderia ter:
- Um telefone (Android) com histórico de navegação anônima
- Uma TV (Android TV) com perfil familiar
- Um tablet (iPad) com perfil pessoal
- Um navegador web com perfil de trabalho
- Sessões anônimas antes do login

O Neo4j modela estes como um grafo:

```cypher
(User:registered {email: "user@example.com"})
  -[:HAS_DEVICE]-> (Device:android {id: "device-123"})
  -[:HAS_PROFILE]-> (Profile:anonymous {id: "anon-456"})
  -[:WATCHED]-> (Content:movie {id: "movie-789"})
```

Quando o usuário faz login em um novo dispositivo, a travessia do grafo encontra todos os perfis anônimos relacionados e migra seus dados. Esta operação no PostgreSQL requereria 6+ JOINs através de tabelas com foreign keys complexas. No Neo4j, é uma única query Cypher com travessia de 2 saltos.

**Decisão Chave**: Neo4j 5 Community Edition. O grafo é relativamente pequeno (~50M nós, ~200M relações) mas a complexidade de query é alta. O Community Edition lida com a carga com uma única instância e backups diários.

**Lição Operacional**: Bancos de dados de grafo não são de propósito geral. Use-os apenas quando as relações são o padrão de query primário. Inicialmente tentamos armazenar metadados de conteúdo no Neo4j e nos arrependemos — as queries Cypher para filtragem simples foram mais lentas que o find() do MongoDB por uma ordem de grandeza.

## Firestore: O Armazém de Configuração

O Firestore serve necessidades de configuração em tempo real que não justificam overhead operacional:

- **Variantes de testes A/B**: Qual versão de UI cada usuário vê
- **Configuração remota**: Feature toggles, banners de manutenção, versões mínimas de app
- **Analytics em tempo real**: Contagens de visualizações agregadas durante eventos ao vivo

A integração nativa com Firebase significa que clientes móveis e web podem escutar mudanças de configuração em tempo real sem polling.

**Decisão Chave**: Firestore em modo Datastore para preços consistentes. O preço por documento do modo nativo tornou-se imprevisível em escala.

## Arquiteturas Multi-Banco de Dados em Produção

Nem todas as interações são simples leituras e escrituras em um único banco de dados. Três padrões arquitetônicos emergem quando múltiplos bancos de dados colaboram:

### CQRS (Command Query Responsibility Segregation)

Separamos operações de escrita e leitura em modelos de dados diferentes. As escrituras vão para o PostgreSQL (modelo transacional); as leituras complexas (busca de conteúdo) consomem um índice otimizado. No MEGA GO, o catálogo se escreve no MongoDB mas a busca de texto consome um índice denormalizado gerado por um pipeline de mudanças.

### Padrão Strangler Fig

Migramos o catálogo de conteúdo do PostgreSQL para o MongoDB em 2021 com zero downtime: dual-write para ambos os bancos de dados, verificar consistência, mudar leituras, aposentar PostgreSQL. Este padrão mitiga o risco de migração permitindo rollback em cada etapa.

### Cache como Camada de Proteção

O Redis não é apenas um cache: é uma barreira de proteção que absorve picos de tráfego antes de chegarem aos bancos de dados persistentes. Durante o lançamento de um evento ao vivo com 500K usuários simultâneos, o Redis absorveu 95% das leituras de configuração, deixando Firestore e MongoDB operando dentro de seus limites normais.

## O Trade-off da Persistência Políglota

Executar cinco bancos de dados aumenta a complexidade operacional:
- Cinco estratégias de backup
- Cinco dashboards de monitoramento
- Cinco ciclos de upgrade
- Cinco conjuntos de expertise na equipe

A alternativa — um banco de dados para tudo — força cada caso de uso em um modelo subótimo. Tentamos PostgreSQL para o catálogo de conteúdo em 2020. As migrações de esquema para novos tipos de conteúdo levavam semanas. O desempenho de queries para categorias hierárquicas degradou-se à medida que o catálogo cresceu.

A abordagem políglota custa mais em operações mas se paga em desempenho, flexibilidade e velocidade de desenvolvimento.

## Lições da Indústria

As decisões do MEGA GO não são únicas. Comparando com plataformas de referência:

| Plataforma | Stack de bancos de dados | Lição aplicável |
|---|---|---|
| **Netflix** | Cassandra + EVCache + Elasticsearch + MySQL | Cassandra para dados que crescem por usuário (histórico); MySQL para transações financeiras |
| **Uber** | MySQL + Cassandra + Redis + Elasticsearch | Separar dados transacionais de dados de telemetria; Cassandra para escrituras massivas de localização |
| **Amazon** | DynamoDB + Aurora + Elasticsearch | DynamoDB para catálogo em escala; Aurora para transações com consistência inegociável |
| **Twitter/X** | Manhattan + MySQL + Redis | Bancos de dados próprios quando os requisitos são extremamente específicos |

A convergência é clara: nenhuma plataforma em escala usa um único banco de dados. A persistência políglota não é moda — é consequência da especialização.

## Checklist de Seleção

Antes de adotar um novo banco de dados em produção, validamos estes critérios:

**Análise de dados**
- Os dados são estruturados, semi-estruturados ou não estruturados?
- Há relações complexas entre entidades?
- O esquema é estável ou evolui rapidamente?
- Qual volume de dados se espera? (GB, TB, PB)

**Padrões de acesso**
- É read-heavy ou write-heavy?
- As consultas são simples (por chave) ou complexas (joins, agregações)?
- É necessária busca de texto completo?
- Qual latência é aceitável? (<1ms, <10ms, <100ms, <1s)

**Requisitos não funcionais**
- É necessário ACID completo ou consistência eventual é suficiente?
- Qual é o RPO/RTO requerido?
- É necessário escalamento horizontal ou vertical?
- Qual é o orçamento de infraestrutura?

**Validação prática**
- Criar POC com dataset representativo
- Executar benchmarks de carga (usamos k6 para APIs, YCSB para NoSQL)
- Simular falhas e recovery
- Medir latência p99 e throughput

## O Framework de Seleção

Ao avaliar um novo banco de dados, usamos esta árvore de decisões:

1. **Envolve dinheiro ou conformidade legal?** → PostgreSQL (ACID requerido)
2. **O esquema muda frequentemente?** → MongoDB (documentos flexíveis)
3. **Requer acesso sub-milissegundo?** → Redis (em memória)
4. **As relações são o padrão de query primário?** → Neo4j (travessia de grafo)
5. **Precisa de sync em tempo real com cliente?** → Firestore (integração Firebase)
6. **Não se encaixa em nenhuma categoria acima?** → Re-avaliar o caso de uso

### Matriz de seleção rápida

| Caso de uso | SQL | Documental | Key-Value | Grafo | Time-Series | Search |
|---|---|---|---|---|---|---|
| Pagamentos / assinaturas | ⭐ | | | | | |
| Catálogo de conteúdo | | ⭐ | | | | ⭐ |
| Cache / sessões | | | ⭐ | | | |
| Relações de usuário | | | | ⭐ | | |
| Logs / métricas | | | | | ⭐ | ⭐ |
| Configuração em tempo real | | ⭐ | | | | |

## A Lição

A seleção de banco de dados não é uma decisão de uma única vez. É uma conversa arquitetônica contínua. À medida que os domínios evoluem, o banco de dados que os serviu bem no ano um pode tornar-se uma restrição no ano três.

A chave é reconhecer quando um domínio superou seu banco de dados — e ter a maturidade operacional para migrar sem downtime. Migramos o catálogo de conteúdo do PostgreSQL para o MongoDB em 2021 com zero downtime usando o padrão Strangler Fig: dual-write para ambos os bancos de dados, verificar consistência, mudar leituras, aposentar PostgreSQL.

A persistência políglota não se trata de usar muitos bancos de dados por complexidade. Trata-se de escolher o modelo de dados correto para cada domínio — e aceitar o custo operacional como o preço do desempenho.

> "O melhor banco de dados é aquele que sua equipe conhece bem e que resolve o problema atual sem criar problemas futuros."
