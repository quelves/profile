# IMPLEMENTATION-PLAN.md — Plan Maestro

> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31

---

## 🎯 Visión Dual Track

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUAL TRACK IMPLEMENTATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRACK 1 (LQDS) ────────────────────────────────────────────────────────   │
│  "Site estático profesional — deploy rápido, simple y estable"             │
│                                                                             │
│  TRACK 2 (QWS) ─────────────────────────────────────────────────────────   │
│  "Plataforma ejecutiva con CMS — infraestructura robusta y escalable"      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ TRACK 1: LQDS — Site Estático (Foco Actual)

> **Objetivo:** Mantener y mejorar el site estático con deploy rápido en GitHub Pages.
> **Stack:** Next.js 16 + Static Export + Tailwind CSS v4
> **Ruta:** `site/`
> **Prioridad:** 🔥 ALTA

### Fases

#### Fase 0: Bootstrap (Completada)
- [x] Instalar skill @mega-ia-team/
- [x] Crear AGENTS.md, MEMORY.md, SESSION-STATE.md
- [x] Crear estructura docs/
- [x] Configurar repo en `git@github.com:quelves/profile.git`
- [x] .gitignore robusto (credenciales, secrets, builds)

#### Fase 1: Mejoras y Deploy Rápido (LQDS-E1)
- [ ] Épica LQDS-E1: Mejoras del Site Estático
  - [ ] H1: Verificar y fixear workflow de GitHub Pages deploy
  - [ ] H2: Mejorar performance (Lighthouse > 90)
  - [ ] H3: Optimizar SEO (metadata, sitemap, robots.txt)
  - [ ] H4: Ajustes responsive y accesibilidad (a11y)
  - [ ] H5: Actualizar contenido desde markdowns en `content/`
  - [ ] H6: Revisar y optimizar imágenes/assets

#### Fase 2: Polishing y Release (LQDS-E2)
- [ ] Épica LQDS-E2: Release Site Estático v1.0
  - [ ] Visual regression testing
  - [ ] Lighthouse CI
  - [ ] Release tag v1.0.0

---

## 🗺️ TRACK 2: QWS — Plataforma Fullstack (Fase 2)

> **Objetivo:** Construir plataforma ejecutiva con CMS, Auth, AI Studio.
> **Stack:** Next.js 16 SSR + PostgreSQL + Redis + MinIO + Docker Swarm
> **Ruta:** `platform/qws/`
> **Prioridad:** 📋 PLANIFICACIÓN — no codear sin aprobación Leader

### Fases

#### Fase 0: Planificación (En curso)
- [x] Diseñar stack Docker Swarm (`platform/qws/docker-swarm-stack.yml`)
- [x] Crear épica QWS-E1 con 8 historias
- [ ] 👤 Leader aprobar trabajo en QWS
- [ ] ADR-001: Migración de Static Export a SSR + Docker Swarm
- [ ] ADR-002: Selección de stack de datos (PostgreSQL + Redis + MinIO)

#### Fase 1: Infraestructura Docker Swarm (QWS-E1)
- [ ] Implementar stack Docker Swarm completo
- [ ] Configurar PostgreSQL, Redis, MinIO
- [ ] Configurar observabilidad (Prometheus + Grafana)
- [ ] Configurar Traefik routing
- [ ] Crear scripts de secrets/configs
- [ ] Crear runbooks

#### Fase 2: Fundación Técnica (QWS-E2 + QWS-E3)
- [ ] Épica QWS-E2: Modelo de Datos y Prisma ORM
- [ ] Épica QWS-E3: Autenticación y Autorización (Auth.js + roles)

#### Fase 3: Sitio Público (QWS-E4)
- [ ] Épica QWS-E4: Sitio Público (migrar contenido de LQDS)

#### Fase 4: CMS + AI Studio (QWS-E5 + QWS-E6)
- [ ] Épica QWS-E5: Panel Admin / CMS
- [ ] Épica QWS-E6: AI Studio

#### Fase 5: SEO + Release (QWS-E7 + QWS-E8)
- [ ] Épica QWS-E7: SEO, Multidioma y Publicación
- [ ] Épica QWS-E8: Testing, Seguridad y Release

---

## 📅 Milestones

| Milestone | Track | Fecha Target | Épicas | Estado |
|-----------|-------|-------------|--------|--------|
| M0 — Bootstrap | LQDS | 2026-05-31 | N/A | 🟢 Completado |
| M1 — Deploy Rápido | LQDS | 2026-06-07 | LQDS-E1 | 🟡 En planificación |
| M2 — Release LQDS v1.0 | LQDS | 2026-06-14 | LQDS-E2 | 🔴 Pendiente |
| M3 — Infraestructura QWS | QWS | 2026-06-21 | QWS-E1 | 🔴 Planificado |
| M4 — Fundación QWS | QWS | 2026-07-05 | QWS-E2, QWS-E3 | 🔴 Planificado |
| M5 — Sitio + CMS QWS | QWS | 2026-07-19 | QWS-E4, QWS-E5 | 🔴 Planificado |
| M6 — AI + Release QWS | QWS | 2026-08-02 | QWS-E6, QWS-E7, QWS-E8 | 🔴 Planificado |

---

## 🔗 Dependencias

```
TRACK 1: LQDS (Independiente)
├── M0 (Bootstrap) ✅
├── M1 (Deploy Rápido) 🟡
└── M2 (Release v1.0) 🔴

TRACK 2: QWS (Depende de aprobación Leader)
├── Fase 0 (Planificación) 🟡
├── Fase 1 (Infraestructura) 🔴
├── Fase 2 (Fundación) 🔴
├── Fase 3 (Sitio) 🔴
├── Fase 4 (CMS + AI) 🔴
└── Fase 5 (Release) 🔴

RELACIÓN ENTRE TRACKS:
LQDS v1.0 ──contenido──► QWS Sitio Público (Fase 3)
LQDS Design System ────► QWS Design System (base visual)
```

---

## 📐 Stacks Tecnológicos

### Track 1: LQDS

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 App Router |
| Render | Static Export (`output: "export"`) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| i18n | Custom lightweight (sin middleware) |
| Deploy | GitHub Pages |
| CI/CD | GitHub Actions |

### Track 2: QWS

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 App Router |
| Render | SSR (Server-Side Rendering) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Backend | Next.js API routes |
| ORM | Prisma |
| DB | PostgreSQL 15 |
| Cache | Redis 7 |
| Object Storage | MinIO |
| Auth | Auth.js / NextAuth |
| IA | LLM API configurable |
| Orchestración | Docker Swarm |
| Reverse Proxy | Traefik |
| Observability | Prometheus + Grafana + cAdvisor + Node Exporter |

---

*Documento mantenido por 🤖 Arch + 🤖 PO*
