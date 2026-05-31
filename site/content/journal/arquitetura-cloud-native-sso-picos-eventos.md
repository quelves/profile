---
title: "Arquitetura Cloud-Native para SSO: Suportando 150K Usuários em Picos de Eventos"
date: "2025-09-10"
category: "Enterprise Architecture"
excerpt: "Como desenhamos o SSO da Megamedia sobre Kubernetes para suportar desde operação normal até 150K usuários simultâneos durante o Festival de Viña del Mar — e por que o autoscaling automático é a resposta errada para eventos ao vivo."
tags: ["Cloud-Native", "SSO", "Keycloak", "Kubernetes", "Escalabilidade", "Huawei Cloud"]
lang: "pt"
---

O Single Sign-On é a infraestrutura mais invisível e mais crítica de qualquer plataforma digital. Quando funciona, ninguém o menciona. Quando falha, nada mais funciona. Na Megamedia, o SSO do MEGA GO autentica 1.91 milhões de usuários ativos, e durante o Festival de Viña del Mar 2026 suportou 150.000 usuários simultâneos sem um único incidente de autenticação.

Este artigo não é um guia de Keycloak. É uma narrativa de decisões arquitetônicas cloud-native tomadas para converter um sistema de autenticação monolítico em uma plataforma que escala desde 150 RPS em uma terça-feira qualquer até 500 RPS de pico durante um evento massivo — e o faz de forma previsível, não reativa.

## O Problema: Quando o Login se Torna o Gargalo

Em 2024, o SSO da Megamedia rodava em duas máquinas virtuais estáticas. Funcionava bem para operação normal. Mas quando um evento esportivo gerava uma notificação push para 100.000 usuários simultâneos, o sistema colapsava em minutos. Não porque Keycloak fosse lento, mas porque a arquitetura subjacente não estava desenhada para picos de tráfego em ondas.

Os eventos ao vivo — esportivos ou culturais — não geram carga uniforme. Geram um padrão de ondas:

| Fase | Hora | O que acontece | Carga no SSO |
|---|---|---|---|
| **Pré-evento** | 19:30 | Deploy de configuração, pré-aquecimento | Baixa, preparatória |
| **Onda 1** | 20:00 | Push notification → login massivo | Pico de autenticação |
| **Show** | 20:30 | Usuários no CDN vendo conteúdo | Baixa (core livre) |
| **Onda 2** | 21:45 | Mudança de artista / intervalo | Refresh tokens |
| **Onda 3+** | 23:30, 01:30 | Mais transições | Picos repetidos |

A armadilha é que entre ondas a CPU cai a 25-35%. Um autoscaler reativo interpretaria isso como "sobram recursos" e reduziria pods. Quando chega a próxima onda, os pods não estão — e a Huawei Cloud leva 2 minutos para provisionar nós novos. Dois minutos em um pico de autenticação é uma eternidade.

## A Visão Estratégica: SSO como Plataforma, não como Aplicação

A decisão estratégica mais importante foi reconceitualizar o SSO. Não é uma aplicação que "precisamos manter ligada". É uma plataforma de identidade que deve operar com os mesmos padrões de confiabilidade que um sistema financeiro:

- **Disponibilidade objetivo**: 99,9% (máximo 8,7 horas de downtime ao ano)
- **RPO/RTO**: RPO = 0 (não perdemos sessões ativas), RTO < 5 minutos
- **Capacidade operativa**: De 150 RPS base até 5.000 RPS de pico com a mesma arquitetura
- **Custo previsível**: Não pagar por capacidade ociosa, mas também não arriscar uptime por economia

Esta visão levou a três decisões arquitetônicas fundamentais:

1. **Cloud-native desde o início**: Kubernetes StatefulSet na Huawei Cloud CCE, não VMs estáticas
2. **Configurações pré-calculadas por RPS**: Não ajustar recursos em calor durante um evento
3. **Anti-scaling durante eventos**: Pré-aquecer e manter, nunca reduzir entre ondas

## Arquitetura Cloud-Native: Kubernetes + Keycloak + Infinispan

A arquitetura atual roda sobre Huawei Cloud CCE (Kubernetes 1.31+) como um StatefulSet gerenciado por Helm:

```
Usuários → CDN/WAF → ELB Huawei → Traefik Ingress
                                    ↓
                        ┌───────────────────────┐
                        │   Kubernetes CCE      │
                        │  ┌─────┐ ┌─────┐     │
                        │  │KC-0 │ │KC-1 │ ... │  StatefulSet
                        │  │ 8c  │ │ 8c  │     │  (3-15 pods)
                        │  │17GB │ │17GB │     │
                        │  └──┬──┘ └──┬──┘     │
                        │     └───────┘        │
                        │    JGroups TCP        │
                        │  Infinispan Cache     │
                        │   CACHE_OWNERS=2      │
                        └──────────┬────────────┘
                                   ↓
                        ┌───────────────────────┐
                        │  RDS PostgreSQL 14    │
                        │  (4.200 conexões)     │
                        └───────────────────────┘
```

### Por que StatefulSet e não Deployment?

Keycloak com Infinispan distribuído requer identidade persistente de pod. Cada pod tem:
- Um nome estável (`keycloak-0`, `keycloak-1`)
- Uma vista de cluster JGroups que sobrevive reinícios
- Um fragmento de cache distribuída com `CACHE_OWNERS_COUNT=2`

Um Deployment recria pods com nomes aleatórios, quebrando a membresia do cluster. O StatefulSet permite que um pod que se reinicia re-ingresse ao cluster com a mesma identidade e recupere seu fragmento de cache.

### Discovery com DNS_PING

Em Kubernetes, os pods se descobrem entre si mediante `DNS_PING` sobre o headless service do Keycloak. Quando um pod novo arranca:

1. Resolve o DNS do serviço para obter IPs de peers existentes
2. Se une ao cluster JGroups via TCP (não UDP, por restrições de rede da Huawei Cloud)
3. Inicia state transfer desde os peers que têm seus dados
4. Uma vez sincronizado, começa a servir tráfego

O state transfer de 100.000 sessões leva 2-5 minutos. Esta é a razão fundamental do anti-scaling: não podemos permitir que um pod novo entre em calor durante uma onda.

## Dois Modos de Operação: OPT-V4 e FVM 2026

A operação do SSO se divide em duas configurações pré-calculadas, não em ajustes dinâmicos:

### OPT-V4: Operação Normal

| Parâmetro | Valor | Justificação |
|---|---|---|
| **Nó** | c6.3xlarge.2 (12 vCPU / 24 GB) | Ratio CPU/thread otimizado |
| **CPU/Pod** | 8 vCPU (67% do nó) | Margem de segurança 70% Huawei |
| **RAM/Pod** | 17 GB (70% do nó) | Evita alertas críticas da CCE |
| **JVM Heap** | ~8,5 GB (50% da RAM) | G1GC eficiente, pausas <200ms |
| **Undertow Workers** | 192 | Ratio 20:1, CPU-bound |
| **DB Pool** | 80 conexões/pod | 400 total a 5 pods, 90% margem BD |
| **Réplicas** | 3-15 (manual) | Escalado controlado |

OPT-V4 é a configuração base validada em 6 de março de 2026. Com 5 pods suportou 1.500 RPS em testes k6 com 0% de erros. Para operação normal (<150 RPS), roda com 3 pods. Para picos previsíveis, escala manualmente a 5-8.

### FVM 2026: Evento Massivo

| Parâmetro | Valor | Justificação |
|---|---|---|
| **Nó** | c7n.6xlarge.2 (24 vCPU / 48 GB) | Dobro de capacidade por pod |
| **CPU/Pod** | 16 vCPU (67% do nó) | 70% de segurança em flavor maior |
| **RAM/Pod** | 32 GB | 16 GB heap + 4 GB DirectMemory + margem |
| **JVM Heap** | 16 GB (50%) | G1GC <50ms pausas |
| **Undertow Workers** | 320 | Ratio 20:1 em 16 vCPU |
| **DB Pool** | 80 conexões/pod | 1.200 total a 15 pods, 71% margem |
| **Réplicas** | 5-15 (pré-aquecido) | Sem HPA durante evento |

FVM 2026 foi a configuração usada para o Festival de Viña del Mar 2026. Arrancou com 5 pods pré-aquecidos às 19:30 e escalou manualmente a 8 durante as ondas. Nunca se reduziu entre artistas.

### Matriz de Configuração por RPS

| Evento | Usuários Simultâneos | RPS Target | Configuração | Réplicas |
|---|---|---|---|---|
| Operação normal | ~5.000-10.000 | ≤1.500 | OPT-V4 | 3-5 |
| Partido regular | ~3.000-5.000 | 300-500 | 300/500 RPS | 3-4 |
| Copa del Rey | ~60.000 | 5.000 | Evento | 10 |
| Festival de Viña | ~150.000 | 3.000-4.000 | FVM 2026 | 5-15 |
| El Clásico | ~100.000 | 10.000 | 10K RPS | 20 |
| Champions Final | ~250.000 | 25.000 | 25K RPS | 30 |

> **Nota crítica**: Os RPS target são para tráfego real. Os testes k6 sintéticos geram 3-10x mais carga computacional por RPS devido ao churn de sessões. Um teste de 1.500 RPS em k6 equivale a aproximadamente 3.000-4.000 RPS de tráfego real.

## A Lição do CPU-Bound: Por que Reduzimos o Heap

Uma das decisões técnicas mais contraintuitivas foi reduzir o heap JVM de 24 GB a 16 GB (e em OPT-V4, de 18 GB a 8,5 GB).

Keycloak realiza operações criptográficas intensivas: PBKDF2 para hash de senhas, assinaturas JWT com RS256, validação de tokens em cada request. Estas operações saturam CPU antes de esgotar memória. O sistema é **CPU-bound, não memory-bound**.

| Configuração | Heap | G1GC Pauses | Startup | Throughput |
|---|---|---|---|---|
| OPT-V3 (anterior) | 18 GB | 200-400ms | 8-10 min | Bom |
| **OPT-V4** | **8,5 GB** | **<200ms** | **5-7 min** | **Ótimo** |
| FVM 2026 | 16 GB | <50ms | 5-7 min | Ótimo |

Com heap mais pequeno:
- G1GC coletas são mais frequentes mas mais curtas
- O startup do pod é mais rápido (menor inicialização de heap)
- Menor pressão de memória reduz risco de OOM Killer
- A CPU liberada se destina a threads de cálculo criptográfico

A regra de ouro que emergiu: **heap = 50% da RAM atribuída**, nunca mais. O resto se reserva para DirectMemory (buffers NIO do Undertow), caches nativas do Infinispan, e o sistema operativo.

## O Padrão de Ondas: Anti-Scaling como Estratégia

Durante anos, a ortodoxia cloud-native pregou: "escale automaticamente conforme demanda". Para eventos ao vivo, isto é perigoso. A demanda entre ondas é um vale que mata.

```
19:30 ── Pré-aquecimento: 5 pods fixos, HPA desativado
20:00 ── ONDA 1: CPU 25% → 85% (login massivo)
20:30 ── Show: CPU 85% → 25% (usuários no CDN)
        ❌ HPA diria "sobram pods" → scale down
        ✅ Nós dizemos "manter quente"
21:45 ── ONDA 2: CPU 25% → 75% (refresh tokens)
        ✅ Pods já estão, sem delay de provisioning
```

### Timeline Operativo FVM 2026

| Hora | Ação | Pods | HPA |
|---|---|---|---|
| 19:30 | Pré-aquecimento | 5 | Desativado |
| 19:45 | Validação pós-deploy | 5 | Desativado |
| 20:00 | Início evento | 5-8 | Desativado |
| 20:00-03:00 | Evento ativo | 5-15 (manual) | Desativado |
| 03:00 | Fim evento | 8 | Desativado |
| 03:30 | Cooldown | 8→5→3 | Reativado gradual |

O custo de manter 8 pods ociosos entre ondas é insignificativamente menor que o custo de reputação de usuários que não podem autenticar porque o sistema está provisionando nós.

## Métricas de Produção: A Falácia do Fator 3.2x

Em fevereiro de 2026, antes do Festival de Viña, executamos testes de carga k6 que reportaram 1.600 RPS pico com 2.000 VUs. A primeira interpretação foi: "temos fator de segurança 3.2x sobre os 500 RPS esperados". Esta conclusão era matematicamente correta e operacionalmente perigosa.

### Por que os testes sintéticos não correlacionam

| Dimensão | Teste k6 | Tráfego Real | Diferença |
|---|---|---|---|
| Churn de sessões | Login→logout cada 5s | Login 1x cada 3-7 dias | **225x mais intensivo** |
| Think time | 1-2 segundos | Minutos entre ações | **36x mais denso** |
| Token refresh | Cada 4 segundos | Cada 30 minutos | **450x mais frequente** |
| CPU por RPS | ~50% estimado | 5% medido | **10x mais eficiente** |

Um usuário real gera ~2 operações de autenticação por hora (login + refresh ocasional). Um VU de k6 gerava 450 operações de auth/hora. O teste media throughput sintético, não capacidade de usuários reais.

### Métricas Reais do Festival de Viña 2026

| Métrica | Valor medido |
|---|---|
| **Usuários simultâneos** | 150.000 |
| **RPS pico real** | ~500 RPS |
| **CPU durante pico** | ~5% |
| **Latência P95** | 14,5 ms |
| **Error rate** | 0,00% |
| **Incidentes** | 0 |

O sistema operou a 5% de CPU durante o pico mais alto do evento. Isto não significa que estivesse sobredimensionado. Significa que o tráfego real é organicamente diferente do tráfego sintético. Os usuários reais mantêm sessões longas, fazem refresh token cada 30 minutos, e passam a maior parte do tempo no CDN — não batendo no SSO.

### Modelo de Capacidade Ajustado

| Cenário | RPS Real | CPU Est. | Latência P95 | Estado |
|---|---|---|---|---|
| Baseline | 122 | 1,2% | 10ms | ✅ Normal |
| Pico FVM | 500 | 5% | 14,5ms | ✅ Evento |
| Capacidade confortável | 2.000 | 20% | ~50ms | ✅ Seguro |
| Limite threads | 5.000 | 50% | ~200ms | ⚠️ Saturação |
| Colapso GC | 8.000+ | 80%+ | >1.000ms | 🔴 Instável |

A capacidade real do sistema é ~2.000 RPS com degradação aceitável, e ~5.000 RPS antes de os threads do Undertow se saturarem. O gargalo não é CPU nem memória: é o número de workers disponíveis para processar requests concurrentes.

## Gargalos e Decisões Arquitetônicas

### Gargalo #1: ELB Huawei (~8.000 RPS)

O Elastic Load Balancer da Huawei Cloud tem um limite técnico de ~8.000 RPS. Para eventos maiores (Champions, Mundial), solicitamos aumento de limite. Este é o gargalo mais crítico porque está fora do nosso controle direto.

### Gargalo #2: Infinispan State Transfer (2-5 min)

Quando um pod novo se une ao cluster com 100.000 sessões ativas, deve sincronizar ~50 MB de dados desde 19 peers (em um cluster de 20 pods). Durante este tempo:
- O pod novo não serve tráfego
- Os peers dedicam CPU à transferência
- A latência do cluster aumenta 10-20%

**Mitigação**: Pré-aquecimento obrigatório. Nunca adicionar pods frios durante uma onda.

### Gargalo #3: JGroups Overhead (+10% CPU)

Em um cluster de 20 pods, JGroups gera ~1.140 heartbeats/segundo. O overhead estimado é ~10% de CPU adicional do cluster. Aceitável até 15 pods. Depois de 15, cada réplica adicional aporta menos capacidade marginal.

| Réplicas | Capacidade total | Eficiência | Recomendação |
|---|---|---|---|
| 5 | 3.500 RPS | 100% | ✅ Base estável |
| 8 | 5.420 RPS | 90% | ✅ Ótimo FVM |
| 10 | 6.800 RPS | 90% | ✅ Melhor custo/benefício |
| 15 | 9.000 RPS | 80% | ⚠️ State transfer lento |
| 20 | 12.000 RPS | 70% | ⚠️ Máximo técnico |

### Decisão: Node Affinity Obrigatória

A configuração OPT-V4 tem `nodeAffinity` obrigatória para `c6.3xlarge.2`. Os pods não se programam em outros flavors. Isto não é uma restrição arbitrária: os ratios de threads (20:1 para Undertow, 10:1 para EJB) estão calculados especificamente para 12 vCPUs. Rodar em um nó com 8 vCPUs faria com que Undertow solicitasse 160 workers para 8 cores, gerando thrashing de contexto.

### Decisão: Proibir kubectl exec em Produção

Em fevereiro de 2026 confirmamos que executar `jboss-cli.sh --connect` via `kubectl exec` ativa o OOM Killer do Kubernetes. O comando consome memória adicional que empurra o pod sobre o limite, e Kubernetes o mata.

**Solução**: Toda a configuração se aplica mediante ConfigMap + `embed-server` (modo offline CLI). As validações em produção são de só leitura: métricas via endpoint de Prometheus, logs via `kubectl logs`, e variáveis de ambiente via `kubectl get pod -o jsonpath`.

## A Operação: Checklists, Runbooks e Cultura

A arquitetura cloud-native não é só tecnologia. É cultura operativa. Para cada evento seguimos um checklist de 30+ itens validados por scripts automatizados:

**Pré-deploy (19:30)**
- [ ] Node affinity verificada para flavor correto
- [ ] Resource limits ≤70% de capacidade do nó
- [ ] JVM heap = 50% da RAM, G1GC configurado
- [ ] Undertow workers = ratio 20:1
- [ ] EJB pools: SLSB = ratio 10:1, MDB = ratio 2:1
- [ ] DB pool = 80 conexões/pod
- [ ] JGroups cluster formado sem erros
- [ ] Probes: timeouts corretos (não 1s como no incidente de janeiro 2026)
- [ ] PDB: minAvailable ≤ réplicas
- [ ] Backup de configuração anterior

**Durante o evento (20:00-03:00)**
- [ ] CPU < 70%, memória < 70%
- [ ] Latência P95 < 500ms
- [ ] Error rate < 1%
- [ ] Pods ready = esperados
- [ ] Comando de rollback à mão
- [ ] Plano de escalado de emergência (até 15 pods)

O script de validação `validar-fvm-2026-config.sh` executa estes checks em ~30 segundos sem tocar um único pod em execução.

## Visão de Futuro: Rumo ao SSO Autônomo

A arquitetura atual é reativa no seu melhor momento. Pré-aquecemos, monitoramos, escalamos manualmente. A próxima evolução é um SSO que se configure automaticamente segundo o calendário de eventos:

1. **Calendário de eventos integrado**: O sistema lê a programação do MEGA GO e pré-aquece automaticamente 30 minutos antes
2. **Decision tree de configuração**: Segundo o tipo de evento (futebol, FVM, concerto), aplica a configuração de RPS correspondente sem intervenção humana
3. **Predictive scaling**: Modelos de ML que predizem a onda baseando-se em padrões históricos (qual artista gera mais tráfego, qual partido de futebol mobiliza mais usuários)
4. **Multi-region failover**: Replicação de sessões entre zonas de disponibilidade da Huawei Cloud para tolerância a falhas de região

O objetivo não é eliminar os operadores. É eliminar as decisões mecânicas repetitivas para que os operadores se concentrem no imprevisível.

## A Lição

A arquitetura cloud-native não é sobre usar Kubernetes, Helm ou autoscalers. É sobre desenhar sistemas que entendem seu próprio comportamento sob stress e se preparam para ele de forma previsível.

As lições do SSO da Megamedia são aplicáveis a qualquer sistema crítico que enfrente cargas variáveis:

1. **Conhece tua carga real**: Os testes sintéticos são úteis para encontrar gargalos, não para estimar capacidade de usuários reais
2. **Pré-aquece, não reages**: O provisioning da nuvem leva minutos; os picos de tráfego duram segundos
3. **Otimiza para o recurso correto**: Keycloak é CPU-bound; um heap maior não ajuda, um GC mais eficiente sim
4. **Documenta tuas decisões**: Cada valor de configuração tem uma razão documentada. Não há "magia" na configuração
5. **Opera com checklists**: A infraestrutura mais confiável é a que se valida sistematicamente, não a que depende da memória de um experto

> "O SSO não é um custo operacional. É um ativo estratégico. Quando um usuário pode autenticar-se em 14,5ms durante o evento mais visto do ano, não está vendo Keycloak nem Kubernetes. Está vendo uma plataforma que respeita seu tempo."
