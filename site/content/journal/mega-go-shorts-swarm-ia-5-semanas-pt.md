---
title: "MEGA GO Shorts em 5 Semanas: Como um Swarm de Agentes IA Redefiniu a Velocidade de Entrega"
date: "2025-10-15"
category: "Enterprise Architecture"
excerpt: "Implementamos um player vertical estilo TikTok/Reels na plataforma OTT #1 da América Latina em 5 semanas com um swarm de agentes IA — 83% de 390 SP completados, 62 histórias entregues, latência <500ms e memória reduzida pela metade."
tags: ["IA", "Agentic AI", "MEGA GO", "OTT", "Shorts", "Produtividade"]
lang: "pt"
---

Em abril de 2026, o mercado de streaming na América Latina exigia um formato short-form vertical. TikTok, Instagram Reels e YouTube Shorts haviam reconfigurado a expectativa do usuário: conteúdo vertical de 9:16, scroll infinito, transições fluidas. O MEGA GO, com 1,91 milhão de downloads e 473K usuários ativos, precisava competir nesse formato sem comprometer a plataforma existente.

A estimativa tradicional para um player vertical multiplataforma em uma arquitetura OTT enterprise era de **~28 semanas** (1.112 horas com um desenvolvedor). Entregamos **83% da épica em 5 semanas**. Este artigo explica como um swarm de agentes IA coordenados pelo skill `@mega-ia-team` transformou a velocidade de entrega sem sacrificar qualidade enterprise.

## O Desafio: Shorts em uma Plataforma Crítica

A complexidade não era o player em si. Era o contexto em que ele deveria operar:

- **7 plataformas** a suportar: Android, iOS, Web, Smart TV, Web Hosted, Roku, Android TV
- **Zero regressão**: o player VOD/Live existente atende a 473K usuários ativos diários
- **Performance exigente**: scroll fluido 60fps, transição entre episódios < 300ms
- **Arquitetura legacy**: player Android de ~2.690 linhas acoplado a skins, DAI/SSAI, DRM, Cast, Youbora
- **Prazo fixo**: MVP entregável em maio de 2026

A decisão arquitetônica mais importante — documentada em ADR-007 — foi **não reutilizar o player legacy**. O `MegaGOMDSPlayer` (~2.690 linhas) estava desenhado para VOD/Live em landscape com skins XML complexas, analytics massivos e Cast hardcoded. Adaptá-lo a um formato portrait 9:16 teria gerado regressões imprevisíveis e uma dívida técnica que não podíamos nos permitir.

Em seu lugar, criamos o `MegaShortsPlayer`: um player dedicado de ~616 linhas, sem skins, com buffer otimizado para clips curtos, latência de início < 500ms, e consumo de memória de ~15-25 MB por instância (vs ~50 MB do legacy).

| Aspecto | Player Legacy | Player Shorts |
|---|---|---|
| Linhas | ~2.690 | ~616 |
| Memória | ~50 MB | ~15-25 MB |
| Skins | XML complexo VOD/Live/Trailer | Sem skins; UI custom |
| Buffer | Genérico VOD/Live | `minBufferMs=1500`, `maxBufferMs=3000` |
| Latência início | ~1,5-2s | **< 500ms** |
| Orientação | Landscape forçado | Portrait nativo 9:16 |
| Analytics | Youbora + eventos massivos | Firebase básicos |

## A Metodologia: Swarm de Agentes Especializados

Para MGO-E8 ativamos o skill `@mega-ia-team` em **Modo Swarm**: múltiplos agentes especializados trabalhando em paralelo, validando cruzadamente, com o Leader Humano como único aprovador.

### Arquitetura de Agentes

```
👤 Leader Humano (Aprovador único)
    │
    ├── 🤖 PO — Épicas, histórias, critérios de aceitação
    ├── 🤖 Arch — ADRs, ASRs, desenho C4, validação técnica
    ├── 🤖 UI/UX — Especificações desde Adobe XD (27 screens)
    ├── 🤖 DevBE / 🤖 DevFE — Implementação (TDD obrigatório)
    ├── 🤖 QA — Test Strategy + BDD/TDD gate
    ├── 🤖 CodeRev — Qualidade, cobertura, dívida técnica
    ├── 🤖 SecRev — Secrets, OWASP, segurança
    └── 🤖 Scribe — MEMORY.md, SESSION-STATE.md, specs
```

### Disciplinas Obrigatórias

| Disciplina | Regra | Resultado em MGO-E8 |
|---|---|---|
| **SDD (Spec-First)** | Sem Specification Package aprovado → não se cria branch | 65 histórias com `behavior.md`, `asr.md`, `tech-spec.md` |
| **TDD** | Tests antes do código | 14 tests Android, 21 tests iOS |
| **BDD** | Given/When/Then em cada história | Fluxos E2E documentados cross-platform |
| **CodeRev + SecRev** | Podem bloquear pipeline | 13 merges validados antes de integrar a `develop` |

### Checkpoint Protocol

Cada sessão do swarm executou checkpoints obrigatórios:

- **CP-0**: Ler `SESSION-STATE.md` + `MEMORY.md` antes de agir
- **CP-1**: História ativa, branch e objetivo documentados
- **CP-2**: Progresso atualizado após cada commit
- **CP-5**: Verificação documentação-código antes de aprovação
- **CP-8**: Pós-implementação: estimação vs real, calibração de fator

> **Exemplo real de CP-8:** Uma história Android estimada em 5 SP (40h tradicional) foi implementada em **~2,5h reais** com agente IA. Fator observado: **~16x mais eficiente** para código boilerplate; **~4x** para lógica de negócio complexa (pre-buffering, DRM).

## Implementação por Plataforma

### Android — ExoPlayer + ViewPager2 Vertical

**Linhas novas:** ~6.988 | **Commits:** 361 | **Histórias:** 62/65

O núcleo do trabalho Android foi o `MegaShortsPlayer`, um wrapper leve sobre ExoPlayer com configuração agressiva de buffer para clips curtos:

```java
// MegaShortsPlayer.java (~616 linhas)
// Buffer otimizado: 1,5s mínimo, 3s máximo para clips de 30-90s
LoadControl loadControl = new DefaultLoadControl.Builder()
    .setBufferDurationsMs(1500, 3000, 500, 1000)
    .build();

// ViewPager2 vertical com prefetch de 1 página
viewPager2.setOffscreenPageLimit(1);
viewPager2.setOrientation(ViewPager2.ORIENTATION_VERTICAL);
```

**Classes novas chave:**
- `MegaShortsPlayerActivity.java` (1.484 linhas) — Activity principal com gestão de ciclo de vida
- `MegaShortsPlayerAdapter.java` (1.060 linhas) — ViewPager2 vertical com reciclagem agressiva
- `ShortsMediaPreparer.java` (276 linhas) — Preparação MediaItem + DRM Widevine
- `ShortsPiPHelper.kt` (253 linhas) — Picture-in-Picture para multitasking
- `ShortsAdManager.java` (161 linhas) — Publicidade entre episódios
- `ShortsCWManager.java` (105 linhas) — Continuar vendo com cache local

**Performance medida:**

| Métrica | Target | Resultado |
|---|---|---|
| Tempo carga primeiro vídeo | < 1,5s | **< 500ms** |
| Transição swipe (cacheado) | < 300ms | **~200ms** |
| Memória máxima (3 instâncias) | < 150MB | **~75MB** |
| Frames dropped durante scroll | < 3 | **0** (60fps sustentado) |
| Battery drain / 10 min | < 8% | **~6%** |

### iOS — AVPlayer + UIPageViewController Vertical

**Linhas novas:** 1.169 (Swift/SwiftUI) | **Commits:** 134

ADR-002 validou criar `ShortsPlayerView` + `ShortsPlayerViewModel` independentes em vez de reutilizar `VideoPlayerView` (386 linhas, landscape forçado):

- `AVPlayerLayer` com `videoGravity = .resizeAspectFill` em contêiner vertical nativo
- Watchdog de carga foreground: auto-retry 2×5s se o player ficar negro
- Pré-carga paralela do pool de shorts via `defer` e paralelização
- 21 unit tests: `pickEffectiveCW`, `SeriesCache`, `pickEffectiveVod`

### Web — React + HLS.js + scroll-snap

**Linhas novas:** 621 | **Commits:** 32

- URL limpa `/player/short/:mediaId` sem redireção
- CSS `scroll-snap-type: y mandatory` para transição fluida
- Suporte roda mouse + setas teclado
- Guarda de estado e volume ao mudar de vídeo
- Migração de Shaka Player para HLS.js para melhor compatibilidade HLS

### API Backend — Node.js + MongoDB + Redis

Extensões de schema para suportar o formato short:
- `Series.isShort: Boolean` + `shortMetadata` (aspectRatio, autoPlayNext)
- `Episode.videoVariants` (360p/540p/720p) + `thumbnailVertical`
- `ContentList.style: "short"` + `shortConfig` (autoScroll, adFrequency)
- Novo endpoint: `GET /api/v3/series/:id/shorts` com cache Redis TTL 300s

## Velocidade de Entrega: 5 Semanas vs 28 Estimadas

| Semana | Focus | Entregáveis |
|---|---|---|
| **1** | UX/UI + Kickoff Swarm | Protótipo Adobe XD 27 screens, specs H1-H10 |
| **2** | Backend + Android core | API `/shorts`, `MegaShortsPlayerActivity`, ADR-007 |
| **3** | iOS + Web + Mobile detail | `ShortsPlayerView` iOS, Web player, detalhe episódio |
| **4** | Ads + Deep Links + CW | AdMob, FCM push, deep links, continuar vendo |
| **5** | Hardening + QA + Fixes | BUG fixes, Regra de Ouro IDs, PiP, 13º merge |

### Métricas de Velocidade

| Métrica | Valor |
|---|---|
| **SP totais** | 390 SP (inicial 139 → expandido com histórias emergentes) |
| **SP completados** | 322 SP (**83%**) |
| **Histórias totais** | 65 |
| **Histórias completadas** | 62 (**95%**) |
| **Commits Android** | 361 |
| **Commits iOS** | 134 |
| **Commits Web** | 32 |
| **Merges a develop** | 13 (merge parcial controlado, sem quebrar develop) |
| **Tempo total** | **~5 semanas** |
| **Fator de aceleração** | **~5-6x** vs estimação tradicional |

### Eficiência por Tipo de Tarefa

| Tipo de Tarefa | Fator IA vs Tradicional |
|---|---|
| Boilerplate / Layouts XML | ~20x |
| Classes padrão / Adapter | ~16x |
| Lógica de negócio complexa | ~4-8x |
| Debugging / Root cause analysis | ~3-5x |
| Documentação / Specs | ~10x |
| Refactor / Merge conflict | ~2-4x |

## Qualidade e Segurança: Gates que Nunca Foram Saltados

O skill `@mega-ia-team` impõe gates sequenciais que foram respeitados em cada história:

**CodeRev**
- Cobertura de tests target 70% (projeto herdado)
- Estilo validado: ESLint / Prettier / ktLint
- Sem duplicação maior que 5%
- Consistente com ADR-001, ADR-005, ADR-007

**SecRev**
- Sem credenciais hardcoded (`DRM License Server URL` movida para `BuildConfig`)
- OWASP Mobile validado
- Null-safety centralizado em `matchesEpisodeId()`

**QA**
- 14 tests unitários Android (JUnit4)
- 21 tests unitários iOS (XCTest)
- 7 fluxos E2E Android (Espresso)
- Performance: latência, memória, battery via Android Profiler e Firebase Perf

## Lições Aprendidas

### O que Funcionou

1. **Player dedicado > Player reutilizado:** ADR-007 validou que criar um player novo leve foi a decisão técnica mais importante. Zero regressões em VOD/Live, memória reduzida 50%.

2. **Swarm com especialistas paralelos:** Enquanto um agente implementava o player Android, outro preparava tests E2E, outro validava ADRs, e outro documentava. Sem esperas sequenciais.

3. **Spec-First (SDD):** Cada história com `behavior.md` + `tech-spec.md` aprovados antes de codar eliminou 90% de rework.

4. **Checkpoint Protocol:** `SESSION-STATE.md` e `MEMORY.md` atualizados em cada sessão permitiram retomar contexto instantaneamente após interrupções.

5. **Merges parciais:** Os 13 merges controlados a `develop` evitaram o inferno de merge de uma épica longa.

### O que Melhorar

1. **iOS ficou ~2 semanas atrás de Android:** O bus factor 1-2 em Android gerou assimetria. Recomendação: balancear agentes por plataforma desde o início.

2. **Smart TV e Roku não iniciados:** Pendentes por dependência de recursos de hardware. Recomendação: reservar dispositivos físicos no início.

3. **Push bloqueado 66+ commits:** Problemas de rede com o repositório remoto atrasaram a integração contínua. Recomendação: mirror local do repo.

## A Lição

O swarm de agentes IA não substituiu o engenheiro — **o potencializou**. A chave não foi "mais velocidade a custo de qualidade", mas **disciplina estruturada**: SDD + TDD + BDD + validação cruzada entre agentes + aprovação humana em decisões críticas.

Os números falam por si: **83% de 390 SP em 5 semanas**, **< 500ms de latência**, **memória reduzida pela metade**, **zero regressões** no player legacy, **13 merges limpos** a develop. Mas o número que mais importa é o que não aparece nas métricas: **1,91 milhão de usuários** que agora têm um formato short-form na plataforma que já usam, sem que nenhum deles tenha experimentado uma regressão no player VOD/Live de que dependem.

> "Sem Specification Package aprovado, não se cria branch de feature." — Regra de Ouro do skill `@mega-ia-team`, aplicada 65 vezes em MGO-E8.
