---
title: "Gerenciando 150K Usuários Concurrentes: Estratégias de Concorrência para Eventos ao Vivo"
date: "2025-08-28"
category: "Enterprise Architecture"
excerpt: "Como o MEGA GO sobreviveu ao Festival de Viña 2026 com 150K usuários concurrentes — as decisões arquitetônicas, metodologia de load testing e modos de falha que definiram o evento."
tags: ["Concorrência", "Load Testing", "CDN", "Auto-scaling", "OTT"]
lang: "pt"
---

A diferença entre uma plataforma que funciona a 1,000 usuários e uma que funciona a 150,000 usuários não é otimização incremental. É uma categoria diferente de arquitetura.

Este artigo descreve como o MEGA GO lidou com 150,000 espectadores concurrentes durante o Festival de Viña 2026 — o evento de música ao vivo maior do Chile — sem um único minuto de downtime. As estratégias descritas aplicam-se a qualquer sistema de alta concorrência: plataformas OTT, vendas flash de e-commerce, sistemas de ticketing e gaming online.

## O Perfil do Evento

O Festival de Viña tem um padrão de tráfego único:

| Fase | Duração | Comportamento de Usuário | Características de Carga |
|------|---------|--------------------------|--------------------------|
| **Pré-evento** | 60 min | Usuários abrem app, navegam, setam lembretes | Rampa estável, aquecimento de cache |
| **Abertura** | 5 min | 80% dos espectadores se unem simultaneamente | Rajada extrema, spike de autenticação |
| **Streaming ao vivo** | 180 min | Visualização sustentada, chat, sharing social | Carga alta sustentada, dependente de CDN |
| **Artista principal** | 15 min | Novos espectadores se unem, existentes ficam | Maior contagem concurrente |
| **Encerramento** | 10 min | Saída massiva, solicitações de replay | Encerramento de conexões, escrituras a storage |

O pico de 150K concurrentes ocorreu durante a apresentação do artista principal — 15 minutos de carga sustentada que testou cada camada da arquitetura.

## Estratégia 1: CDN como Defesa Principal

A decisão arquitetônica mais importante para eventos ao vivo é simples: **nunca sirva vídeo da origem**.

Durante o Festival de Viña:
- 94% dos segmentos de vídeo foram servidos do cache edge do CDN
- 6% alcançaram a origem (cache misses para novas regiões edge)
- 0% do tráfego de vídeo atingiu os servidores de aplicação

A arquitetura CDN usa uma estratégia de múltiplos tiers:

**Tier 1 — Nós Edge**: 50+ pontos de presença através da América Latina. Cada nó cacheia segmentos HLS (arquivos .ts) por 24 horas e arquivos de manifesto (.m3u8) por 30 segundos.

**Tier 2 — Origin Shield**: Uma camada de cache entre nós edge e o servidor de streaming origem. Quando um nó edge falha, solicita do Origin Shield em vez da origem diretamente. Isso reduz a carga da origem em 60% adicional.

**Tier 3 — Origem**: O servidor de streaming real (Huawei Cloud Media) que gera streams HLS do encoding ao vivo.

**Decisão Chave**: Pré-posicionar conteúdo em nós edge antes do evento. Empurramos os primeiros 5 minutos de segmentos do evento para todos os nós edge 2 horas antes do início, assegurando zero cache misses durante a rajada de abertura.

## Estratégia 2: Autenticação no Edge

A rajada de 5 minutos de abertura cria uma avalanche de autenticação. 120,000 usuários se autenticam simultaneamente, cada um requerendo:
1. Validação de token OAuth2 contra Keycloak
2. Verificação de direitos (este usuário tem acesso a eventos ao vivo?)
3. Solicitação de licença DRM
4. Inicialização de sessão

A 1,500 RPS, o Keycloak pode lidar com a carga. Mas a 25,000 RPS durante a rajada, colapsaria.

Nossa solução é **pré-validação de tokens**:
- 30 minutos antes do evento, o app mobile refresca tokens e direitos em segundo plano
- Os tokens são cacheados no Redis com TTL de 15 minutos
- Durante a rajada, o CDN valida assinaturas JWT localmente usando chaves públicas cacheadas
- Apenas 5% das solicitações alcançam o Keycloak (usuários com tokens expirados)

Isso reduziu o tráfego de autenticação de 120,000 solicitações para 6,000 solicitações — bem dentro da capacidade do Keycloak.

## Estratégia 3: Auto-scaling com Aquecimento Preditivo

O auto-scaling padrão reage a métricas: quando CPU > 70%, adicionar instâncias. Para eventos ao vivo, o scaling reativo é demasiado lento. Para quando as métricas detectam carga, os usuários já estão experimentando buffering.

Usamos **scaling preditivo**:

1. **Baseline histórico**: O Festival de Viña 2025 picou em 95K usuários. Projetamos 150K baseados em gasto de marketing e crescimento de instalações do app.

2. **Pré-scaling**: 2 horas antes do evento, provisionamos:
   - Capacidade CDN: 200% do pico projetado
   - Servidores API: 300% da capacidade normal
   - Conexões de banco de dados: 250% do pool normal
   - Cluster Redis: Adicionamos 2 réplicas de leitura

3. **Scaling programado**: Usando políticas de scaling programado da Huawei Cloud, instâncias são adicionadas em T-60 minutos, T-30 minutos, e T-5 minutos — coincidindo com o padrão de rampa de tráfego.

4. **Fallback reativo**: Se a carga real excede as projeções em 20%, o auto-scaling reativo entra em ação com provisionamento de instâncias em 2 minutos.

**Decisão Chave**: Sobre-provisionar em vez de otimizar. O custo de capacidade ociosa por 4 horas é insignificante comparado com o custo de um evento ao vivo falhado.

## Estratégia 4: Degradação Graciosa

Quando a carga excede a capacidade, o sistema deve degradar graciosamente em vez de falhar catastroficamente. Definimos quatro níveis de degradação:

**Nível 0 — Normal**: Todas as funcionalidades operacionais. 100% qualidade de vídeo, chat em tempo real, sharing social.

**Nível 1 — Chat desabilitado**: Quando os usuários concurrentes excedem 100K, o Firebase Realtime Database throttlea. O chat é desabilitado com um banner: "Chat pausado por alta demanda. Aproveite o show!"

**Nível 2 — Redução de qualidade**: Quando os nós edge do CDN se aproximam da capacidade, os clientes são instruídos a mudar de HD para SD. Isso reduz a largura de banda por usuário em 60% e aumenta a capacidade do CDN em 2.5x.

**Nível 3 — Fallback regional**: Se um nó regional do CDN falha, o tráfego é roteado para o nó saudável mais próximo com ligeiramente maior latência. Os usuários experimentam uma pausa de buffering de 2-3 segundos, depois a reprodução normal se reanuda.

**Nível 4 — Modo emergência**: Se o servidor de streaming origem falha, servimos os últimos 30 segundos de conteúdo bufferizado em loop enquanto os engenheiros restauram a origem. Isso nunca foi necessário em produção.

**Decisão Chave**: As decisões de degradação são automatizadas baseadas em métricas em tempo real, não manuais. O tempo de reação humano é demasiado lento para eventos ao vivo.

## Estratégia 5: Load Testing com Fidelidade de Produção

Testamos a capacidade do Festival de Viña usando k6 com um script de test que imitava comportamento de usuário real:

```javascript
export const options = {
  stages: [
    { duration: '60m', target: 50000 },   // Rampa pré-evento
    { duration: '5m', target: 150000 },    // Rajada de abertura
    { duration: '180m', target: 150000 },  // Carga sustentada
    { duration: '15m', target: 150000 },   // Artista principal
    { duration: '10m', target: 0 },        // Saída massiva
  ],
};
```

A infraestrutura de test refletia a produção:
- Mesma configuração de CDN (domínio diferente)
- Mesmos servidores API (cluster isolado)
- Mesmas bases de dados (apenas réplicas de leitura)
- Mesmos servidores de licença DRM (ambiente de staging)

**Achado Crítico**: A 140K usuários concurrentes, descobrimos que o pool de conexões da MDS API ao MongoDB estava se esgotando. O tamanho do pool era 100 conexões; a 140K usuários, as queries concurrentes ao catálogo excediam 100. Aumentamos o pool para 500 e adicionamos connection pooling na camada de aplicação (estilo PgBouncer para MongoDB).

Sem este test, o evento de produção teria falhado.

## Os Modos de Falha Que Não Vimos

Cada evento ao vivo tem surpresas. O Festival de Viña teve duas:

**Surpresa 1 — Mudança geográfica**: 40% dos espectadores estavam em regiões que não havíamos visto em eventos anteriores (norte do Chile, áreas rurais). Estas regiões tinham nós edge do CDN menores que não foram pré-aquecidos. Vimos uma taxa de cache miss de 12% nestas regiões vs. 2% em Santiago. No próximo evento, pré-aquecemos todos os nós independentemente de padrões históricos.

**Surpresa 2 — Diversidade de dispositivos**: 8% dos espectadores usaram dispositivos que não havíamos testado (TVs Samsung antigas, caixas Android genéricas). Estes dispositivos tinham diferentes capacidades DRM e suporte de formatos de stream. Adicionamos lógica de detecção de dispositivo e fallback de formato durante o evento — uma mudança arriscada que requiriu deployment de emergência. No próximo evento, testamos os 50 modelos de dispositivos principais em vez dos 20 principais.

## O Custo da Escala

Executar um evento ao vivo a 150K usuários concurrentes tem custos de infraestrutura reais:

| Componente | Dia Normal | Festival de Viña | Incremento |
|------------|-----------|------------------|------------|
| Largura de banda CDN | 15 TB/dia | 850 TB/dia | 57x |
| Servidores API | 6 instâncias | 24 instâncias | 4x |
| Banco de dados | 2 réplicas | 6 réplicas | 3x |
| Redis | 3 nós | 5 nós | 1.7x |
| Licenças DRM | 50K/dia | 180K/dia | 3.6x |
| **Custo total** | $1,200/dia | $48,000/dia | 40x |

O custo de $48,000 do dia do evento é recuperado através de receitas publicitárias ($120K) e novas assinaturas ($85K) geradas durante o evento. Mas o modelo de custos requer forecasting preciso — sobre-provisionar em 50% e a rentabilidade desaparece.

## A Lição

A arquitetura de alta concorrência não se trata de lidar com carga média. Trata-se de lidar com carga pico enquanto se degrada graciosamente quando as suposições falham.

As estratégias que importam:
1. **CDN-first**: Sirva tudo dos nós edge
2. **Pré-validar auth**: Reduza autenticação em tempo real ao mínimo
3. **Scaling preditivo**: Provisione antes do evento, não durante
4. **Degradação graciosa**: Defina quais funcionalidades se desligam e em que ordem
5. **Testing com fidelidade de produção**: Teste com padrões reais de comportamento de usuário, não carga sintética

O Festival de Viña 2026 provou que estas estratégias funcionam. O Festival de Viña 2027 testará se aprendemos com as surpresas.
