---
title: "MEGA GO Shorts en 5 Semanas: Cómo un Swarm de Agentes IA Redefinió la Velocidad de Entrega"
date: "2025-10-15"
category: "Enterprise Architecture"
excerpt: "Implementamos un player vertical estilo TikTok/Reels en la plataforma OTT #1 de Latinoamérica en 5 semanas con un swarm de agentes IA — 83% de 390 SP completados, 62 historias entregadas, latencia <500ms y memoria reducida a la mitad."
tags: ["IA", "Agentic AI", "MEGA GO", "OTT", "Shorts", "Productividad"]
lang: "es"
---

En abril de 2026, el mercado de streaming en Latinoamérica exigía un formato short-form vertical. TikTok, Instagram Reels y YouTube Shorts habían reconfigurado la expectativa del usuario: contenido vertical de 9:16, scroll infinito, transiciones fluidas. MEGA GO, con 1.91 millones de descargas y 473K usuarios activos, necesitaba competir en ese formato sin comprometer la plataforma existente.

La estimación tradicional para un player vertical multiplataforma en una arquitectura OTT enterprise era de **~28 semanas** (1,112 horas con un desarrollador). Entregamos **83% de la épica en 5 semanas**. Este artículo explica cómo un swarm de agentes IA coordinados por el skill `@mega-ia-team` transformó la velocidad de entrega sin sacrificar calidad enterprise.

## El Desafío: Shorts en una Plataforma Crítica

La complejidad no era el player en sí. Era el contexto en el que debía operar:

- **7 plataformas** a soportar: Android, iOS, Web, Smart TV, Web Hosted, Roku, Android TV
- **Zero regresión**: el player VOD/Live existente atiende a 473K usuarios activos diarios
- **Performance exigente**: scroll fluido 60fps, transición entre episodios < 300ms
- **Arquitectura legacy**: player Android de ~2,690 líneas acoplado a skins, DAI/SSAI, DRM, Cast, Youbora
- **Deadline fijo**: MVP entregable en mayo de 2026

La decisión arquitectónica más importante — documentada en ADR-007 — fue **no reutilizar el player legacy**. El `MegaGOMDSPlayer` (~2,690 líneas) estaba diseñado para VOD/Live en landscape con skins XML complejas, analytics masivos y Cast hardcoded. Adaptarlo a un formato portrait 9:16 habría generado regresiones impredecibles y una deuda técnica que no podíamos permitirnos.

En su lugar, creamos `MegaShortsPlayer`: un player dedicado de ~616 líneas, sin skins, con buffer optimizado para clips cortos, latencia de inicio < 500ms, y consumo de memoria de ~15-25 MB por instancia (vs ~50 MB del legacy).

| Aspecto | Player Legacy | Player Shorts |
|---|---|---|
| Líneas | ~2,690 | ~616 |
| Memoria | ~50 MB | ~15-25 MB |
| Skins | XML complejo VOD/Live/Trailer | Sin skins; UI custom |
| Buffer | Genérico VOD/Live | `minBufferMs=1500`, `maxBufferMs=3000` |
| Latencia inicio | ~1.5-2s | **< 500ms** |
| Orientación | Landscape forzado | Portrait nativo 9:16 |
| Analytics | Youbora + eventos masivos | Firebase básicos |

## La Metodología: Swarm de Agentes Especializados

Para MGO-E8 activamos el skill `@mega-ia-team` en **Modo Swarm**: múltiples agentes especializados trabajando en paralelo, validando cruzadamente, con el Leader Humano como único aprobador.

### Arquitectura de Agentes

```
👤 Leader Humano (Aprobador único)
    │
    ├── 🤖 PO — Épicas, historias, criterios de aceptación
    ├── 🤖 Arch — ADRs, ASRs, diseño C4, validación técnica
    ├── 🤖 UI/UX — Especificaciones desde Adobe XD (27 screens)
    ├── 🤖 DevBE / 🤖 DevFE — Implementación (TDD obligatorio)
    ├── 🤖 QA — Test Strategy + BDD/TDD gate
    ├── 🤖 CodeRev — Calidad, cobertura, deuda técnica
    ├── 🤖 SecRev — Secrets, OWASP, seguridad
    └── 🤖 Scribe — MEMORY.md, SESSION-STATE.md, specs
```

### Disciplinas Obligatorias

| Disciplina | Regla | Resultado en MGO-E8 |
|---|---|---|
| **SDD (Spec-First)** | Sin Specification Package aprobado → no se crea branch | 65 historias con `behavior.md`, `asr.md`, `tech-spec.md` |
| **TDD** | Tests antes del código | 14 tests Android, 21 tests iOS |
| **BDD** | Given/When/Then en cada historia | Flujos E2E documentados cross-platform |
| **CodeRev + SecRev** | Pueden bloquear pipeline | 13 merges validados antes de integrar a `develop` |

### Checkpoint Protocol

Cada sesión del swarm ejecutó checkpoints obligatorios:

- **CP-0**: Leer `SESSION-STATE.md` + `MEMORY.md` antes de actuar
- **CP-1**: Historia activa, branch y objetivo documentados
- **CP-2**: Progreso actualizado tras cada commit
- **CP-5**: Verificación documentación-código antes de aprobación
- **CP-8**: Post-implementación: estimación vs real, calibración de factor

> **Ejemplo real de CP-8:** Una historia Android estimada en 5 SP (40h tradicional) fue implementada en **~2.5h reales** con agente IA. Factor observado: **~16x más eficiente** para código boilerplate; **~4x** para lógica de negocio compleja (pre-buffering, DRM).

## Implementación por Plataforma

### Android — ExoPlayer + ViewPager2 Vertical

**Líneas nuevas:** ~6,988 | **Commits:** 361 | **Historias:** 62/65

El núcleo del trabajo Android fue el `MegaShortsPlayer`, un wrapper liviano sobre ExoPlayer con configuración agresiva de buffer para clips cortos:

```java
// MegaShortsPlayer.java (~616 líneas)
// Buffer optimizado: 1.5s mínimo, 3s máximo para clips de 30-90s
LoadControl loadControl = new DefaultLoadControl.Builder()
    .setBufferDurationsMs(1500, 3000, 500, 1000)
    .build();

// ViewPager2 vertical con prefetch de 1 página
viewPager2.setOffscreenPageLimit(1);
viewPager2.setOrientation(ViewPager2.ORIENTATION_VERTICAL);
```

**Clases nuevas clave:**
- `MegaShortsPlayerActivity.java` (1,484 líneas) — Activity principal con gestión de ciclo de vida
- `MegaShortsPlayerAdapter.java` (1,060 líneas) — ViewPager2 vertical con reciclaje agresivo
- `ShortsMediaPreparer.java` (276 líneas) — Preparación MediaItem + DRM Widevine
- `ShortsPiPHelper.kt` (253 líneas) — Picture-in-Picture para multitasking
- `ShortsAdManager.java` (161 líneas) — Publicidad entre episodios
- `ShortsCWManager.java` (105 líneas) — Continuar viendo con cache local

**Performance medida:**

| Métrica | Target | Resultado |
|---|---|---|
| Tiempo carga primer video | < 1.5s | **< 500ms** |
| Transición swipe (cacheado) | < 300ms | **~200ms** |
| Memoria máxima (3 instancias) | < 150MB | **~75MB** |
| Frames dropped durante scroll | < 3 | **0** (60fps sostenido) |
| Battery drain / 10 min | < 8% | **~6%** |

### iOS — AVPlayer + UIPageViewController Vertical

**Líneas nuevas:** 1,169 (Swift/SwiftUI) | **Commits:** 134

ADR-002 validó crear `ShortsPlayerView` + `ShortsPlayerViewModel` independientes en lugar de reutilizar `VideoPlayerView` (386 líneas, landscape forzado):

- `AVPlayerLayer` con `videoGravity = .resizeAspectFill` en contenedor vertical nativo
- Watchdog de carga foreground: auto-retry 2×5s si el player queda negro
- Precarga paralela do pool de shorts via `defer` e paralelização
- 21 unit tests: `pickEffectiveCW`, `SeriesCache`, `pickEffectiveVod`

### Web — React + HLS.js + scroll-snap

**Líneas nuevas:** 621 | **Commits:** 32

- URL limpia `/player/short/:mediaId` sin redirección
- CSS `scroll-snap-type: y mandatory` para transición fluida
- Soporte rueda mouse + flechas teclado
- Guardado de estado y volumen al cambiar de video
- Migração desde Shaka Player a HLS.js para mejor compatibilidad HLS

### API Backend — Node.js + MongoDB + Redis

Extensiones de schema para soportar el formato short:
- `Series.isShort: Boolean` + `shortMetadata` (aspectRatio, autoPlayNext)
- `Episode.videoVariants` (360p/540p/720p) + `thumbnailVertical`
- `ContentList.style: "short"` + `shortConfig` (autoScroll, adFrequency)
- Nuevo endpoint: `GET /api/v3/series/:id/shorts` con cache Redis TTL 300s

## Velocidad de Entrega: 5 Semanas vs 28 Estimadas

| Semana | Focus | Entregables |
|---|---|---|
| **1** | UX/UI + Kickoff Swarm | Prototipo Adobe XD 27 screens, specs H1-H10 |
| **2** | Backend + Android core | API `/shorts`, `MegaShortsPlayerActivity`, ADR-007 |
| **3** | iOS + Web + Mobile detail | `ShortsPlayerView` iOS, Web player, detalle episodio |
| **4** | Ads + Deep Links + CW | AdMob, FCM push, deep links, continuar viendo |
| **5** | Hardening + QA + Fixes | BUG fixes, Regla de Oro IDs, PiP, 13vo merge |

### Métricas de Velocidad

| Métrica | Valor |
|---|---|
| **SP totales** | 390 SP (inicial 139 → expandido con historias emergentes) |
| **SP completados** | 322 SP (**83%**) |
| **Historias totales** | 65 |
| **Historias completadas** | 62 (**95%**) |
| **Commits Android** | 361 |
| **Commits iOS** | 134 |
| **Commits Web** | 32 |
| **Merges a develop** | 13 (merge parcial controlado, sin romper develop) |
| **Tiempo total** | **~5 semanas** |
| **Factor de aceleración** | **~5-6x** vs estimación tradicional |

### Eficiencia por Tipo de Tarea

| Tipo de Tarea | Factor IA vs Tradicional |
|---|---|
| Boilerplate / Layouts XML | ~20x |
| Clases estándar / Adapter | ~16x |
| Lógica de negocio compleja | ~4-8x |
| Debugging / Root cause analysis | ~3-5x |
| Documentación / Specs | ~10x |
| Refactor / Merge conflict | ~2-4x |

## Calidad y Seguridad: Gates que Nunca se Saltaron

El skill `@mega-ia-team` impone gates secuenciales que fueron respetados en cada historia:

**CodeRev**
- Cobertura de tests target 70% (proyecto heredado)
- Estilo validado: ESLint / Prettier / ktLint
- Sin duplicación mayor al 5%
- Consistente con ADR-001, ADR-005, ADR-007

**SecRev**
- Sin credenciales hardcoded (`DRM License Server URL` movida a `BuildConfig`)
- OWASP Mobile validado
- Null-safety centralizado en `matchesEpisodeId()`

**QA**
- 14 tests unitarios Android (JUnit4)
- 21 tests unitarios iOS (XCTest)
- 7 flujos E2E Android (Espresso)
- Performance: latencia, memoria, battery via Android Profiler y Firebase Perf

## Lecciones Aprendidas

### Lo que Funcionó

1. **Player dedicado > Player reutilizado:** ADR-007 validó que crear un player nuevo liviano fue la decisión técnica más importante. Cero regresiones en VOD/Live, memoria reducida 50%.

2. **Swarm con especialistas paralelos:** Mientras un agente implementaba el player Android, otro preparaba tests E2E, otro validaba ADRs, y otro documentaba. Sin esperas secuenciales.

3. **Spec-First (SDD):** Cada historia con `behavior.md` + `tech-spec.md` aprobados antes de codear eliminó el 90% de rework.

4. **Checkpoint Protocol:** `SESSION-STATE.md` y `MEMORY.md` actualizados en cada sesión permitieron retomar contexto instantáneamente después de interrupciones.

5. **Merges parciales:** Los 13 merges controlados a `develop` evitaron el infierno de merge de una épica larga.

### Lo que Mejorar

1. **iOS quedó ~2 semanas atrás de Android:** El bus factor 1-2 en Android generó asimetría. Recomendación: balancear agentes por plataforma desde el inicio.

2. **Smart TV y Roku no iniciados:** Pendientes por dependencia de recursos de hardware. Recomendación: reservar dispositivos físicos al inicio.

3. **Push bloqueado 66+ commits:** Problemas de red con el repositorio remoto retrasaron la integración continua. Recomendación: mirror local del repo.

## La Lección

El swarm de agentes IA no reemplazó al ingeniero — **lo potenció**. La clave no fue "más velocidad a costa de calidad", sino **disciplina estructurada**: SDD + TDD + BDD + validación cruzada entre agentes + aprobación humana en decisiones críticas.

Los números hablan por sí solos: **83% de 390 SP en 5 semanas**, **< 500ms de latencia**, **memoria reducida a la mitad**, **cero regresiones** en el player legacy, **13 merges limpios** a develop. Pero el número que más importa es el que no aparece en las métricas: **1.91 millones de usuarios** que ahora tienen un formato short-form en la plataforma que ya usan, sin que ninguno de ellos haya experimentado una regresión en el player VOD/Live que dependen.

> "Sin Specification Package aprobado, no se crea branch de feature." — Regla de Oro del skill `@mega-ia-team`, aplicada 65 veces en MGO-E8.
