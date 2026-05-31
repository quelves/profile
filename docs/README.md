# docs/ — Documentación del Proyecto

> **Skill:** @mega-ia-team/ v3.14.0  
> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)

---

## 📁 Índice de Áreas

| Área | Descripción | Owner |
|------|-------------|-------|
| [`epics/`](epics/) | Épicas self-contained (LQDS y QWS) | 🤖 PO + 🤖 Arch |
| [`architecture/`](architecture/) | Arquitectura, ADRs y diagramas | 🤖 Arch |
| [`testing/`](testing/) | Estrategia y reportes de calidad | 🤖 QA |
| [`platform/`](platform/) | Infraestructura QWS (Docker Swarm) | 🤖 SRE + 🤖 DevOps |
| [`operations/`](operations/) | Runbooks y operaciones | 🤖 SRE |

---

## 📄 Archivos Principales

| Archivo | Propósito | Owner |
|---------|-----------|-------|
| [`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md) | Plan maestro: fases, milestones, dependencias | 🤖 Arch + 🤖 PO |
| [`EPICS-AND-HISTORIES.md`](EPICS-AND-HISTORIES.md) | Índice y resumen de todas las épicas | 🤖 PO |
| [`DASHBOARD.md`](DASHBOARD.md) | Estado visual del proyecto | 🤖 Scribe |
| [`CONTEXT.md`](../CONTEXT.md) | Contexto estratégico: OKRs, stakeholders | 🤖 PO + 👤 Leader |
| [`ROADMAP.md`](../ROADMAP.md) | Estrategia, alcance por release | 🤖 PO + 👤 Leader |

---

## 🔄 Ciclo de Vida

- **Al crear épica:** Crear carpeta en `epics/[SIGLA]-EXX-nombre/`
- **Al crear historia:** Crear spec package en `epics/[SIGLA]-EXX-nombre/stories/HN-nombre/HN-nombre.md`
- **Al aprobar ADR:** Agregar a `architecture/ADRS/`
- **Al release:** Actualizar `operations/runbooks/` si es necesario

---

*Estructura basada en @mega-ia-team/references/docs-structure-guide.md*
