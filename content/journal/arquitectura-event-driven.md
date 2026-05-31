---
title: "Arquitectura Orientada a Eventos: Cuando Kafka Encuentra Firebase"
date: "2025-06-18"
category: "Enterprise Architecture"
excerpt: "Cómo combinamos Kafka para streaming de eventos backend con Firebase para push de cliente en tiempo real para construir una arquitectura orientada a eventos que maneja 150K usuarios concurrentes sin perder un solo mensaje."
tags: ["Event-Driven", "Kafka", "Firebase", "Microservicios", "Arquitectura"]
lang: "es"
---

La arquitectura orientada a eventos es fácil de entender y difícil de operar. El concepto — los servicios se comunican produciendo y consumiendo eventos en lugar de llamarse directamente — es intuitivo. La realidad de garantizar entrega de mensajes, manejar backpressure y mantener ordenamiento a través de consumidores distribuidos es cualquier cosa menos intuitiva.

Este artículo describe cómo Megamedia combina dos sistemas de eventos — **Apache Kafka** para microservicios backend y **Firebase Cloud Messaging** para push de cliente — para crear una arquitectura híbrida de eventos que sirve 150K usuarios concurrentes durante eventos en vivo.

## ¿Por Qué Dos Sistemas de Eventos?

El backend necesita Kafka. El cliente necesita Firebase. Sirven propósitos diferentes:

| Dimensión | Kafka (Backend) | Firebase (Cliente) |
|-----------|-----------------|-------------------|
| **Throughput** | 1M+ mensajes/seg | 500K mensajes/seg |
| **Latencia** | Milisegundos | Segundos (best effort) |
| **Durabilidad** | Persistente (disco) | Efímero (memoria) |
| **Ordenamiento** | Garantizado a nivel de partición | Best effort |
| **Modelo de consumidor** | Pull (consumidores leen) | Push (servidor envía) |
| **Caso de uso** | Eventos servicio-a-servicio | Notificaciones servidor-a-cliente |

Usar ambos sistemas no es redundancia. Es especialización.

## La Columna Vertebral de Eventos Backend: Kafka

El backend de MEGA GO usa Kafka como el sistema nervioso central para comunicación cross-service. Los flujos de eventos core son:

### Flujo de Pagos
```
PAY API → PaymentInitiated → Kafka → OTT API (extender suscripción)
                           → Kafka → SSO API (actualizar derechos)
                           → Kafka → NOTIFY API (enviar recibo)
                           → Kafka → ANALYTICS (trackear ingresos)
```

Cuando un usuario se suscribe, la PAY API produce un único evento `PaymentInitiated`. Cuatro consumidores independientes lo procesan sin que la PAY API sepa que existen. Si agregamos un quinto consumidor mañana (digamos, una integración CRM), la PAY API requiere cero cambios.

Esta es la promesa de desacoplamiento de la arquitectura orientada a eventos: productores y consumidores evolucionan independientemente.

### Flujo de Publicación de Contenido
```
CMS → ContentPublished → Kafka → OTT API (actualizar catálogo)
                      → Kafka → MDS API (preparar streaming)
                      → Kafka → CDN (purge de caché)
                      → Kafka → SEARCH API (actualizar índice)
                      → Kafka → FIREBASE (notificar clientes)
```

Cuando un productor de contenido publica una nueva serie, cinco sistemas reaccionan simultáneamente. El CMS no llama cinco APIs. Produce un evento.

### Flujo de Evento en Vivo
```
LIVE STREAM → ViewerJoined → Kafka → ANALYTICS (contador en tiempo real)
            → ViewerLeft   → Kafka → ANALYTICS (actualizar contador)
            → StreamEnded  → Kafka → OTT API (actualizar catálogo)
                           → Kafka → CDN (purge de caché en vivo)
```

Durante el Festival de Viña, el sistema de analytics consume eventos `ViewerJoined` y `ViewerLeft` para mantener un contador en tiempo real de espectadores concurrentes. Este contador alimenta el sistema de auto-scaling que provisiona capacidad adicional de CDN cuando se exceden los umbrales.

## Configuración de Kafka para Producción

Nuestro cluster de Kafka corre en Huawei Cloud con la siguiente configuración de producción:

**Diseño de Topics**: Cada tipo de evento de negocio tiene su propio topic:
- `payments` (3 particiones, factor de replicación 3)
- `content-publications` (6 particiones, RF 3)
- `user-activities` (12 particiones, RF 3)
- `live-events` (6 particiones, RF 3)

El conteo de particiones está determinado por el paralelismo de consumidores. El topic `user-activities` tiene más particiones porque tiene más consumidores independientes (analytics, personalización, CRM, detección de fraude).

**Consumer Groups**: Cada servicio tiene su propio consumer group, permitiendo escalamiento independiente:
- `ott-api-consumer-group` (3 instancias)
- `analytics-consumer-group` (6 instancias)
- `notify-consumer-group` (2 instancias)

**Retención**: 7 días para la mayoría de topics, 30 días para `payments` (requisito de auditoría), 1 día para `live-events` (datos transitorios).

## La Capa de Eventos del Cliente: Firebase

Mientras Kafka maneja comunicación servicio-a-servicio, Firebase Cloud Messaging (FCM) maneja notificaciones push servidor-a-cliente:

**Tipos de Eventos Push a Clientes**:
- `NEW_CONTENT`: Nuevo episodio o película disponible
- `SUBSCRIPTION_EXPIRING`: Recordatorio 3 días antes de expiración
- `LIVE_EVENT_STARTING`: Festival de Viña comienza en 15 minutos
- `PERSONALIZED_RECOMMENDATION`: Sugerencia de contenido generada por IA
- `FEATURE_FLAG_CHANGE`: Nueva micro-app habilitada en Super App

Cada evento lleva un payload con URL de deep-link, título, cuerpo y URL de imagen. La app móvil recibe el push, muestra la notificación, y enruta al usuario a la pantalla correcta cuando se toca.

**Decisión Crítica**: FCM es entrega best-effort. Para eventos críticos de negocio (confirmaciones de pago), la app hace polling de la PAY API en el próximo lanzamiento para reconciliar. El push es una pista, no una garantía.

## El Puente: Cuando Kafka Encuentra Firebase

La pregunta arquitectónica interesante es: ¿cómo los eventos backend se convierten en pushes de cliente?

Usamos Firebase Cloud Functions como el puente:

```
Kafka → Cloud Function (disparada por connector de Kafka)
     → Evaluar: ¿debería este evento hacer push a clientes?
     → Sí: Consultar tokens FCM para usuarios afectados
     → Enviar mensajes FCM en batch
     → Loggear métricas de entrega
```

Por ejemplo, cuando el evento `ContentPublished` es consumido por la Cloud Function, esta:
1. Consulta la base de datos de usuarios para suscriptores del género de ese contenido
2. Agrupa tokens FCM en grupos de 500
3. Envía mensajes multicast vía FCM HTTP v1 API
4. Logea conteos de enviados/entregados/fallidos a BigQuery

Este patrón de puente separa responsabilidades: Kafka maneja confiabilidad backend, Firebase maneja alcance de cliente, y la Cloud Function maneja la traducción entre los dos mundos.

## Backpressure y el Problema de 150K

El problema más difícil de arquitectura orientada a eventos que enfrentamos fue el Festival de Viña 2026. En el pico, 150K usuarios se unieron al stream en vivo dentro de una ventana de 5 minutos. Esto produjo:
- 150K eventos `ViewerJoined`
- 150K verificaciones de autenticación
- 150K solicitudes de licencia DRM
- 150K cache misses de CDN edge (para usuarios en nuevas regiones)

El cluster de Kafka manejó el volumen de eventos fácilmente. Los consumidores downstream no.

El consumer group de analytics se retrasó 12 minutos porque sus inserts por lotes a BigQuery no podían mantener el ritmo. La solución fue triple:

1. **Aumentar instancias de consumidor**: 3 → 6 consumidores de analytics
2. **Optimización de tamaño de lote**: Reducir lote de BigQuery de 1,000 a 500 filas, aumentando frecuencia de flush
3. **Circuit breaker**: Cuando el lag excede 10 minutos, cambiar a sampling (procesar 1 de cada 10 eventos) hasta recuperarse

**Lección**: Las arquitecturas orientadas a eventos no eliminan problemas de escalamiento. Los mueven del productor al consumidor. Monitorea el lag del consumidor como tu métrica operativa principal.

## Ordenamiento vs. Paralelismo

Kafka garantiza ordenamiento dentro de una partición. Pero si necesitas ordenamiento global a través de todas las particiones, sacrificas paralelismo.

Para pagos, usamos el `userId` como partition key. Esto garantiza que todos los eventos para un único usuario se procesen en orden — crítico porque `PaymentInitiated` debe procesarse antes que `PaymentConfirmed`.

Para eventos en vivo, no necesitamos ordenamiento global. Los eventos `ViewerJoined` de diferentes usuarios no tienen relación causal. Usamos particionamiento round-robin para maximizar paralelismo.

**Lección**: No uses ordenamiento global por defecto. Usa partition keys que reflejen requisitos reales de causalidad.

## La Lección

La arquitectura orientada a eventos no se trata de elegir Kafka o Firebase. Se trata de diseñar sistemas donde los componentes se comunican a través de canales durables, observables y escalables en lugar de llamadas directas frágiles.

La combinación de Kafka para confiabilidad backend y Firebase para alcance de cliente ha demostrado ser resiliente a través de 150K usuarios concurrentes, 1.9M dispositivos activos y operaciones 24/7. Los eventos llevan el sistema hacia adelante — un mensaje a la vez.
