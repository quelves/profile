# MEMORY.md — Memoria del Proyecto

> **Última actualización:** 2026-05-31 13:15  
> **Sesión:** #1 — Plan de stack Docker Swarm para QWS  
> **Actualizado por:** 🤖 Arch + 🤖 PO

---

## 🎯 Contexto Actual

### Sprint en Curso
- **Sprint:** 0 de N (Bootstrap + Planificación)
- **Objetivo:** Definir stack Docker Swarm y plan de infraestructura para la plataforma quelves.com
- **Días restantes:** N/A
- **Estado:** 🟡 Planificación — esperando aprobación Leader

### Historias Activas
| ID | Historia | Agente | Estado | % |
|----|----------|--------|--------|---|
| N/A | N/A | N/A | N/A | N/A |

### Historias en Modo Swarm
| ID | Historia | 🐝 Equipo | Estado | % |
|----|----------|-----------|--------|---|
| N/A | N/A | N/A | N/A | N/A |

### Bloqueos Actuales
- Ninguno

---

## 🏗️ Decisiones Recientes

### Técnicas
- **Skill v3.14.0:** Instalado en `.claude/skills/mega-ia-team/` y `.kimi/skills/mega-ia-team/` (symlinks al skill global)
- **AGENTS.md:** Creado en raíz del proyecto, adaptado para portfolio frontend-only
- **MEMORY.md + SESSION-STATE.md:** Creados y funcionales
- **Estructura docs/:** Creada con README.md, IMPLEMENTATION-PLAN.md, EPICS-AND-HISTORIES.md, DASHBOARD.md, architecture/, testing/, operations/
- **Roles activos:** PO, Arch, DevLead, DevFE, UI/UX, QA, SRE (simplificado), Sec, Scribe, CodeRev, SecRev
- **Roles omitidos:** DevBE, DB Lead (no aplica a proyecto estático sin backend ni DB)

### Evolución del Proyecto (2026-05-31)
- **Visión actualizada:** El proyecto evoluciona de portfolio estático (LQDS) a plataforma ejecutiva `quelves.com` (QWS)
- **Stack objetivo:** Docker Swarm con PostgreSQL, Redis, MinIO, Next.js SSR, Traefik, Prometheus/Grafana
- **Referencia:** Stack basado en `mega-sales-platform` (salpla) y `mega-ott-admin` (megott)
- **Nuevos roles requeridos:** DevBE, DB Lead (ahora sí aplica backend + DB)
- **Código de proyecto:** QWS (Quelves Web Site/Platform)

### Stack Docker Swarm Definido
| Servicio | Tecnología | Justificación |
|----------|-----------|---------------|
| Reverse Proxy | Traefik (external) | Consistente con referencias Mega |
| Frontend | Next.js 16 + Node.js SSR | Evolución desde static export |
| Backend API | Next.js API routes (mismo contenedor) | Simplifica despliegue, consistente con prompts |
| Database | PostgreSQL 15 Alpine | Referencia salpla, Prisma ORM |
| Cache | Redis 7 Alpine | Sesiones, rate limiting, query cache |
| Object Storage | MinIO | Media assets, imágenes de contenido |
| Observability | Prometheus + Grafana + cAdvisor + Node Exporter | Referencia salpla |
| Secrets | Docker Swarm Secrets | Gestión segura de credenciales |

### Servicios NO incluidos (vs salpla)
- Kafka/Zookeeper: No requiere event streaming masivo
- pgAdmin: Se usa herramienta local (DBeaver)
- Java/Spring Boot: Backend unificado en Next.js API routes

---

## 🔧 Estado Técnico

### Módulos
- **site/:** 100% funcional (estático), despliegue automático a GitHub Pages
- **content/:** Markdowns fuente de verdad para el portfolio
- **docs/:** Estructura docs/ creada según skill @mega-ia-team/
- **Plataforma QWS:** En fase de definición de infraestructura

### Infraestructura Actual
- Staging: N/A (GitHub Pages como único entorno)
- Producción: ✅ GitHub Pages activo via `.github/workflows/deploy.yml`
- Futuro: Docker Swarm en VPS propio o infraestructura cloud

### Deuda Técnica
- N/A

---

## 📋 Próximos Pasos

### Para la Siguiente Sesión
1. 👤 Leader: Aprobar Épica QWS-E1 y stack Docker Swarm propuesto
2. 🤖 Arch: Crear ADR-001: Migración de Static Export a SSR con Docker Swarm
3. 🤖 Arch: Crear ADR-002: Selección de stack de datos (PostgreSQL + Redis + MinIO)
4. 🤖 DevLead: Iniciar historia QWS-E1-H1 (stack Docker Swarm)

### Pendientes del Leader
- [ ] Aprobar stack Docker Swarm propuesto
- [ ] Aprobar Épica QWS-E1: Infraestructura Docker Swarm
- [ ] Definir proveedor de infraestructura (VPS, cloud, on-premise)
- [ ] Definir dominio definitivo (quelves.com ya apunta a algo?)

---

## 🧠 Contexto Importante para Recordar

### Patrones del Proyecto (Legacy — Site Estático)
- Usar Tailwind CSS para todo el styling (no CSS modules salvo justificación)
- Datos en `site/lib/data.ts`, contenido en `/content/`
- Páginas con Framer Motion requieren `"use client"`
- Static export: `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`
- `basePath: "/profile"` para GitHub Pages

### Patrones del Proyecto (Futuro — QWS Plataforma)
- Next.js 16 con SSR (sin static export)
- PostgreSQL + Prisma ORM para modelo relacional
- Redis para sesiones y cache
- MinIO para almacenamiento de objetos
- Auth.js / NextAuth para autenticación
- Docker Swarm para orquestación
- Traefik para ingress/reverse proxy

### Preferencias del Leader
- Basar stack en referencias Mega (salpla, megott)
- Seguridad: secrets externos, no hardcodear credenciales
- Observabilidad: Prometheus + Grafana obligatorio
- Escalabilidad: mínimo 2 réplicas para servicios stateless

### Lecciones Aprendidas
- N/A
