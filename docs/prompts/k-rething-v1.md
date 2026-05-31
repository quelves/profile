Sí. Te dejo un **prompt maestro** para enviar a Kimi Code u otro agente de código. Está pensado para crear **quelves.com** como sitio profesional + CMS + asistente LLM para crear, revisar y publicar contenido.

Tu posicionamiento debe destacar experiencia ejecutiva, transformación digital, IA, arquitectura empresarial, plataformas OTT, cloud-native, investigación y liderazgo regional, tal como aparece en tus materiales actuales.   

Actúa como arquitecto full-stack senior, diseñador UX/UI ejecutivo y especialista en CMS con IA.

Necesito construir el sitio profesional **quelves.com** para Luiz Quelves Da Silva, Technology Transformation Executive, orientado a posicionarlo para roles C-Level regionales como CTO, CIO, VP Technology, Chief Digital Officer y Director de Transformación Digital.

## Objetivo del proyecto

Crear una plataforma profesional, moderna y escalable que funcione como:

1. Sitio institucional/personal de marca ejecutiva.
2. Centro de publicaciones, artículos, insights y research.
3. Repositorio de logros, proyectos, experiencia y casos de impacto.
4. Plataforma futura para advisory/consultoría.
5. CMS administrable con integración LLM para crear, revisar, editar, traducir y publicar contenido.

## Posicionamiento de marca

La narrativa central debe ser:

“Technology Transformation Executive especializado en AI, Digital Platforms, Enterprise Architecture, Media Technology y Autonomous Systems.”

El sitio debe destacar:

* 25+ años de experiencia en tecnología.
* Liderazgo en transformación digital.
* Experiencia en plataformas digitales, OTT, medios y cloud-native.
* Arquitectura empresarial, DevOps, IA y sistemas autónomos.
* Experiencia ejecutiva en Megamedia, Mega GO, plataformas LATAM y proyectos de gran escala.
* Perfil académico/investigador: PhD Candidate, Process Mining, publicaciones IEEE/ResearchGate.
* Potencial futuro como advisor o consultor estratégico.

## Stack recomendado

Usar una arquitectura moderna, mantenible y escalable:

### Frontend

* Next.js 15+ con App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Diseño responsive
* Dark/light mode opcional
* SEO avanzado
* Soporte multidioma: ES, EN, PT

### Backend / CMS

* Next.js API routes o backend separado con NestJS
* PostgreSQL como base de datos principal
* Prisma ORM
* Autenticación con NextAuth/Auth.js
* Roles: admin, editor, reviewer
* Upload de imágenes/documentos
* Versionado de contenidos
* Estados de publicación: draft, in_review, approved, published, archived

### IA / LLM

Integrar un módulo de asistencia con LLM para:

* Generar artículos desde ideas o notas.
* Reescribir artículos en tono ejecutivo.
* Crear versiones LinkedIn.
* Crear versiones largas para blog.
* Traducir entre español, inglés y portugués.
* Revisar gramática y claridad.
* Mejorar tono C-Level.
* Sugerir títulos SEO.
* Generar extractos, meta descriptions y keywords.
* Crear estructura de whitepapers.
* Convertir experiencia profesional en casos de impacto.
* Generar borradores de publicaciones sobre IA, transformación digital, cloud, OTT, arquitectura empresarial y liderazgo tecnológico.

El sistema debe permitir configurar proveedor LLM vía variables de entorno:

* OpenAI compatible API
* Anthropic compatible API
* Gemini compatible API
* Kimi compatible API

No dejar claves hardcodeadas.

## Secciones públicas del sitio

Crear las siguientes páginas:

### 1. Home

Debe tener diseño ejecutivo, similar al screenshot enviado:

* Hero oscuro profesional.
* Logo QUELVES.
* Tagline: “Technology & AI”.
* Headline: “Technology Transformation Executive”.
* Subheadline: “Transforming organizations through AI, Digital Platforms and Enterprise Architecture.”
* CTAs: Impact, Insights, Research, Advisory.
* Métricas destacadas:

  * 25+ years in technology leadership
  * 1.9M+ downloads in digital platforms
  * 150K+ concurrent users
  * LATAM platform consolidation
  * PhD Candidate / Research background

### 2. Impact

Mostrar logros como casos de impacto:

* Mega GO OTT Platform
* Mega Sales Platform
* LATAM Platform Consolidation
* Search Engines / Solr / Lucene
* National Health Registry / 60M users
  Cada caso debe seguir:
  Problem → Strategic Decision → Architecture → Business Impact → Lessons Learned.

### 3. Insights

Blog/artículos con categorías:

* AI & Autonomous Systems
* Digital Transformation
* Media Technology
* Enterprise Architecture
* Leadership
* Cloud-Native Platforms
* Executive Strategy

### 4. Research

Mostrar:

* PhD research
* Autonomous Enterprise Systems
* Process Mining
* IEEE publications
* ResearchGate
* Academic background
* Current research thesis direction:
  “Self-Integration and Self-Correction in Enterprise Systems using Intelligent Agents.”

### 5. Advisory

Página futura para consultoría:

* CIO Advisory
* AI Strategy
* Digital Transformation
* Enterprise Architecture
* Technology Due Diligence
* Platform Modernization
* Executive Mentoring

Debe poder estar activa, pero sin parecer que vende agresivamente.

### 6. Speaking

Página para:

* conferencias
* podcasts
* webinars
* entrevistas
* temas sugeridos para charlas

Aunque inicialmente no tenga eventos, dejar estructura preparada.

### 7. About

Biografía ejecutiva:

* experiencia
* investigación
* liderazgo
* visión sobre IA
* trayectoria LATAM
* contacto

### 8. Contact

Formulario de contacto con:

* nombre
* email
* empresa
* motivo
* mensaje

Enviar notificación por email configurable.

## CMS / Admin

Crear un panel administrativo privado en `/admin`.

Funcionalidades:

### Dashboard

* cantidad de artículos
* artículos en draft
* artículos publicados
* visitas básicas
* próximos contenidos sugeridos
* tareas pendientes

### Content Manager

CRUD completo para:

* Articles
* Insights
* Case Studies
* Research Items
* Publications
* Speaking Events
* Advisory Services
* Pages estáticas
* Media Library

### Editor

Debe incluir:

* editor rich text o markdown avanzado
* preview en vivo
* SEO fields
* slug automático editable
* idioma
* categoría
* tags
* estado
* fecha publicación
* featured image
* versión LinkedIn
* versión newsletter
* versión larga
* versión corta

### AI Assistant

Dentro del admin crear módulo “AI Studio” con opciones:

1. Crear artículo desde una idea.
2. Mejorar artículo existente.
3. Convertir nota técnica en artículo ejecutivo.
4. Convertir proyecto profesional en caso de impacto.
5. Traducir contenido ES/EN/PT.
6. Generar post LinkedIn desde artículo.
7. Revisar tono C-Level.
8. Sugerir calendario editorial.
9. Crear resumen ejecutivo.
10. Crear whitepaper outline.

Cada generación debe guardar:

* prompt usado
* respuesta generada
* modelo usado
* fecha
* usuario
* contenido fuente
* versión creada

### Workflow editorial

Implementar flujo:

Draft → AI Review → Human Review → Approved → Published.

El admin debe permitir comparar versiones.

## Modelo de datos sugerido

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

## Requisitos de diseño

El diseño debe ser:

* ejecutivo
* sobrio
* moderno
* premium
* tecnológico
* minimalista
* muy profesional

Inspiración visual:

* McKinsey / BCG / Gartner para claridad ejecutiva
* Linear / Vercel para estética tecnológica
* Paleta azul navy, blanco, gris y acento azul eléctrico
* Tipografía moderna
* Mucho espacio en blanco
* Cards elegantes
* Animaciones suaves
* Diseño mobile-first

## Requisitos técnicos

* SEO completo con metadata dinámica.
* Open Graph para compartir artículos.
* Sitemap automático.
* RSS feed.
* Soporte multidioma.
* URLs limpias.
* Optimización Lighthouse.
* Seguridad básica:

  * rate limiting
  * protección CSRF
  * validación Zod
  * sanitización de contenido
  * roles y permisos
* Dockerfile y docker-compose para desarrollo.
* Preparar despliegue en VPS, Vercel o infraestructura propia.
* Documentar instalación.

## Contenido inicial

Cargar contenido inicial desde estos archivos/documentos del proyecto:

* about.md
* positioning-strategy.md
* experience.md
* projects.md
* education.md
* skills.md
* transformation.md
* leadership.md
* project-evaluation.md
* mega-sales-platform-analysis.md
* CVs y PDFs cargados

Crear seed inicial de base de datos con:

* home content
* about
* 5 case studies
* 6 categorías de insights
* 5 artículos borrador sugeridos
* research profile
* advisory services

## Artículos iniciales sugeridos

Crear drafts para:

1. From Process Mining to Autonomous Enterprise Systems
2. How AI Will Transform Media Companies in Latin America
3. From OTT Platforms to AI-Driven Digital Ecosystems
4. Why Enterprise Architecture Becomes Strategic in the AI Era
5. Self-Healing Enterprise Systems: The Next Frontier of Digital Transformation

## Entregables esperados

1. Código completo del proyecto.
2. README con instrucciones.
3. Modelo de base de datos.
4. Panel admin funcional.
5. AI Studio funcional con proveedor LLM configurable.
6. Sitio público responsive.
7. Seed de contenido inicial.
8. Docker compose.
9. Guía para publicar en producción.
10. Lista de próximos pasos técnicos.

Antes de implementar, revisa la arquitectura propuesta y genera un plan de trabajo por fases. Luego implementa fase por fase, validando que el sitio compile y funcione correctamente.

También te recomiendo agregarle esta instrucción al agente: **“No inventes métricas nuevas; usa solo las provistas en los documentos y deja campos editables cuando falte validación.”**
