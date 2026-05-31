# IMPLEMENTATION-PLAN.md — Plan Maestro

> **Proyecto:** Quelves Platform (QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31

---

## 🎯 Visión

Plataforma ejecutiva profesional `quelves.com` para Luiz Quelves Da Silva — Technology Transformation Executive. El sitio debe reflejar 25+ años de experiencia con diseño moderno, rendimiento óptimo, multilenguaje (es, pt, en), CMS administrable y AI Studio para generación de contenido.

Evolución desde portfolio estático (LQDS) hacia plataforma fullstack con Docker Swarm.

---

## 🗺️ Fases

### Fase 0: Bootstrap (Completada)
- [x] Instalar skill @mega-ia-team/
- [x] Crear AGENTS.md, MEMORY.md, SESSION-STATE.md
- [x] Crear estructura docs/
- [x] Actualizar AGENTS.md con stack Docker Swarm y roles QWS

### Fase 1: Infraestructura Docker Swarm (QWS-E1)
- [ ] Épica QWS-E1: Infraestructura Docker Swarm
  - [ ] H1: Stack YAML completo
  - [ ] H2: PostgreSQL
  - [ ] H3: Redis
  - [ ] H4: MinIO
  - [ ] H5: Observabilidad (Prometheus + Grafana)
  - [ ] H6: Traefik routing
  - [ ] H7: Secrets y configs
  - [ ] H8: Runbooks
- [ ] ADR-001: Migración de Static Export a SSR con Docker Swarm
- [ ] ADR-002: Selección de stack de datos (PostgreSQL + Redis + MinIO)

### Fase 2: Fundación Técnica y Arquitectura de Datos (QWS-E2 + QWS-E3)
- [ ] Épica QWS-E2: Modelo de Datos y Prisma ORM
- [ ] Épica QWS-E3: Autenticación y Autorización (Auth.js + roles)
- [ ] ADR-003: Modelo de datos y Prisma schema
- [ ] ADR-004: Estrategia de autenticación

### Fase 3: Sitio Público (QWS-E4)
- [ ] Épica QWS-E4: Sitio Público (Home, Impact, Insights, Research, Advisory, About, Contact)
- [ ] Seed inicial de contenido desde markdowns existentes

### Fase 4: CMS Administrativo (QWS-E5)
- [ ] Épica QWS-E5: Panel Admin / CMS
  - [ ] Dashboard
  - [ ] Content Manager (CRUD)
  - [ ] Editor con SEO fields
  - [ ] Workflow editorial (Draft → Review → Approved → Published)

### Fase 5: AI Studio (QWS-E6)
- [ ] Épica QWS-E6: AI Studio
  - [ ] Integración LLM configurable
  - [ ] Templates de prompts
  - [ ] Logs de generación
  - [ ] Traducción ES/EN/PT
  - [ ] Generación de LinkedIn posts

### Fase 6: SEO, Multidioma y Publicación (QWS-E7)
- [ ] Épica QWS-E7: SEO, Multidioma y Publicación
  - [ ] Sitemap automático
  - [ ] RSS feed
  - [ ] Open Graph
  - [ ] Metadata dinámica

### Fase 7: Testing, Seguridad y Release (QWS-E8)
- [ ] Épica QWS-E8: Testing, Seguridad y Release
  - [ ] Unit tests > 70%
  - [ ] Integration tests
  - [ ] E2E tests básicos
  - [ ] npm audit
  - [ ] Revisión de secrets
  - [ ] Reportes CodeRev + SecRev + QA

---

## 📅 Milestones

| Milestone | Fecha Target | Épicas | Estado |
|-----------|-------------|--------|--------|
| M0 — Bootstrap | 2026-05-31 | N/A | 🟢 Completado |
| M1 — Infraestructura | 2026-06-07 | QWS-E1 | 🟡 En planificación |
| M2 — Fundación Técnica | 2026-06-14 | QWS-E2, QWS-E3 | 🔴 Pendiente |
| M3 — Sitio Público | 2026-06-28 | QWS-E4 | 🔴 Pendiente |
| M4 — CMS + AI Studio | 2026-07-12 | QWS-E5, QWS-E6 | 🔴 Pendiente |
| M5 — SEO + Release | 2026-07-26 | QWS-E7, QWS-E8 | 🔴 Pendiente |

---

## 🔗 Dependencias

```
M0 (Bootstrap)
  └── M1 (Infraestructura Docker Swarm)
        └── M2 (Fundación Técnica: DB + Auth)
              └── M3 (Sitio Público)
                    └── M4 (CMS + AI Studio)
                          └── M5 (SEO + Release)
```

---

## 📐 Stack Tecnológico Definido

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API routes, tRPC (evaluar en ADR) |
| ORM | Prisma |
| DB | PostgreSQL 15 |
| Cache | Redis 7 |
| Object Storage | MinIO |
| Auth | Auth.js / NextAuth |
| IA | LLM API configurable (OpenAI, Anthropic, Gemini, Kimi) |
| Orchestración | Docker Swarm |
| Reverse Proxy | Traefik |
| Observabilidad | Prometheus + Grafana + cAdvisor + Node Exporter |
| CI/CD | GitHub Actions + Docker Swarm deploy |

---

*Documento mantenido por 🤖 Arch + 🤖 PO*
