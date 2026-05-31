# ROADMAP.md — Estrategia, Alcance e Impactos

> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)  
> **Skill:** @mega-ia-team/ v3.14.0  
> **Última actualización:** 2026-05-31  
> **Actualizado por:** 🤖 PO + 👤 Leader

---

## 🗺️ Visión Estratégica

Evolución de la presencia digital de Luiz Quelves Da Silva en dos fases bien definidas:

```
FASE 1 (AHORA) ──────────────────────────────────────────────────────────────
"Presencia digital inmediata y profesional"
→ Site estático, rápido, elegante, multilenguaje
→ Deploy en GitHub Pages, cero costo de infraestructura
→ Contenido markdown gestionado en repo

FASE 2 (FUTURO) ─────────────────────────────────────────────────────────────
"Plataforma ejecutiva de autoridad"
→ CMS administrable con workflow editorial
→ AI Studio para generar, revisar y traducir contenido
→ Docker Swarm con observabilidad completa
→ Dominio propio (quelves.com)
```

---

## 📅 Roadmap por Track

### Track 1: LQDS — Site Estático

| Release | Fecha | Alcance | Impacto |
|---------|-------|---------|---------|
| **v0.1** | 2026-05 | Bootstrap del proyecto, skill mega-ia-team, estructura docs | ✅ Listo |
| **v0.9** | 2026-06 | Mejoras de performance, SEO, contenido actualizado | 🟡 En planificación |
| **v1.0** | 2026-06 | Release estable, Lighthouse > 90, deploy automático | 🔴 Pendiente |

### Track 2: QWS — Plataforma Fullstack

| Release | Fecha | Alcance | Impacto |
|---------|-------|---------|---------|
| **v0.1** | 2026-06 | Infraestructura Docker Swarm desplegada | 🔴 Planificado |
| **v0.2** | 2026-07 | Modelo de datos, autenticación, sitio público migrado | 🔴 Planificado |
| **v0.3** | 2026-07 | CMS Admin funcional | 🔴 Planificado |
| **v0.4** | 2026-08 | AI Studio integrado | 🔴 Planificado |
| **v1.0** | 2026-08 | SEO, multidioma, testing, seguridad, release | 🔴 Planificado |

---

## 🔗 Dependencias entre Tracks

```
LQDS v1.0 ───────────────────────────────────────►
     │                                              │
     ├── Contenido ────────────────────────────────┤
     ├── Diseño visual / Design System ────────────┤
     └── Experiencia de usuario ───────────────────┤
                                                   ▼
                                          QWS Sitio Público
                                          QWS CMS + AI Studio
                                          QWS v1.0 Release
```

**Regla:** QWS no reemplaza LQDS hasta que QWS v1.0 esté aprobado por el Leader.

---

## 📊 Métricas de Éxito

| Métrica | LQDS Target | QWS Target | Medición |
|---------|------------|-----------|----------|
| Lighthouse Performance | > 90 | > 90 | Lighthouse CI |
| Lighthouse Accessibility | > 90 | > 90 | Lighthouse CI |
| Tiempo de carga (TTFB) | < 1s | < 200ms | Web Vitals |
| Cobertura de tests | N/A | > 70% | Jest/Vitest |
| Uptime | 99% (GitHub Pages) | 99.9% | Grafana |

---

## 🎯 Decisiones de Alcance Pendientes

| Decisión | Estado | Opciones |
|----------|--------|----------|
| Proveedor de VPS/Cloud para QWS | 🔴 Pendiente | AWS, DigitalOcean, Hetzner, VPS propio |
| Proveedor LLM para AI Studio | 🔴 Pendiente | OpenAI, Anthropic, Gemini, Kimi |
| Estrategia de backup de PostgreSQL | 🔴 Pendiente | Daily snapshots, pg_dump, replica |

---

*Documento mantenido por 🤖 PO + 👤 Leader*  
*Actualizar cuando cambien prioridades o release plan*
