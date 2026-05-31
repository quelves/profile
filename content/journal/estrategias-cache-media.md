---
title: "Estrategias de Caché para Plataformas de Medios de Alta Concurrencia"
date: "2025-05-12"
category: "Enterprise Architecture"
excerpt: "Una jerarquía de caché probada en producción para plataformas OTT: desde caché HTTP cliente y base de datos Room en el dispositivo, pasando por Redis y CDN en el edge, hasta índices en memoria en el cluster de búsqueda."
tags: ["Cache", "Redis", "CDN", "Performance", "OTT"]
lang: "es"
---

El caché es la optimización de rendimiento más efectiva en plataformas de medios — y la fuente más común de bugs sutiles. Este artículo describe la jerarquía de cuatro capas de caché que usamos en Megamedia, desde el dispositivo del usuario hasta el servidor de origen, y las decisiones que determinan qué va dónde.

## Capa 1: Caché HTTP del Cliente

La primera línea de defensa es el caché integrado de OkHttp en el dispositivo Android. Cada respuesta de API incluye headers de cache-control que le indican al cliente cuánto tiempo puede reusar la respuesta sin revalidar:

```
Cache-Control: max-age=3600, stale-while-revalidate=86400
```

Esto significa:
- Durante la primera hora, la respuesta se sirve desde caché de disco sin ninguna solicitud de red
- Durante las siguientes 24 horas, la respuesta stale se sirve inmediatamente mientras una solicitud en segundo plano la refresca

Para el catálogo de contenido de MEGA GO — que solo cambia cuando se publica nuevo contenido — esto reduce la carga de API en ~70% durante navegación normal. La API de catálogo sirve 10K+ RPS en pico; con caché del cliente, solo ~3K alcanzan el origen.

**Decisión clave**: Usa `stale-while-revalidate` agresivamente para datos inmutables (metadatos de contenido, árboles de categoría) y conservadoramente para datos mutables (suscripciones de usuario, historial de visualización).

## Capa 2: Base de Datos Local (Room)

No todos los datos encajan en el modelo de solicitud/respuesta HTTP. Las preferencias de usuario, historial de visualización, metadatos de contenido descargado y favoritos requieren almacenamiento local estructurado.

MEGA GO usa Room con la siguiente estrategia de caché:

- **Write-through**: Cada acción de usuario escribe a Room inmediatamente, luego sincroniza con la API remota en segundo plano
- **Read-first**: Cada lectura golpea Room primero; si los datos están stale (>5 minutos para suscripciones, >1 hora para catálogo), un refresh en segundo plano se activa
- **Eviction**: Evicción LRU con límite de 100MB; los metadatos de contenido descargado nunca son evictados

Este patrón permite que la app funcione completamente offline. Un usuario en un vuelo puede navegar el catálogo, gestionar favoritos e incluso encolar descargas — todo usando datos de Room. Cuando la conectividad retorna, la cola de sync reconcilia cambios locales con el servidor.

**Decisión clave**: Room no es solo un caché. Es el almacén de datos primario para el cliente, con la API remota tratada como un target de sincronización.

## Capa 3: Redis (Caché Edge)

En la capa de infraestructura, Redis sirve tres roles de caché distintos:

**Caché de Sesión**: Tokens OAuth2 y derechos de usuario. Con 150K usuarios concurrentes durante eventos en vivo, validar cada solicitud contra Keycloak abrumaría el servidor SSO. Redis cachea decisiones de derechos con TTL de 5 minutos, reduciendo la carga de SSO en ~90%.

**Rate Limiting**: Contadores de ventana deslizante por usuario y por API. Redis almacena contadores con resolución de 1 minuto, previniendo abuso sin escrituras a base de datos.

**Caché de Feature Flags**: Firebase Remote Config se cachea en Redis con TTL de 15 minutos. Esto previene que la app móvil martillee Firestore en cada cold start — un problema real con 1.9M instalaciones activas.

**Decisión clave**: Los TTLs de Redis deben ser más cortos que tu tolerancia para datos stale. Un derecho stale de 5 minutos es aceptable; un estado de pago stale de 5 minutos no lo es.

## Capa 4: CDN (Content Delivery Network)

Para contenido de video, el CDN es el caché. MEGA GO usa una estrategia multi-CDN:

- **CDN Primario**: Huawei Cloud CDN para América Latina (menor latencia para usuarios chilenos)
- **CDN Failover**: AWS CloudFront para alcance global y redundancia
- **Origin Shield**: Una capa de caché entre CDNs y origen que absorbe cache misses

Los segmentos de video (archivos HLS .ts, DASH .m4s) se cachean en nodos edge del CDN por 24 horas. Los archivos de manifiesto (.m3u8, .mpd) se cachean por 30 segundos con stale-while-revalidate — lo suficientemente corto para permitir inserción de anuncios mid-stream, lo suficientemente largo para prevenir sobrecarga del origen.

Durante el Festival de Viña 2026, el CDN sirvió 94% del tráfico de video desde caché edge. Solo 6% de las solicitudes alcanzaron el origen — la diferencia entre sobrevivir el evento y una falla en cascada.

**Decisión clave**: El TTL de caché para segmentos de video debe coincidir con tu frecuencia de actualización de contenido. Los eventos en vivo necesitan TTLs de manifiesto cortos; los catálogos VOD pueden usar TTLs de segmento largos.

## El Problema de Invalidación de Caché

El problema más difícil en ciencias de la computación no es nombrar cosas o invalidar caché. Es **saber qué capa de caché está stale**.

Cuando un productor de contenido actualiza el título de una película, el cambio se propaga a través de:
1. PostgreSQL (origen) → 2. Caché OTT API → 3. Caché Redis edge → 4. Caché CDN → 5. Caché HTTP cliente → 6. Base de datos Room

Cada capa tiene su propio TTL y mecanismo de invalidación. Sin una estrategia de invalidación coordinada, los usuarios ven datos inconsistentes a través de dispositivos y sesiones.

Nuestra solución es **invalidación dirigida por eventos**:
- Actualización de contenido → evento Kafka → workers de invalidación de caché → purge de Redis + llamadas a API de purge de CDN
- La app móvil recibe notificación push de Firebase → activa refresh de caché local en el próximo lanzamiento
- La app web usa WebSocket para recibir mensajes de invalidación en tiempo real

**Decisión clave**: No confíes solo en TTL para datos mutables. Usa eventos de invalidación explícitos para contenido que cambia impredeciblemente.

## Las Métricas que Importan

La efectividad del caché se mide por **tasa de hit** en cada capa:

| Capa | Tasa de Hit Objetivo | Actual (Pico) |
|------|---------------------|---------------|
| HTTP Cliente | 60% | 73% |
| Room (lectura) | 80% | 85% |
| Redis | 85% | 91% |
| CDN (video) | 90% | 94% |

Una mejora de 1% en la tasa de hit del CDN ahorra aproximadamente $2,000/mes en costos de egress del origen a nuestra escala.

## La Lección

El caché no es una optimización de rendimiento que agregas después. Es una dimensión arquitectónica que diseñas desde el día uno. Cada path de acceso a datos debe tener una estrategia de caché: qué cachear, dónde cachearlo, cuánto tiempo mantenerlo, y cómo invalidarlo cuando las cosas cambian.

La jerarquía — cliente → base de datos local → caché edge → CDN — no es única de plataformas de medios. Pero los stakes son más altos cuando un solo cache miss durante un evento en vivo puede cascadar en una sobrecarga de origen que afecta a millones de espectadores.
