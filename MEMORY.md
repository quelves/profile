# MEMORY.md — Memoria del Proyecto

> **Última actualización:** 2026-05-31 14:30  
> **Sesión:** #3 — Auditoría documentación + skill v3.14.0 compliance  
> **Actualizado por:** 🤖 Arch + 🤖 Scribe

---

## 🎯 Contexto Actual

### Sprint en Curso
- **Sprint:** 0 de N (Bootstrap + Planificación)
- **Objetivo:** Definir estructura Dual Track y preparar deploy rápido de LQDS
- **Días restantes:** N/A
- **Estado:** 🟡 Planificación — esperando aprobación Leader para prioridades

### Track 1: LQDS — Site Estático (Foco Actual)
- **Estado:** 🟢 Funcional — deploy en GitHub Pages activo
- **Stack:** Next.js 16 + Static Export + GitHub Pages
- **Ruta:** `site/`
- **BasePath:** `/profile`
- **Próximo objetivo:** Deploy rápido y estable, mejoras de contenido/visual

### Track 2: QWS — Plataforma Fullstack (Fase 2)
- **Estado:** 📋 Planificación
- **Stack:** Next.js SSR + PostgreSQL + Redis + MinIO + Docker Swarm
- **Ruta:** `platform/qws/`
- **Infraestructura:** `platform/qws/docker-swarm-stack.yml` diseñado
- **Próximo objetivo:** No codear sin aprobación Leader

### Historias Activas
| ID | Historia | Agente | Estado | % |
|----|----------|--------|--------|---|
| N/A | N/A | N/A | N/A | N/A |

### Bloqueos Actuales
- Ninguno

---

## 🏗️ Decisiones Recientes

### Técnicas
- **Dual Track aprobado por Leader (implícito):** El proyecto se divide en 2 tracks:
  - **LQDS (Track 1):** Site estático — foco actual, deploy rápido
  - **QWS (Track 2):** Plataforma fullstack — planificación, NO codear sin aprobación
- **Repositorio:** `git@github.com:quelves/profile.git` — único repo, sin sub-repos
- **Estructura de carpetas:**
  - `site/` → Track 1 (LQDS)
  - `platform/qws/` → Track 2 (QWS)
  - `docs/` → Documentación global
  - `content/` → Contenido markdown fuente de verdad
- **Skill v3.14.0:** Instalado en `.claude/skills/mega-ia-team/` y `.kimi/skills/mega-ia-team/` (symlinks al skill global, NO en git)
- **AGENTS.md:** Actualizado con 13 roles y separación clara Dual Track
- **MEMORY.md + SESSION-STATE.md:** Creados y funcionales
- **Estructura docs/:** Creada con README.md, IMPLEMENTATION-PLAN.md, EPICS-AND-HISTORIES.md, DASHBOARD.md, architecture/, testing/, operations/, platform/
- **Docs globales:** CONTEXT.md, README.md, ROADMAP.md creados en raíz
- **Docs testing:** docs/testing/README.md + docs/testing/strategy.md creados
- **Épica QWS-E1:** Completamente reestructurada según skill v3.14.0:
  - Historias movidas a `stories/HN-name/HN-name.md`
  - Creados `analysis.md`, `limitations.md`, `tests/epic-test-plan.md`
  - Placeholders de spec packages (behavior.md, asr.md, test-strategy.md, tech-spec.md) para H1-H8
  - README.md actualizado con índice completo y columnas de estado
- **docker-swarm-stack.yml:** Movido a `platform/qws/docker-swarm-stack.yml`
- **.gitignore:** Robusto, cubre credenciales, .env*, secrets, builds, OS files, symlinks locales

### Negocio
- **LQDS:** Prioridad inmediata — el site estático debe estar deployado y funcional
- **QWS:** Visión a largo plazo — plataforma con CMS, AI Studio, auth
- **Contenido:** Los markdowns en `content/` son fuente de verdad para ambos tracks

---

## 🔧 Estado Técnico

### Track 1: LQDS (site/)
- **Build:** ✅ `npm run build` funciona (static export)
- **Deploy:** ✅ GitHub Pages activo via `.github/workflows/deploy.yml`
- **Contenido:** 59 artículos en `site/content/journal/`
- **Páginas:** Home, About, Impact, Insights, Research, Advisory, Speaking, Contact
- **i18n:** ES, EN, PT implementado

### Track 2: QWS (platform/qws/)
- **Stack:** Diseñado, no implementado
- **docker-swarm-stack.yml:** Completo, listo para `docker stack deploy`
- **Épicas:** QWS-E1 planificada con 8 historias + estructura completa skill v3.14.0

### Infraestructura
- **LQDS Prod:** ✅ GitHub Pages activo
- **QWS Prod:** 🔴 Planificado (Docker Swarm en VPS/Cloud)
- **QWS Monitor:** 🔴 Planificado (Grafana en `monitor.quelves.com`)

### Deuda Técnica
- N/A

---

## 📋 Próximos Pasos

### Para la Siguiente Sesión (Track 1 — Prioridad)
1. 👤 Leader: Definir qué mejoras/feature de LQDS hacer primero
2. 🤖 PO: Crear épica LQDS-E1 con historias de mejoras/deploy
3. 🤖 Arch: Revisar que el workflow de GitHub Pages funcione correctamente
4. 🤖 DevFE: Implementar mejoras aprobadas del site estático

### Para la Siguiente Sesión (Track 2 — Planificación)
1. 👤 Leader: Aprobar o posponer Épica QWS-E1
2. 🤖 Arch: Crear ADR-001 y ADR-002 cuando sea aprobado
3. 🤖 PO: Refinar épicas QWS con el Leader

### Pendientes del Leader
- [ ] Definir feature/improvement prioritario para LQDS (site estático)
- [ ] Aprobar o posponer trabajo en QWS
- [ ] Definir si se hace deploy de LQDS ahora o hay que fixear algo primero

---

## 🧠 Contexto Importante para Recordar

### Patrones del Proyecto (Track 1: LQDS)
- Usar Tailwind CSS para todo el styling (no CSS modules salvo justificación)
- Datos en `site/lib/data.ts`, contenido en `/content/`
- Páginas con Framer Motion requieren `"use client"`
- Static export: `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`
- `basePath: "/profile"` para GitHub Pages
- **NO agregar API routes en LQDS** (static export no las soporta)

### Patrones del Proyecto (Track 2: QWS — Futuro)
- Next.js 16 con SSR (sin static export)
- PostgreSQL + Prisma ORM para modelo relacional
- Redis para sesiones y cache
- MinIO para almacenamiento de objetos
- Auth.js / NextAuth para autenticación
- Docker Swarm para orquestación
- Traefik para ingress/reverse proxy

### Preferencias del Leader
- **Track 1 (LQDS) es prioridad** — deploy simple y rápido
- **Track 2 (QWS) es planificación** — no codear sin aprobación explícita
- Basar stack QWS en referencias Mega (salpla, megott)
- Seguridad: secrets externos, no hardcodear credenciales
- Observabilidad: Prometheus + Grafana obligatorio para QWS

### Lecciones Aprendidas
- Separar claramente los tracks evita confusiones de scope
- El .gitignore debe ser robusto desde el inicio
- Los symlinks de skills locales no deben ir en git

---

*MEMORY.md — Dual Track: LQDS (foco actual) + QWS (fase 2)*
