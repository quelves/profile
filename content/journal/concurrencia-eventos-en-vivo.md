---
title: "Manejando 150K Usuarios Concurrentes: Estrategias de Concurrencia para Eventos en Vivo"
date: "2025-08-28"
category: "Enterprise Architecture"
excerpt: "Cómo MEGA GO sobrevivió al Festival de Viña 2026 con 150K usuarios concurrentes — las decisiones arquitectónicas, metodología de load testing y modos de falla que definieron el evento."
tags: ["Concurrencia", "Load Testing", "CDN", "Auto-scaling", "OTT"]
lang: "es"
---

La diferencia entre una plataforma que funciona a 1,000 usuarios y una que funciona a 150,000 usuarios no es optimización incremental. Es una categoría diferente de arquitectura.

Este artículo describe cómo MEGA GO manejó 150,000 espectadores concurrentes durante el Festival de Viña 2026 — el evento de música en vivo más grande de Chile — sin un solo minuto de downtime. Las estrategias descritas aplican a cualquier sistema de alta concurrencia: plataformas OTT, ventas flash de e-commerce, sistemas de ticketing y gaming online.

## El Perfil del Evento

El Festival de Viña tiene un patrón de tráfico único:

| Fase | Duración | Comportamiento de Usuario | Características de Carga |
|------|----------|---------------------------|--------------------------|
| **Pre-evento** | 60 min | Usuarios abren app, navegan, setean recordatorios | Rampa estable, calentamiento de caché |
| **Apertura** | 5 min | 80% de espectadores se unen simultáneamente | Ráfaga extrema, spike de autenticación |
| **Streaming en vivo** | 180 min | Visualización sostenida, chat, sharing social | Carga alta sostenida, dependiente de CDN |
| **Artista principal** | 15 min | Nuevos espectadores se unen, existentes se quedan | Mayor conteo concurrente |
| **Cierre** | 10 min | Salida masiva, solicitudes de replay | Cierre de conexiones, escrituras a storage |

El pico de 150K concurrentes ocurrió durante la presentación del artista principal — 15 minutos de carga sostenida que probó cada capa de la arquitectura.

## Estrategia 1: CDN como Defensa Principal

La decisión arquitectónica más importante para eventos en vivo es simple: **nunca sirvas video desde origen**.

Durante el Festival de Viña:
- 94% de los segmentos de video fueron servidos desde caché edge del CDN
- 6% alcanzaron el origen (cache misses para nuevas regiones edge)
- 0% del tráfico de video golpeó los servidores de aplicación

La arquitectura CDN usa una estrategia de múltiples tiers:

**Tier 1 — Nodos Edge**: 50+ puntos de presencia a través de América Latina. Cada nodo cachea segmentos HLS (archivos .ts) por 24 horas y archivos de manifiesto (.m3u8) por 30 segundos.

**Tier 2 — Origin Shield**: Una capa de caché entre nodos edge y el servidor de streaming origen. Cuando un nodo edge falla, solicita desde Origin Shield en lugar del origen directamente. Esto reduce la carga del origen en un 60% adicional.

**Tier 3 — Origen**: El servidor de streaming real (Huawei Cloud Media) que genera streams HLS desde encoding en vivo.

**Decisión Clave**: Pre-posicionar contenido en nodos edge antes del evento. Empujamos los primeros 5 minutos de segmentos del evento a todos los nodos edge 2 horas antes del inicio, asegurando cero cache misses durante la ráfaga de apertura.

## Estrategia 2: Autenticación en el Edge

La ráfaga de 5 minutos de apertura crea una avalancha de autenticación. 120,000 usuarios se autentican simultáneamente, cada uno requiriendo:
1. Validación de token OAuth2 contra Keycloak
2. Verificación de derechos (¿tiene este usuario acceso a eventos en vivo?)
3. Solicitud de licencia DRM
4. Inicialización de sesión

A 1,500 RPS, Keycloak puede manejar la carga. Pero a 25,000 RPS durante la ráfaga, colapsaría.

Nuestra solución es **pre-validación de tokens**:
- 30 minutos antes del evento, la app móvil refresca tokens y derechos en segundo plano
- Los tokens se cachean en Redis con TTL de 15 minutos
- Durante la ráfaga, el CDN valida firmas JWT localmente usando claves públicas cacheadas
- Solo 5% de las solicitudes alcanzan Keycloak (usuarios con tokens expirados)

Esto redujo el tráfico de autenticación de 120,000 solicitudes a 6,000 solicitudes — bien dentro de la capacidad de Keycloak.

## Estrategia 3: Auto-scaling con Calentamiento Predictivo

El auto-scaling estándar reacciona a métricas: cuando CPU > 70%, agregar instancias. Para eventos en vivo, el scaling reactivo es demasiado lento. Para cuando las métricas detectan carga, los usuarios ya están experimentando buffering.

Usamos **scaling predictivo**:

1. **Baseline histórico**: El Festival de Viña 2025 picó en 95K usuarios. Proyectamos 150K basados en gasto de marketing y crecimiento de instalaciones de app.

2. **Pre-scaling**: 2 horas antes del evento, provisionamos:
   - Capacidad CDN: 200% del pico proyectado
   - Servidores API: 300% de la capacidad normal
   - Conexiones de base de datos: 250% del pool normal
   - Cluster Redis: Agregamos 2 réplicas de lectura

3. **Scaling programado**: Usando políticas de scaling programado de Huawei Cloud, instancias se agregan en T-60 minutos, T-30 minutos, y T-5 minutos — coincidiendo con el patrón de rampa de tráfico.

4. **Fallback reactivo**: Si la carga real excede las proyecciones en 20%, el auto-scaling reactivo entra en acción con provisionamiento de instancias en 2 minutos.

**Decisión Clave**: Sobre-provisionar en lugar de optimizar. El costo de capacidad ociosa por 4 horas es insignificante comparado con el costo de un evento en vivo fallido.

## Estrategia 4: Degradación Graciosa

Cuando la carga excede la capacidad, el sistema debe degradar graciosamente en lugar de fallar catastróficamente. Definimos cuatro niveles de degradación:

**Nivel 0 — Normal**: Todas las funcionalidades operacionales. 100% calidad de video, chat en tiempo real, sharing social.

**Nivel 1 — Chat deshabilitado**: Cuando los usuarios concurrentes exceden 100K, Firebase Realtime Database throttlea. El chat se deshabilita con un banner: "¡Chat pausado por alta demanda. ¡Disfruta el show!"

**Nivel 2 — Reducción de calidad**: Cuando los nodos edge del CDN se acercan a capacidad, los clientes son instruidos a cambiar de HD a SD. Esto reduce el ancho de banda por usuario en 60% y aumenta la capacidad del CDN en 2.5x.

**Nivel 3 — Fallback regional**: Si un nodo regional del CDN falla, el tráfico se enruta al nodo saludable más cercano con ligeramente mayor latencia. Los usuarios experimentan una pausa de buffering de 2-3 segundos, luego la reproducción normal se reanuda.

**Nivel 4 — Modo emergencia**: Si el servidor de streaming origen falla, servimos los últimos 30 segundos de contenido bufferizado en loop mientras los ingenieros restauran el origen. Esto nunca ha sido necesario en producción.

**Decisión Clave**: Las decisiones de degradación están automatizadas basadas en métricas en tiempo real, no manuales. El tiempo de reacción humano es demasiado lento para eventos en vivo.

## Estrategia 5: Load Testing con Fidelidad de Producción

Probamos la capacidad del Festival de Viña usando k6 con un script de test que imitaba comportamiento de usuario real:

```javascript
export const options = {
  stages: [
    { duration: '60m', target: 50000 },   // Rampa pre-evento
    { duration: '5m', target: 150000 },    // Ráfaga de apertura
    { duration: '180m', target: 150000 },  // Carga sostenida
    { duration: '15m', target: 150000 },   // Artista principal
    { duration: '10m', target: 0 },        // Salida masiva
  ],
};
```

La infraestructura de test reflejaba producción:
- Misma configuración de CDN (dominio diferente)
- Mismos servidores API (cluster aislado)
- Mismas bases de datos (solo réplicas de lectura)
- Mismos servidores de licencia DRM (ambiente de staging)

**Hallazgo Crítico**: A 140K usuarios concurrentes, descubrimos que el pool de conexiones de la MDS API a MongoDB se estaba agotando. El tamaño del pool era 100 conexiones; a 140K usuarios, las queries concurrentes al catálogo excedían 100. Aumentamos el pool a 500 y agregamos connection pooling en la capa de aplicación (estilo PgBouncer para MongoDB).

Sin este test, el evento de producción habría fallado.

## Los Modos de Falla Que No Vimos

Cada evento en vivo tiene sorpresas. El Festival de Viña tuvo dos:

**Sorpresa 1 — Cambio geográfico**: 40% de los espectadores estaban en regiones que no habíamos visto en eventos previos (norte de Chile, áreas rurales). Estas regiones tenían nodos edge del CDN más pequeños que no fueron pre-calentados. Vimos una tasa de cache miss de 12% en estas regiones vs. 2% en Santiago. El próximo evento, pre-calentamos todos los nodos independientemente de patrones históricos.

**Sorpresa 2 — Diversidad de dispositivos**: 8% de los espectadores usaron dispositivos que no habíamos testeado (TVs Samsung antiguas, cajas Android genéricas). Estos dispositivos tenían diferentes capacidades DRM y soporte de formatos de stream. Agregamos lógica de detección de dispositivo y fallback de formato durante el evento — un cambio riesgoso que requirió deployment de emergencia. El próximo evento, testeamos los 50 modelos de dispositivos principales en lugar de los 20 principales.

## El Costo de la Escala

Ejecutar un evento en vivo a 150K usuarios concurrentes tiene costos de infraestructura reales:

| Componente | Día Normal | Festival de Viña | Incremento |
|------------|-----------|------------------|------------|
| Ancho de banda CDN | 15 TB/día | 850 TB/día | 57x |
| Servidores API | 6 instancias | 24 instancias | 4x |
| Base de datos | 2 réplicas | 6 réplicas | 3x |
| Redis | 3 nodos | 5 nodos | 1.7x |
| Licencias DRM | 50K/día | 180K/día | 3.6x |
| **Costo total** | $1,200/día | $48,000/día | 40x |

El costo de $48,000 del día del evento se recupera a través de ingresos publicitarios ($120K) y nuevas suscripciones ($85K) generadas durante el evento. Pero el modelo de costos requiere forecasting preciso — sobre-provisionar en 50% y la rentabilidad desaparece.

## La Lección

La arquitectura de alta concurrencia no se trata de manejar carga promedio. Se trata de manejar carga pico mientras se degrada graciosamente cuando las asunciones fallan.

Las estrategias que importan:
1. **CDN-first**: Sirve todo desde nodos edge
2. **Pre-validar auth**: Reduce autenticación en tiempo real al mínimo
3. **Scaling predictivo**: Provisiona antes del evento, no durante
4. **Degradación graciosa**: Define qué funcionalidades se apagan y en qué orden
5. **Testing con fidelidad de producción**: Testea con patrones reales de comportamiento de usuario, no carga sintética

El Festival de Viña 2026 demostró que estas estrategias funcionan. El Festival de Viña 2027 probará si aprendimos de las sorpresas.
