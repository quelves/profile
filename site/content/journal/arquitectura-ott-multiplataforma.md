---
title: "Arquitectura OTT Multi-Plataforma a Escala: Lecciones de 1,9M de Descargas"
date: "2025-02-10"
category: "Enterprise Architecture"
excerpt: "Cómo diseñamos la arquitectura de MEGA GO para servir 1,9M+ descargas en 7 plataformas cliente — desde móvil Android hasta Smart TV, Roku y Web — manteniendo una única fuente de verdad para contenido, autenticación y monetización."
tags: ["OTT", "Android", "Microservicios", "DRM", "Arquitectura"]
lang: "es"
---

Cuando construyes una plataforma OTT que debe ejecutarse en teléfonos móviles, Android TV, Samsung Tizen, LG webOS, Roku, iOS y navegadores web — todas compartiendo el mismo catálogo de contenido, identidades de usuario y lógica de monetización — las decisiones arquitectónicas del mes uno determinan si sobrevives al mes doce.

Este artículo destila los patrones arquitectónicos que usamos en Megamedia para construir MEGA GO, la app #1 de Entretenimiento en Chile, que ahora sirve 1,91M+ descargas y maneja 150K usuarios concurrentes durante eventos en vivo como el Festival de Viña del Mar.

## La Base Multi-Módulo de Android

El ecosistema Android de MEGA GO está estructurado como un proyecto Gradle multi-módulo con separación clara de responsabilidades:

- **módulo mobile**: App para teléfono y tablet usando Material Design y Navigation Component
- **módulo tv**: App para Android TV usando Leanback UI, optimizada para navegación con D-Pad
- **módulo ottlib**: Biblioteca compartida (AAR) que contiene lógica de dominio, repositorios, clientes API y wrappers de reproductor
- **módulo navigation**: Biblioteca de componente de navegación reutilizable

Esta separación permite ciclos de release independientes. Cuando una corrección crítica de DRM necesita salir, podemos actualizar ottlib sin tocar las capas de UI móvil o TV. Cuando Samsung introduce un nuevo requisito de OS para TV, el módulo TV se adapta sin desestabilizar el móvil.

## MVVM + Repository + Observer: El Patrón Móvil

En la capa de UI, seguimos MVVM con LiveData:

```
UI (Activity/Fragment)
    ↓
ViewModel (LiveData)
    ↓
Repository
    ↓
┌───────┴───────┐
│               │
[Remote API]    [Local DB]
(Retrofit)      (Room)
```

El patrón Repository es crítico para la experiencia de usuario offline-first. Un usuario navegando contenido en el metro espera resultados inmediatos del caché de Room, con sincronización en segundo plano desde la API OTT cuando la conectividad retorna. Este patrón también simplifica el testing: los repositorios pueden ser mockeados, los ViewModels pueden ser unit-tested sin instrumentación Android.

## La Malla de APIs: Siete Backends, Una Experiencia

MEGA GO consume siete APIs distintas, cada una optimizada para su dominio:

| API | Dominio | Desafío de Escala |
|-----|---------|-------------------|
| OTT API | Catálogo de contenido, streaming | 10K+ RPS en pico |
| PAY API | Suscripciones, pagos | Consistencia financiera |
| MDS API | Entrega de medios, DRM | Sensible a latencia |
| MFB API | Integración Firebase | Sincronización en tiempo real |
| SSO (Keycloak) | Autenticación | 1,500 RPS validados |
| NOTIFY API | Notificaciones push | Ráfaga durante eventos en vivo |
| Analytics | Youbora, Firebase | Telemetría de alto volumen |

Cada API tiene ambientes de staging y desarrollo independientes. La app móvil cambia endpoints vía build variants (release, staging, debug), permitiendo que QA pruebe contra backends pre-productivos mientras los desarrolladores trabajan contra mocks locales.

## DRM: La Arquitectura Invisible

La Gestión de Derechos Digitales es donde la arquitectura OTT se vuelve genuinamente compleja. MEGA GO soporta tres sistemas DRM:

- **Widevine** (Android/Web): DRM de Google, con niveles de seguridad L1 (respaldado por hardware) y L3 (software)
- **FairPlay** (iOS/tvOS): DRM de Apple para el ecosistema Apple
- **PlayReady** (Smart TV/Roku): DRM de Microsoft para plataformas de TV

El flujo de licencia DRM es en sí mismo un sistema distribuido: solicitud de contenido → verificación de derechos → servidor de licencias → verificación de dispositivo → entrega de clave de descifrado. Cada paso agrega latencia. Durante el Festival de Viña 2026, con 150K usuarios concurrentes solicitando streams HD, el sistema DRM tuvo que sostener la entrega de licencias sin convertirse en cuello de botella.

Pre-buscamos licencias para el siguiente episodio durante la reproducción actual, reduciendo la latencia percibida a casi cero.

## Arquitectura de Publicidad: DAI, CSAI y el Stack de Ingresos

La monetización en MEGA GO opera en tres modos:

1. **Suscripción** (SVOD): Planes mensuales con acceso al catálogo completo
2. **Pago por evento** (TVOD): Compras únicas para eventos premium
3. **Publicidad** (AVOD): Nivel gratuito con anuncios

La arquitectura de publicidad soporta ambos:
- **CSAI** (Client-Side Ad Insertion): El stitching de anuncios ocurre en el reproductor cliente (ExoPlayer con IMA SDK)
- **DAI** (Dynamic Ad Insertion): El stitching de anuncios ocurre del lado del servidor, entregando un único manifiesto con anuncios ya insertados

DAI es crítico para plataformas de TV donde la inserción de anuncios del lado del cliente es poco confiable. La decisión arquitectónica de soportar ambos modos (documentada en ADR-001) significa que podemos elegir la estrategia óptima por plataforma en lugar de forzar un enfoque en todas partes.

## Qué Haría Diferente Hoy

Mirando la arquitectura con tres años de retrospectiva:

1. **Inyección de Dependencias**: No usamos Hilt/Dagger desde el inicio. Hoy inyectaría repositorios y clientes API para mejorar la testabilidad y reducir el uso de singletons.

2. **Jetpack Compose**: Toda la UI es basada en XML. Una migración a Compose reduciría el código de UI en ~40% y habilitaría bibliotecas de componentes compartidos entre móvil y TV.

3. **Límites de Módulo**: El módulo ottlib creció para contener demasiadas responsabilidades. Lo dividiría en módulos de feature (auth-lib, player-lib, analytics-lib) para mejorar el paralelismo de build y la autonomía del equipo.

4. **GraphQL**: Siete APIs REST significan siete formatos de respuesta diferentes. GraphQL con un gateway federado reduciría la complejidad de mapeo de datos del lado del cliente.

## La Lección Central

La arquitectura OTT multi-plataforma no se trata de elegir el stack tecnológico perfecto. Se trata de diseñar límites que permitan que cada plataforma evolucione independientemente mientras comparten la lógica de dominio que define tu producto.

El módulo ottlib — esa AAR compartida que contiene repositorios, clientes API y wrappers de reproductor — es la decisión arquitectónica más importante que tomamos. Convirtió siete plataformas cliente en un solo producto.
