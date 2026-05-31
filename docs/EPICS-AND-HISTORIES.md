# EPICS-AND-HISTORIES.md — Índice de Épicas

> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31

---

## 📦 TRACK 1: LQDS — Site Estático (Foco Actual)

| Código | Nombre | Estado | SP | Target |
|--------|--------|--------|----|--------|
| LQDS-E1 | Mejoras del Site Estático | 🟡 Propuesta | TBD | M1 |
| LQDS-E2 | Release Site Estático v1.0 | 🔴 Pendiente | TBD | M2 |

### Historias planificadas LQDS-E1
| ID | Historia | Estado | Agente | SP |
|----|----------|--------|--------|----|
| LQDS-E1-H1 | Verificar y fixear workflow de GitHub Pages deploy | 🔴 | 🤖 SRE | TBD |
| LQDS-E1-H2 | Mejorar performance (Lighthouse > 90) | 🔴 | 🤖 DevFE | TBD |
| LQDS-E1-H3 | Optimizar SEO (metadata, sitemap, robots.txt) | 🔴 | 🤖 DevFE | TBD |
| LQDS-E1-H4 | Ajustes responsive y accesibilidad (a11y) | 🔴 | 🤖 DevFE | TBD |
| LQDS-E1-H5 | Actualizar contenido desde markdowns en `content/` | 🔴 | 🤖 PO | TBD |
| LQDS-E1-H6 | Revisar y optimizar imágenes/assets | 🔴 | 🤖 UI/UX | TBD |

---

## 📦 TRACK 2: QWS — Plataforma Fullstack (Fase 2)

| Código | Nombre | Estado | SP | Target |
|--------|--------|--------|----|--------|
| QWS-E1 | Infraestructura Docker Swarm | 🟡 Planificada | 40 | M3 |
| QWS-E2 | Modelo de Datos y Prisma ORM | 🔴 Pendiente | TBD | M4 |
| QWS-E3 | Autenticación y Autorización | 🔴 Pendiente | TBD | M4 |
| QWS-E4 | Sitio Público (migración desde LQDS) | 🔴 Pendiente | TBD | M5 |
| QWS-E5 | Panel Admin / CMS | 🔴 Pendiente | TBD | M5 |
| QWS-E6 | AI Studio | 🔴 Pendiente | TBD | M6 |
| QWS-E7 | SEO, Multidioma y Publicación | 🔴 Pendiente | TBD | M6 |
| QWS-E8 | Testing, Seguridad y Release | 🔴 Pendiente | TBD | M6 |

### Historias QWS-E1 (Planificadas)
| ID | Historia | Estado | Agente | SP |
|----|----------|--------|--------|----|
| QWS-E1-H1 | Diseñar y documentar stack Docker Swarm completo | 🔴 | 🤖 Arch | 5 |
| QWS-E1-H2 | Configurar PostgreSQL con secrets, volumen y healthcheck | 🔴 | 🤖 DB Lead | 5 |
| QWS-E1-H3 | Configurar Redis para cache, sesiones y rate limiting | 🔴 | 🤖 DB Lead | 3 |
| QWS-E1-H4 | Configurar MinIO como object storage para media assets | 🔴 | 🤖 Arch | 3 |
| QWS-E1-H5 | Configurar observabilidad: Prometheus + Grafana + exporters | 🔴 | 🤖 SRE | 5 |
| QWS-E1-H6 | Configurar Traefik labels y routing para servicios | 🔴 | 🤖 SRE | 3 |
| QWS-E1-H7 | Crear scripts de inicialización de secrets y configs | 🔴 | 🤖 DevOps | 3 |
| QWS-E1-H8 | Crear runbooks de operación y deploy | 🔴 | 🤖 SRE | 3 |

---

## 🏷️ Convención de Nombres

### Track 1: LQDS
- **Épica:** `LQDS-E[N]` — Ej: `LQDS-E1`
- **Historia:** `LQDS-E[N]-H[N]` — Ej: `LQDS-E1-H1`
- **Branch épica:** `feature/epic/LQDS-E[N]`
- **Branch historia:** `feature/LQDS-E[N]-H[N]`

### Track 2: QWS
- **Épica:** `QWS-E[N]` — Ej: `QWS-E1`
- **Historia:** `QWS-E[N]-H[N]` — Ej: `QWS-E1-H1`
- **Branch épica:** `feature/epic/QWS-E[N]`
- **Branch historia:** `feature/QWS-E[N]-H[N]`

---

*Documento mantenido por 🤖 PO*
