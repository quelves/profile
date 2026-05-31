---
title: "Estratégias de Cache para Plataformas de Mídia de Alta Concorrência"
date: "2025-05-12"
category: "Enterprise Architecture"
excerpt: "Uma hierarquia de cache testada em produção para plataformas OTT: desde cache HTTP cliente e banco de dados Room no dispositivo, passando por Redis e CDN no edge, até índices em memória no cluster de busca."
tags: ["Cache", "Redis", "CDN", "Performance", "OTT"]
lang: "pt"
---

O cache é a otimização de desempenho mais efetiva em plataformas de mídia — e a fonte mais comum de bugs sutis. Este artigo descreve a hierarquia de quatro camadas de cache que usamos na Megamedia, desde o dispositivo do usuário até o servidor de origem, e as decisões que determinam o que vai onde.

## Camada 1: Cache HTTP do Cliente

A primeira linha de defesa é o cache integrado do OkHttp no dispositivo Android. Cada resposta de API inclui headers de cache-control que indicam ao cliente por quanto tempo pode reutilizar a resposta sem revalidar:

```
Cache-Control: max-age=3600, stale-while-revalidate=86400
```

Isso significa:
- Durante a primeira hora, a resposta é servida do cache de disco sem nenhuma solicitação de rede
- Durante as próximas 24 horas, a resposta stale é servida imediatamente enquanto uma solicitação em segundo plano a refresca

Para o catálogo de conteúdo do MEGA GO — que muda apenas quando novo conteúdo é publicado — isso reduz a carga de API em ~70% durante navegação normal. A API de catálogo serve 10K+ RPS no pico; com cache do cliente, apenas ~3K alcançam a origem.

**Decisão chave**: Use `stale-while-revalidate` agressivamente para dados imutáveis (metadados de conteúdo, árvores de categoria) e conservadoramente para dados mutáveis (assinaturas de usuário, histórico de visualização).

## Camada 2: Banco de Dados Local (Room)

Nem todos os dados encaixam no modelo de solicitação/resposta HTTP. As preferências de usuário, histórico de visualização, metadados de conteúdo baixado e favoritos requerem armazenamento local estruturado.

O MEGA GO usa Room com a seguinte estratégia de cache:

- **Write-through**: Cada ação de usuário escreve para Room imediatamente, depois sincroniza com a API remota em segundo plano
- **Read-first**: Cada leitura atinge Room primeiro; se os dados estiverem stale (>5 minutos para assinaturas, >1 hora para catálogo), um refresh em segundo plano é ativado
- **Eviction**: Evicção LRU com limite de 100MB; os metadados de conteúdo baixado nunca são evictados

Este padrão permite que o app funcione completamente offline. Um usuário em um voo pode navegar o catálogo, gerenciar favoritos e inclusive enfileirar downloads — tudo usando dados de Room. Quando a conectividade retorna, a fila de sync reconcilia mudanças locais com o servidor.

**Decisão chave**: Room não é apenas um cache. É o armazém de dados primário para o cliente, com a API remota tratada como um target de sincronização.

## Camada 3: Redis (Cache Edge)

Na camada de infraestrutura, Redis serve três roles de cache distintos:

**Cache de Sessão**: Tokens OAuth2 e direitos de usuário. Com 150K usuários concurrentes durante eventos ao vivo, validar cada solicitação contra Keycloak sobrecarregaria o servidor SSO. Redis cacheia decisões de direitos com TTL de 5 minutos, reduzindo a carga de SSO em ~90%.

**Rate Limiting**: Contadores de janela deslizante por usuário e por API. Redis armazena contadores com resolução de 1 minuto, prevenindo abuso sem escrituras a banco de dados.

**Cache de Feature Flags**: Firebase Remote Config é cacheado no Redis com TTL de 15 minutos. Isso previne que o app mobile martelhe Firestore em cada cold start — um problema real com 1.9M instalações ativas.

**Decisão chave**: Os TTLs do Redis devem ser mais curtos que sua tolerância para dados stale. Um direito stale de 5 minutos é aceitável; um estado de pagamento stale de 5 minutos não é.

## Camada 4: CDN (Content Delivery Network)

Para conteúdo de vídeo, o CDN é o cache. O MEGA GO usa uma estratégia multi-CDN:

- **CDN Primário**: Huawei Cloud CDN para América Latina (menor latência para usuários chilenos)
- **CDN Failover**: AWS CloudFront para alcance global e redundância
- **Origin Shield**: Uma camada de cache entre CDNs e origem que absorve cache misses

Os segmentos de vídeo (arquivos HLS .ts, DASH .m4s) são cacheados em nós edge do CDN por 24 horas. Os arquivos de manifesto (.m3u8, .mpd) são cacheados por 30 segundos com stale-while-revalidate — curto o suficiente para permitir inserção de anúncios mid-stream, longo o suficiente para prevenir sobrecarga da origem.

Durante o Festival de Viña 2026, o CDN serviu 94% do tráfego de vídeo do cache edge. Apenas 6% das solicitações alcançaram a origem — a diferença entre sobreviver o evento e uma falha em cascata.

**Decisão chave**: O TTL de cache para segmentos de vídeo deve coincidir com sua frequência de atualização de conteúdo. Eventos ao vivo precisam de TTLs de manifesto curtos; catálogos VOD podem usar TTLs de segmento longos.

## O Problema de Invalidação de Cache

O problema mais difícil em ciências da computação não é nomear coisas ou invalidar cache. É **saber qual camada de cache está stale**.

Quando um produtor de conteúdo atualiza o título de um filme, a mudança se propaga através de:
1. PostgreSQL (origem) → 2. Cache OTT API → 3. Cache Redis edge → 4. Cache CDN → 5. Cache HTTP cliente → 6. Banco de dados Room

Cada camada tem seu próprio TTL e mecanismo de invalidação. Sem uma estratégia de invalidação coordenada, usuários veem dados inconsistentes através de dispositivos e sessões.

Nossa solução é **invalidação dirigida por eventos**:
- Atualização de conteúdo → evento Kafka → workers de invalidação de cache → purge de Redis + chamadas à API de purge de CDN
- O app mobile recebe notificação push do Firebase → ativa refresh de cache local no próximo lançamento
- O app web usa WebSocket para receber mensagens de invalidação em tempo real

**Decisão chave**: Não confie apenas em TTL para dados mutáveis. Use eventos de invalidação explícitos para conteúdo que muda imprevisivelmente.

## As Métricas que Importam

A efetividade do cache é medida pela **taxa de hit** em cada camada:

| Camada | Taxa de Hit Objetivo | Atual (Pico) |
|--------|---------------------|--------------|
| HTTP Cliente | 60% | 73% |
| Room (leitura) | 80% | 85% |
| Redis | 85% | 91% |
| CDN (vídeo) | 90% | 94% |

Uma melhoria de 1% na taxa de hit do CDN economiza aproximadamente $2,000/mês em custos de egress da origem na nossa escala.

## A Lição

O cache não é uma otimização de desempenho que você adiciona depois. É uma dimensão arquitetônica que você projeta desde o dia um. Cada path de acesso a dados deve ter uma estratégia de cache: o que cachear, onde cachear, por quanto tempo manter, e como invalidar quando as coisas mudam.

A hierarquia — cliente → banco de dados local → cache edge → CDN — não é única de plataformas de mídia. Mas os stakes são mais altos quando um único cache miss durante um evento ao vivo pode cascatear em uma sobrecarga de origem que afeta milhões de espectadores.
