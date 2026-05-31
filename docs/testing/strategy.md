# strategy.md — Estrategia de Testing

> **Proyecto:** Profile / Portfolio Project (LQDS)  
> **Skill:** @mega-ia-team/ v3.14.0

---

## 🎯 Objetivos

1. Garantizar que el build estático (`npm run build`) se genera sin errores.
2. Verificar funcionalidad de componentes React con tests unitarios.
3. Validar flujos de usuario con tests E2E.
4. Asegurar accesibilidad (a11y) y performance (Core Web Vitals).

---

## 🧪 Pirámide de Testing

```
        /\
       /  \   E2E (Playwright)
      /____\     └─ Flujos completos de navegación
     /      \      Accesibilidad (axe)
    /________\     Visual regression
   /          \
  / Integration \  Tests de integración
 /______________\   └─ Componentes con Next.js
/                \
/   Unit Tests    \  Jest / Vitest
/__________________\   └─ Lógica de utilidades
                       └─ Componentes aislados
```

---

## 📊 Cobertura Mínima

| Tipo | Cobertura Mínima | Herramienta |
|------|-----------------|-------------|
| Unit | 70% | Jest / Vitest |
| Integration | 60% | React Testing Library |
| E2E | 100% de flujos críticos | Playwright |

---

## 🔧 Herramientas

| Propósito | Herramienta | Configuración |
|-----------|-------------|---------------|
| Unit Testing | Jest / Vitest | `site/` (por configurar) |
| Component Testing | React Testing Library | `site/` (por configurar) |
| E2E | Playwright | `site/` (por configurar) |
| Linting | ESLint | `site/eslint.config.mjs` |
| Accesibilidad | axe-core / Lighthouse CI | Por configurar |

---

## 🚀 Gates de Calidad

1. **Pre-commit:** `npm run lint` debe pasar sin errores.
2. **Pre-PR:** `npm run build` debe generar export estático sin errores.
3. **Pre-merge:** Cobertura unitaria ≥ 70%.
4. **Pre-deploy:** Lighthouse Score ≥ 90 en Performance, Accessibility, Best Practices.

---

*Mantenido por 🤖 QA*
