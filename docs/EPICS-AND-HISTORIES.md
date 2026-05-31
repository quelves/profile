# EPICS-AND-HISTORIES.md — Índice de Épicas

> **Proyecto:** Quelves Platform (QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31

---

## 📦 Épicas Activas / Propuestas

| Código | Nombre | Estado | SP | Historias | % |
|--------|--------|--------|----|-----------|---|
| QWS-E1 | Infraestructura Docker Swarm | 🟡 Propuesta | 40 | 8 | 0% |

---

## 📦 Épicas Planificadas

| Código | Nombre | Estado | SP | Target |
|--------|--------|--------|----|--------|
| QWS-E2 | Modelo de Datos y Prisma ORM | 🔴 Pendiente | TBD | M2 |
| QWS-E3 | Autenticación y Autorización | 🔴 Pendiente | TBD | M2 |
| QWS-E4 | Sitio Público | 🔴 Pendiente | TBD | M3 |
| QWS-E5 | Panel Admin / CMS | 🔴 Pendiente | TBD | M4 |
| QWS-E6 | AI Studio | 🔴 Pendiente | TBD | M4 |
| QWS-E7 | SEO, Multidioma y Publicación | 🔴 Pendiente | TBD | M5 |
| QWS-E8 | Testing, Seguridad y Release | 🔴 Pendiente | TBD | M5 |

---

## 📝 Historias de QWS-E1

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

- **Épica:** `QWS-E[N]` — Ej: `QWS-E1`
- **Historia:** `QWS-E[N]-H[N]` — Ej: `QWS-E1-H1`
- **Branch épica:** `feature/epic/QWS-E[N]`
- **Branch historia:** `feature/QWS-E[N]-H[N]`

---

*Documento mantenido por 🤖 PO*
