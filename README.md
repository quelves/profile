# Quelves Platform — Dual Track

> **Skill:** `@mega-ia-team/` v3.14.0  
> **Repositorio:** `git@github.com:quelves/profile.git`

---

## 🎯 Qué es este proyecto

Repositorio dual que alberga dos tracks de desarrollo para la marca ejecutiva de **Luiz Quelves Da Silva**:

| Track | Nombre | Descripción | Ruta |
|-------|--------|-------------|------|
| **Track 1** | **LQDS** | Site estático profesional — deploy rápido y simple | [`site/`](site/) |
| **Track 2** | **QWS** | Plataforma fullstack con CMS y AI Studio — infraestructura robusta | [`platform/qws/`](platform/qws/) |

---

## 🚀 Cómo empezar

### Para trabajar en Track 1 (LQDS — Site Estático)

```bash
cd site
npm install
npm run dev      # Desarrollo local
npm run build    # Build estático para producción
npm run lint     # ESLint
```

**Deploy:** GitHub Actions → GitHub Pages (automático al hacer push a `main`)

### Para trabajar en Track 2 (QWS — Plataforma)

> ⚠️ **Track 2 requiere aprobación explícita del Leader.** No implementar sin autorización.

Ver [`platform/docs/README.md`](platform/docs/README.md) y [`docs/epics/QWS-E1-infraestructura-docker-swarm/`](docs/epics/QWS-E1-infraestructura-docker-swarm/)

---

## 📁 Estructura del repositorio

```
.
├── site/                           ← Track 1: LQDS (Next.js static)
│   ├── app/                        ← Páginas Next.js 16 App Router
│   ├── components/                 ← React components
│   ├── content/journal/            ← 59 artículos markdown
│   ├── lib/                        ← data.ts, i18n.ts, utils.ts
│   ├── messages/                   ← Traducciones (es, en, pt)
│   └── .github/workflows/deploy.yml ← CI/CD GitHub Pages
│
├── platform/                       ← Track 2: QWS infraestructura
│   ├── qws/
│   │   └── docker-swarm-stack.yml  ← Stack Docker Swarm
│   └── docs/
│       └── README.md               ← Documentación de plataforma
│
├── content/                        ← Contenido markdown fuente de verdad
│   ├── about.md
│   ├── experience.md
│   ├── projects.md
│   └── ...
│
├── docs/                           ← Documentación del proyecto
│   ├── IMPLEMENTATION-PLAN.md      ← Plan maestro dual track
│   ├── EPICS-AND-HISTORIES.md      ← Índice de épicas
│   ├── DASHBOARD.md                ← Estado visual del proyecto
│   ├── epics/                      ← Épicas self-contained
│   ├── architecture/               ← ADRs y diagramas
│   ├── testing/                    ← Estrategia de testing
│   └── operations/                 ← Runbooks
│
├── AGENTS.md                       ← 🤖 Configuración del equipo IA
├── MEMORY.md                       ← 🧠 Memoria viva del proyecto
├── SESSION-STATE.md                ← ⚡ Estado técnico inmediato
├── CONTEXT.md                      ← 🌍 Contexto estratégico
├── ROADMAP.md                      ← 🗺️ Estrategia y alcance
└── .gitignore                      ← Archivos ignorados por git
```

---

## 📚 Documentación clave

| Documento | Propósito |
|-----------|-----------|
| [`AGENTS.md`](AGENTS.md) | Equipo de agentes IA, roles, reglas |
| [`MEMORY.md`](MEMORY.md) | Memoria activa del proyecto (checkpoint CP-0) |
| [`SESSION-STATE.md`](SESSION-STATE.md) | Estado técnico inmediato |
| [`CONTEXT.md`](CONTEXT.md) | Contexto estratégico: OKRs, métricas, stakeholders |
| [`ROADMAP.md`](ROADMAP.md) | Estrategia, alcance por release, planificación |
| [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md) | Plan maestro: fases, milestones, dependencias |
| [`docs/EPICS-AND-HISTORIES.md`](docs/EPICS-AND-HISTORIES.md) | Índice de épicas e historias |
| [`docs/DASHBOARD.md`](docs/DASHBOARD.md) | Estado visual del proyecto |

---

## 🤖 Skill obligatorio

Este proyecto opera bajo el skill `@mega-ia-team/` v3.14.0 con:

- **SDD obligatorio:** Specification Package aprobado antes de feature start
- **TDD obligatorio:** Tests antes o junto al código
- **BDD obligatorio:** Criterios de aceptación en Given/When/Then
- **Checkpoint Protocol:** CP-0 a CP-8
- **Aprobación del Leader:** Requerida para commits, merges, ADRs, deploys

---

## ⚡ Comandos rápidos del Leader

```bash
# Track 1 (LQDS)
"Iniciar LQDS-E1-H1 en modo swarm"
"Estado del proyecto"
"Mostrar épicas activas"

# Track 2 (QWS) — requiere aprobación
"Crear épica QWS-E2: [nombre]"
"Aprobar story start de QWS-E1-H1"
"Auditar proyecto existente"
```

---

*Proyecto mantenido por el equipo de agentes IA bajo supervisión del Leader Humano.*  
*Skill: @mega-ia-team/ v3.14.0 — Checkpoint Protocol obligatorio*
