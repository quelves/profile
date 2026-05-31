Sí. Este prompt está adaptado para que Kimi Code cree el proyecto **por etapas**, usando el skill `mega-ia-team`, con SDD/TDD/BDD, memoria, épicas e historias antes de codear. El skill exige trabajar con Specification Package aprobado antes de iniciar features, usar Checkpoint Protocol y mantener documentación viva como `MEMORY.md`, `SESSION-STATE.md`, `ROADMAP.md` y épicas self-contained. 

Actúa como Kimi Code usando el skill `@mega-ia-team/`.

Necesito crear el proyecto **quelves.com**, un sitio profesional y plataforma de contenidos para Luiz Quelves Da Silva, orientado a posicionarlo como:

**Technology Transformation Executive | CTO/CIO Candidate | VP Technology | Digital Transformation Director | AI & Enterprise Architecture Advisor**

El proyecto debe construirse **por etapas**, siguiendo estrictamente el skill `mega-ia-team`:

* Spec-First / SDD obligatorio.
* No iniciar código sin Specification Package aprobado.
* TDD obligatorio: tests antes del código.
* BDD obligatorio: escenarios Given/When/Then.
* Code Review y Security Review secuenciales.
* Checkpoint Protocol obligatorio.
* Mantener `MEMORY.md`, `SESSION-STATE.md`, `ROADMAP.md`, `CONTEXT.md`, `AGENTS.md` y `docs/DASHBOARD.md`.
* Usar épicas self-contained.
* Requerir aprobación explícita del Leader Humano antes de cambios críticos, commits, merges, deploys o cambios de arquitectura.

## 1. Objetivo del producto

Crear una plataforma profesional para:

1. Presentar el perfil ejecutivo de Luiz Quelves.
2. Publicar artículos, insights, research y casos de impacto.
3. Centralizar publicaciones, LinkedIn, IEEE, ResearchGate y futuros contenidos.
4. Construir marca personal para roles C-Level regionales.
5. Habilitar una futura línea comercial de advisory/consultoría.
6. Permitir administración de contenido desde un panel privado.
7. Integrar un LLM para crear, revisar, traducir y mejorar artículos.

## 2. Nombre del proyecto

* Nombre: `quelves-platform`
* Dominio objetivo: `quelves.com`
* Código del proyecto: `QWS`
* Marca: `QUELVES`
* Tagline: `Technology & AI`

## 3. Posicionamiento

El sitio debe comunicar:

“Transforming organizations through AI, Digital Platforms and Enterprise Architecture.”

Debe reflejar un perfil de:

* CTO
* CIO
* VP Technology
* Director de Transformación Digital
* Advisor en AI, Enterprise Architecture y plataformas digitales

No debe parecer un CV tradicional. Debe parecer una plataforma ejecutiva de autoridad.

## 4. Stack técnico sugerido

Frontend:

* Next.js 15+
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Responsive design
* SEO avanzado
* Multidioma: ES, EN, PT

Backend/CMS:

* Next.js API routes o NestJS si el equipo lo justifica en ADR
* PostgreSQL
* Prisma ORM
* Auth.js / NextAuth
* Roles: admin, editor, reviewer
* Versionado de contenidos
* Workflow editorial

IA:

* Integración LLM configurable por variables de entorno
* Compatible con OpenAI API, Anthropic, Gemini o Kimi compatible API
* Nunca hardcodear API keys

DevOps:

* Dockerfile
* docker-compose
* Migraciones Prisma
* Seed inicial
* README de instalación
* Preparado para VPS, Vercel o infraestructura propia

## 5. Secciones públicas del sitio

Crear estas páginas:

### Home

Hero profesional oscuro, inspirado en el screenshot actual.

Debe incluir:

* QUELVES
* Technology Transformation Executive
* Transforming organizations through AI, Digital Platforms and Enterprise Architecture
* CTAs: Impact, Insights, Research, Advisory
* Métricas destacadas editables:

  * 25+ years leading technology transformation
  * LATAM digital platforms
  * OTT / Streaming / Media Technology
  * Cloud-native architectures
  * PhD Candidate / Research background

### Impact

Casos de impacto con estructura:
Problem → Strategic Decision → Architecture → Business Impact → Lessons Learned.

Casos iniciales:

* Mega GO OTT Platform
* Mega Sales Platform
* LATAM Platform Consolidation
* Search Engines / Solr / Lucene
* National Health Registry / 60M users

### Insights

Blog ejecutivo con categorías:

* AI & Autonomous Systems
* Digital Transformation
* Media Technology
* Enterprise Architecture
* Leadership
* Cloud-Native Platforms
* Executive Strategy

### Research

Debe mostrar:

* PhD Candidate
* Autonomous Enterprise Systems
* Process Mining
* IEEE Publications
* ResearchGate
* Current thesis direction:
  “Self-Integration and Self-Correction in Enterprise Systems using Intelligent Agents.”

### Advisory

Página futura para servicios:

* CIO Advisory
* AI Strategy
* Digital Transformation
* Enterprise Architecture
* Platform Modernization
* Technology Due Diligence
* Executive Mentoring

Debe verse profesional y consultiva, no agresivamente comercial.

### Speaking

Preparada para:

* conferencias
* podcasts
* webinars
* entrevistas
* temas sugeridos

### About

Biografía ejecutiva, no CV cronológico.

### Contact

Formulario con:

* nombre
* email
* empresa
* motivo
* mensaje

## 6. Panel administrativo `/admin`

Crear CMS privado con:

### Dashboard

* artículos publicados
* drafts
* contenidos en revisión
* mensajes recibidos
* próximos contenidos sugeridos

### Content Manager

CRUD para:

* Articles
* Case Studies
* Research Items
* Publications
* Speaking Events
* Advisory Services
* Static Pages
* Media Assets
* Contact Messages

### Editor

Debe soportar:

* markdown o rich text
* preview
* slug editable
* SEO title
* meta description
* idioma
* categoría
* tags
* estado
* featured image
* versión LinkedIn
* versión newsletter
* versión larga
* versión corta

### AI Studio

Crear módulo de IA para:

1. Crear artículo desde una idea.
2. Transformar experiencia profesional en caso de impacto.
3. Convertir nota técnica en artículo ejecutivo.
4. Mejorar tono C-Level.
5. Traducir ES/EN/PT.
6. Generar post de LinkedIn.
7. Crear resumen ejecutivo.
8. Sugerir títulos SEO.
9. Crear outline de whitepaper.
10. Revisar claridad, estrategia y posicionamiento.

Cada generación debe guardar:

* prompt usado
* modelo usado
* fecha
* usuario
* input original
* output generado
* contenido asociado
* versión creada

## 7. Workflow editorial

Implementar estados:

Draft → AI Review → Human Review → Approved → Published → Archived

Debe permitir comparar versiones.

## 8. Modelo de datos inicial

Crear entidades:

* User
* Role
* Article
* Category
* Tag
* ContentVersion
* AIRequestLog
* CaseStudy
* ResearchItem
* Publication
* SpeakingEvent
* AdvisoryService
* MediaAsset
* StaticPage
* ContactMessage
* NewsletterSubscriber

## 9. Requisitos de diseño

Diseño:

* ejecutivo
* sobrio
* premium
* moderno
* tecnológico
* minimalista

Inspiración:

* McKinsey / BCG / Gartner para claridad ejecutiva
* Linear / Vercel para estética tecnológica

Paleta:

* navy
* blanco
* gris
* azul eléctrico como acento

Evitar:

* diseño de CV tradicional
* exceso de íconos
* barras de progreso de skills
* páginas recargadas
* lenguaje demasiado técnico

## 10. Contenido inicial

Crear seed inicial con:

* Home
* About
* 5 Case Studies
* 6 categorías de Insights
* Research profile
* Advisory services
* 5 artículos en draft

Artículos draft iniciales:

1. From Process Mining to Autonomous Enterprise Systems
2. How AI Will Transform Media Companies in Latin America
3. From OTT Platforms to AI-Driven Digital Ecosystems
4. Why Enterprise Architecture Becomes Strategic in the AI Era
5. Self-Healing Enterprise Systems: The Next Frontier of Digital Transformation

No inventar métricas nuevas. Usar solo métricas entregadas por el Leader o dejar campos editables como `TBD`.

## 11. Forma de trabajo obligatoria por etapas

Antes de escribir código, ejecutar esta fase:

### Fase 0 — Inicialización documental

Crear:

* `README.md`
* `AGENTS.md`
* `MEMORY.md`
* `SESSION-STATE.md`
* `CONTEXT.md`
* `ROADMAP.md`
* `docs/README.md`
* `docs/IMPLEMENTATION-PLAN.md`
* `docs/EPICS-AND-HISTORIES.md`
* `docs/DASHBOARD.md`
* `.kimi/skill-config.yaml`

Luego pedir aprobación del Leader.

### Fase 1 — Product Discovery y arquitectura

Crear épicas self-contained:

* `QWS-E1-public-site`
* `QWS-E2-admin-cms`
* `QWS-E3-content-model`
* `QWS-E4-ai-studio`
* `QWS-E5-multilanguage-seo`
* `QWS-E6-devops-deployment`

Cada épica debe tener:

* README.md
* requirements.md
* analysis.md
* limitations.md
* stories/
* tests/epic-test-plan.md

Crear ADRs iniciales:

* ADR-001-tech-stack
* ADR-002-content-model
* ADR-003-auth-and-roles
* ADR-004-llm-provider-abstraction
* ADR-005-deployment-strategy

Pedir aprobación del Leader antes de avanzar.

### Fase 2 — Design System y sitio público

Implementar primero:

* layout
* navegación
* home
* about
* impact
* insights list
* research
* advisory
* contact

Usar TDD/BDD donde aplique.

### Fase 3 — CMS

Implementar:

* auth
* admin layout
* dashboard
* CRUD básico
* editor
* media library
* content workflow

### Fase 4 — AI Studio

Implementar:

* proveedor LLM configurable
* templates de prompts
* logs de generación
* revisión de contenido
* traducción
* generación de LinkedIn posts
* generación de artículos

### Fase 5 — SEO, multidioma y publicación

Implementar:

* ES/EN/PT
* metadata
* sitemap
* RSS
* Open Graph
* páginas públicas optimizadas
* flujo publish/unpublish

### Fase 6 — Testing, seguridad y release

Ejecutar:

* unit tests
* integration tests
* e2e tests básicos
* lint
* typecheck
* npm audit
* revisión de secrets
* reporte CodeRev
* reporte SecRev
* reporte QA
* documentación final

## 12. Reglas críticas

* No iniciar feature branch sin Specification Package aprobado.
* No hacer commits sin aprobación del Leader.
* No modificar arquitectura sin ADR.
* No crear métricas falsas.
* No publicar contenido sensible o confidencial.
* Todo contenido profesional debe ser editable desde CMS.
* Todo contenido generado por IA debe quedar como draft, nunca publicado automáticamente.
* El Leader Humano aprueba publicaciones.

## 13. Primera tarea

Inicia solamente con la **Fase 0 — Inicialización documental**.

No implementes código todavía.

Primero:

1. Detecta si el proyecto está vacío.
2. Crea la estructura documental mínima.
3. Define las épicas iniciales.
4. Crea el dashboard inicial.
5. Presenta el plan de implementación.
6. Solicita aprobación explícita del Leader para continuar con Fase 1.

Ese prompt ya obliga al agente a trabajar como programa serio, no como “hazme una web rápida”.
