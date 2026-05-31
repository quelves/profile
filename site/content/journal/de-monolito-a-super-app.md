---
title: "De Monolito a Super App: Feature Flags como Estrategia de Evolución"
date: "2025-03-15"
category: "Enterprise Architecture"
excerpt: "Cómo evolucionamos la app OTT #1 de Chile en una Super App sin reescribir una sola línea de código legacy — usando Feature Flags, arquitectura Shell + Micro-Apps y un enfoque evolutivo que trata el código existente como activo, no como pasivo."
tags: ["Super App", "Feature Flags", "Arquitectura Evolutiva", "Micro-Frontends", "Mobile"]
lang: "es"
---

La decisión más costosa en arquitectura de software no es elegir la tecnología equivocada. Es decidir reescribir código funcional porque ya no encaja en tu visión.

Cuando Megamedia decidió evolucionar MEGA GO desde una app pura de streaming OTT hacia una Super App integrando Noticias, Social, Shop y Radios, el equipo de ingeniería enfrentó un dilema clásico: ¿bifurcar el código base y construir en paralelo, o extender la plataforma existente con evolución controlada?

Elegimos evolución. Este artículo explica por qué, y cómo los Feature Flags se convirtieron en el mecanismo arquitectónico central que lo hizo posible.

## La Decisión: Bifurcar vs. Feature Flag

El enfoque convencional para la evolución mayor de una plataforma es binario: mantener el sistema antiguo mientras construyes el nuevo, luego cortar. Esto crea varios problemas:

- **Esfuerzo duplicado**: Dos equipos manteniendo codebases paralelas
- **Riesgo de divergencia**: Las correcciones de bugs en el sistema antiguo no se propagan al nuevo
- **Fragmentación de usuarios**: Los usuarios de la app antigua se pierden las nuevas funcionalidades
- **Inconsistencia de datos**: Dos apps escribiendo a los mismos backends con diferentes esquemas

Analizamos ambos enfoques usando ocho criterios (costo, tiempo, riesgo, experiencia de usuario, deuda técnica, capacidad del equipo, capacidad de rollback y consistencia de datos). Los Feature Flags ganaron en seis de ocho dimensiones.

## La Arquitectura Shell + Micro-Apps

La arquitectura Super App MEGA (SAM) trata la app MEGA GO existente como un **shell** que hospeda **micro-apps**:

```
┌─────────────────────────────────────────┐
│           Super App MEGA                │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │   OTT   │ │  News   │ │  Social  │  │
│  │ (legacy)│ │  (new)  │ │  (new)   │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│  ┌─────────┐ ┌─────────┐              │
│  │  Shop   │ │  Radio  │              │
│  │  (new)  │ │  (new)  │              │
│  └─────────┘ └─────────┘              │
└─────────────────────────────────────────┘
```

Cada micro-app es un módulo autocontenido con:
- Grafo de navegación independiente
- Configuración de build independiente
- Ciclo de release independiente
- Capa de auth compartida (Lazy Login)
- Pipeline de analytics compartida

El shell provee:
- Navegación inferior entre micro-apps
- Gestión de identidad de usuario y sesiones
- Evaluación de Feature Flags
- Deep linking cross-app
- Componentes de UI comunes

## Lazy Login: El Patrón Anonymous-First

Una de las decisiones arquitectónicas más consequenciales en SAM es **Lazy Login**. Los usuarios pueden navegar contenido, leer noticias y escuchar radio sin crear una cuenta. Los datos se almacenan localmente y se asocian a un ID anónimo.

Cuando el usuario eventualmente inicia sesión, el sistema migra:
- Historial de visualización
- Favoritos
- Preferencias de radio
- Carrito de compras
- Seguimientos sociales

Este patrón aumenta la conversión dramáticamente. En el contexto OTT, los usuarios que navegan antes de suscribirse tienen 3x mayor retención que aquellos forzados a registrarse inmediatamente.

La migración no es trivial. Usamos un sistema de identidad basado en grafos (Neo4j) que rastrea relaciones entre IDs anónimos, usuarios registrados, dispositivos y perfiles. Cuando ocurre el login, el recorrido del grafo identifica todos los datos huérfanos y los re-asigna bajo el usuario autenticado.

## Feature Flags como Arquitectura

Los Feature Flags en SAM no son solo para A/B testing. Son el mecanismo principal para controlar qué micro-apps son visibles para qué usuarios en qué plataformas:

```yaml
mega_shop:
  enabled: true
  platforms:
    android: { minVersion: "2.0.0", rollout: 100 }
    ios: { minVersion: "2.0.0", rollout: 50 }
    web: { minVersion: "1.5.0", rollout: 100 }
  userSegments: ["premium", "free_trial"]
  
mega_news:
  enabled: true
  platforms:
    android: { minVersion: "1.8.0", rollout: 100 }
    ios: { minVersion: "1.8.0", rollout: 100 }
  dependencies: ["mega_id_v2"]
```

Este enfoque declarativo permite que los product managers controlen el rollout sin intervención de ingeniería. Cuando una nueva micro-app está lista, el flag se habilita. Si se encuentra un bug crítico, el flag se deshabilita — ocultando instantáneamente la micro-app de todos los usuarios sin desplegar una nueva versión de la app.

## Module Federation para Compartir Código

Para las capas web y React Native PoC, usamos Module Federation 2.0 (vía Re.Pack) para compartir código entre el módulo OTT legacy y las nuevas micro-apps:

- Componentes compartidos del design system
- Utilidades de auth compartidas
- Hooks de analytics compartidos
- Clientes API compartidos

Esto reduce el tamaño del bundle y asegura consistencia. Cuando el equipo de diseño actualiza el color del botón primario, el cambio se propaga a todas las micro-apps sin actualizaciones individuales.

## La Mentalidad de Evolución

La filosofía central de SAM está capturada en ADR-001: **"Extender, no Reemplazar."**

Cada decisión arquitectónica se evalúa contra este principio:
- ¿Podemos agregar la nueva funcionalidad sin modificar código existente?
- ¿Podemos enrutar alrededor de componentes legacy usando adaptadores?
- ¿Podemos deprecar gradualmente en lugar de eliminar inmediatamente?

Esta mentalidad trata el código existente como un activo. El módulo MEGA GO OTT — 2,690 líneas de lógica de reproductor, probado en batalla a través de 150K usuarios concurrentes — no es deuda técnica. Es una ventaja competitiva que las nuevas micro-apps heredan gratis.

## Métricas de Evolución

Después de 10 meses de desarrollo evolutivo:

- Cero downtime durante los rollouts de micro-apps
- 100% de las funcionalidades legacy OTT permanecen funcionales
- Las nuevas micro-apps (News, Social) alcanzaron producción en 4 meses cada una
- La retención de usuarios aumentó 23% debido al engagement multi-vertical
- Un equipo de 7 ingenieros (consolidado de 12) mantiene toda la plataforma

## La Lección

Reescribir código a veces es necesario. Pero debería ser la última opción, no la primera. Los Feature Flags, la arquitectura Shell + Micro-Apps y los patrones Lazy Login permiten que las plataformas evolucionen orgánicamente — agregando nuevas capacidades mientras se preserva la confiabilidad de lo que ya funciona.

La Super App no es un destino. Es un proceso continuo de evolución controlada.
