# testing/ — Estrategia y Reportes de Calidad

> **Proyecto:** Quelves Platform — Dual Track (LQDS + QWS)  
> **Skill:** @mega-ia-team/ v3.14.0

---

## 📁 Estructura

```
testing/
├── README.md              ← Este archivo
├── strategy.md            ← Estrategia de testing global
└── reports/               ← Reportes de cobertura, stress, etc.
    └── .gitkeep
```

---

## 🧪 Estrategia por Track

### Track 1: LQDS (Site Estático)

| Tipo | Herramienta | Cobertura | Responsable |
|------|-------------|-----------|-------------|
| Build Verification | `npm run build` | 100% pasando | 🤖 DevFE |
| Lint | ESLint | 0 errores | 🤖 DevFE |
| Lighthouse | Lighthouse CI | > 90 todas las categorías | 🤖 QA |
| Visual Regression | Playwright | Páginas críticas | 🤖 QA |
| Accesibilidad | axe-core | WCAG 2.1 AA | 🤖 QA |

### Track 2: QWS (Plataforma)

| Tipo | Herramienta | Cobertura | Responsable |
|------|-------------|-----------|-------------|
| Unit | Jest / Vitest | > 70% | 🤖 DevBE + 🤖 DevFE |
| Integration | React Testing Library | > 60% | 🤖 DevFE |
| E2E | Playwright | 100% flujos críticos | 🤖 QA |
| API | Supertest / tRPC test | > 70% | 🤖 DevBE |
| Security | npm audit + SAST | 0 vulnerabilidades críticas | 🤖 SecRev |
| Performance | k6 / Lighthouse | < 200ms TTFB | 🤖 QA |

---

## 📊 Reportes

| Reporte | Fecha | Estado |
|---------|-------|--------|
| N/A | N/A | N/A |

---

## 🚀 Gates de Calidad

1. **Pre-commit:** `npm run lint` debe pasar sin errores.
2. **Pre-PR (LQDS):** `npm run build` debe generar export estático sin errores.
3. **Pre-PR (QWS):** `docker build` y `npm run build` deben pasar.
4. **Pre-merge:** Cobertura unitaria ≥ 70%.
5. **Pre-deploy:** Lighthouse Score ≥ 90 en Performance, Accessibility, Best Practices.

---

*Mantenido por 🤖 QA*  
*Validación cruzada: 🤖 Arch verifica que la estrategia cubre los riesgos técnicos*
