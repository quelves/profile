# DASHBOARD.md — Estado del Proyecto

> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31

---

## 🚦 Estado General

```
┌───────────────────────────────────────────────────────────────────────────┐
│  DUAL TRACK — Estado Global                                               │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  TRACK 1: LQDS — Site Estático          TRACK 2: QWS — Plataforma        │
│  ████████████████████████████████████   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  Bootstrap: 100% ✅                     Planificación: 15% 🟡           │
│  Foco Actual: 🔥 DEPLOY RÁPIDO          Fase: 📋 PLANIFICACIÓN          │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Métricas por Track

| Métrica | LQDS (Track 1) | QWS (Track 2) |
|---------|----------------|---------------|
| Build exitoso | ✅ Sí (static export) | ⚪ N/A |
| Deploy activo | ✅ GitHub Pages | 🔴 Planificado |
| Cobertura tests | ⚪ N/A | ⚪ N/A |
| Lighthouse Score | 🟡 Por medir | ⚪ N/A |
| Stack definido | ✅ Sí | ✅ Sí |
| Infraestructura | ✅ GitHub Actions | 🟡 Diseñada |

---

## 📋 Épicas por Track

### Track 1: LQDS (Site Estático)

| Épica | Estado | Progreso | Dueño | SP |
|-------|--------|----------|-------|----|
| LQDS-E1: Mejoras del Site | 🟡 Propuesta | 0% | 🤖 DevLead | TBD |
| LQDS-E2: Release v1.0 | 🔴 Pendiente | 0% | 🤖 DevLead | TBD |

### Track 2: QWS (Plataforma)

| Épica | Estado | Progreso | Dueño | SP |
|-------|--------|----------|-------|----|
| QWS-E1: Infra Docker Swarm | 🟡 Planificada | 0% | 🤖 Arch | 40 |
| QWS-E2: Modelo de Datos | 🔴 Pendiente | 0% | 🤖 DB Lead | TBD |
| QWS-E3: Autenticación | 🔴 Pendiente | 0% | 🤖 Arch | TBD |
| QWS-E4: Sitio Público | 🔴 Pendiente | 0% | 🤖 DevFE | TBD |
| QWS-E5: CMS Admin | 🔴 Pendiente | 0% | 🤖 DevFE | TBD |
| QWS-E6: AI Studio | 🔴 Pendiente | 0% | 🤖 DevBE | TBD |
| QWS-E7: SEO + Multidioma | 🔴 Pendiente | 0% | 🤖 DevFE | TBD |
| QWS-E8: Testing + Release | 🔴 Pendiente | 0% | 🤖 QA | TBD |

---

## 🐝 Modo Swarm

**Estado:** Inactivo

---

## 🔧 Infraestructura

| Entorno | Plataforma | URL | Track | Estado |
|---------|-----------|-----|-------|--------|
| Producción LQDS | GitHub Pages | `https://quelves.github.io/profile/` | LQDS | ✅ Activo |
| Producción QWS | Docker Swarm | `https://quelves.com` | QWS | 🔴 Planificado |
| Monitor QWS | Grafana | `https://monitor.quelves.com` | QWS | 🔴 Planificado |
| Storage QWS | MinIO | `https://storage.quelves.com` | QWS | 🔴 Planificado |

---

## 📝 Notas

- Proyecto reorganizado a **Dual Track** (LQDS + QWS)
- **Track 1 (LQDS)** es el foco actual: deploy rápido y simple
- **Track 2 (QWS)** es planificación: no codear sin aprobación Leader
- `site/` contiene el proyecto estático actual
- `platform/qws/` contiene el stack Docker Swarm diseñado
- `docs/epics/` separa épicas LQDS y QWS

---

*Documento mantenido por 🤖 Scribe*
