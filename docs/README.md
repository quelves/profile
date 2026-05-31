# docs/ — Documentación del Proyecto

> **Skill:** @mega-ia-team/ v3.14.0  
> **Proyecto:** Profile / Portfolio Project (LQDS)

---

## 📁 Índice de Áreas

| Área | Descripción | Owner |
|------|-------------|-------|
| [`epics/`](epics/) | Épicas self-contained del portfolio | 🤖 PO + 🤖 Arch |
| [`architecture/`](architecture/) | Arquitectura, ADRs y diagramas | 🤖 Arch |
| [`testing/`](testing/) | Estrategia y reportes de calidad | 🤖 QA |
| [`operations/`](operations/) | Runbooks y operaciones | 🤖 SRE |

---

## 📄 Archivos Principales

| Archivo | Propósito | Owner |
|---------|-----------|-------|
| [`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md) | Plan maestro: fases, milestones, dependencias | 🤖 Arch + 🤖 PO |
| [`EPICS-AND-HISTORIES.md`](EPICS-AND-HISTORIES.md) | Índice y resumen de todas las épicas | 🤖 PO |
| [`DASHBOARD.md`](DASHBOARD.md) | Estado visual del proyecto | 🤖 Scribe |

---

## 🔄 Ciclo de Vida

- **Al crear épica:** Crear carpeta en `epics/[SIGLA]-EXX-nombre/`
- **Al crear historia:** Crear spec package en `epics/[SIGLA]-EXX-nombre/stories/HN-*.md`
- **Al aprobar ADR:** Agregar a `architecture/ADRS/`
- **Al release:** Actualizar `operations/runbooks/` si es necesario

---

*Estructura basada en @mega-ia-team/references/docs-structure-guide.md*
