---
title: "Sistemas Distribuidos en Producción: Qué 60M de Registros de Salud Me Enseñaron sobre Escala OTT"
date: "2025-04-20"
category: "Enterprise Architecture"
excerpt: "Los mismos principios de sistemas distribuidos que apliqué construyendo el registro nacional de salud de Brasil para 60 millones de usuarios en 1998 son los que uso hoy para plataformas OTT sirviendo 150K espectadores concurrentes. Algunos patrones son atemporales."
tags: ["Sistemas Distribuidos", "CORBA", "Microservicios", "Escalabilidad", "Arquitectura"]
lang: "es"
---

En 1998 construí un sistema distribuido usando CORBA, COM/DCOM y Delphi para registrar 60 millones de usuarios en el Sistema Único de Salud (SUS) de Brasil. En 2024 diseñé una arquitectura híbrida on-premise/cloud para una plataforma OTT sirviendo 150K usuarios concurrentes durante eventos en vivo.

Las tecnologías no podrían ser más diferentes. Los principios son idénticos.

Este artículo conecta dos décadas de práctica en sistemas distribuidos — desde componentes CORBA hasta microservicios Kubernetes — a través de los patrones que trascienden cualquier stack tecnológico específico.

## Patrón 1: Los Límites de Servicio lo Definen Todo

En 1998, el registro SUS usaba CORBA para desacoplar:
- **Servicio de Identidad**: Matching de personas a través de 60M registros
- **Servicio de Compensación**: Procesamiento de reembolsos médicos
- **Servicio de Agendamiento**: Reserva de citas

Cada servicio tenía su propio modelo de datos, su propia unidad de despliegue, y se comunicaba vía ORB (Object Request Broker). Los límites eran físicos — procesos separados en servidores separados.

En 2024, MEGA GO usa la misma lógica de límites:
- **OTT API**: Catálogo de contenido y streaming
- **PAY API**: Procesamiento de suscripciones y pagos
- **SSO API**: Autenticación e identidad
- **MDS API**: Entrega de medios y DRM

El protocolo de comunicación cambió de CORBA IIOP a HTTP/REST y gRPC. La filosofía de límites no.

**Lección**: Los límites de servicio deben dibujarse alrededor de capacidades de negocio, no de capas técnicas. El Servicio de Identidad en 1998 y el Servicio SSO en 2024 hacen lo mismo: responder la pregunta "¿quién es este usuario?"

## Patrón 2: La Transparencia de Ubicación Crea Flexibilidad

La promesa central de CORBA era la transparencia de ubicación: un cliente llama a un método en un objeto sin saber si ese objeto está en el mismo proceso, otro proceso en la misma máquina, o un servidor a través de la red.

En 1998, esto nos permitió comenzar con despliegue monolítico (todos los servicios en un servidor) y distribuir gradualmente a medida que la carga aumentaba — sin cambiar el código cliente.

En 2024, Kubernetes entrega la misma promesa a través de Service Discovery y DNS. Un microservicio llama `http://ott-api:8080` sin saber si el objetivo es un pod en el mismo nodo, otro nodo en el mismo cluster, o un pod en una región diferente.

**Lección**: Diseña para transparencia de ubicación desde el día uno. La capacidad de mover servicios sin cambiar los llamadores es la fundación de la arquitectura escalable.

## Patrón 3: Las Falacias de la Computación Distribuida Siguen Doliendo

Las Ocho Falacias de la Computación Distribuida de Peter Deutsch fueron publicadas en 1994. Siguen siendo la fuente principal de outages en producción en 2024:

| Falacia | Lección 1998 | Lección 2024 |
|---------|--------------|--------------|
| La red es confiable | Timeouts de CORBA durante horas pico de hospitales | Reintentos HTTP durante eventos en vivo |
| La latencia es cero | Overhead de marshaling ORB | Latencia de service mesh Kubernetes |
| El ancho de banda es infinito | Conexiones de hospital de 64Kbps | Requisitos de streaming 4K HDR |
| La red es segura | Sin TLS en CORBA | Service mesh zero-trust |
| La topología no cambia | Reubicaciones de servidor rompían referencias | Reprogramación de pods cambia IPs |
| Hay un administrador | TI federal + estatal + hospital | Equipos de Plataforma + DevOps + SRE |
| El costo de transporte es cero | Licencias de ORB | Cargos de egress cloud |
| La red es homogénea | HP-UX + Windows + Solaris | Nodos x86 + ARM + GPU |

Cada sistema distribuido que he construido — 1998 o 2024 — eventualmente violó al menos tres de estas falacias en producción.

**Lección**: Las falacias no son teóricas. Son el checklist que deberías revisar antes de cada decisión arquitectónica.

## Patrón 4: La Gestión de Estado Es el Problema Difícil

En 1998, el registro SUS usaba el servicio de objetos persistentes de Orbix para mantener estado a través de reinicios de servidor. En 2024, MEGA GO usa:

- **PostgreSQL**: Estado transaccional (suscripciones, pagos, perfiles de usuario)
- **MongoDB**: Catálogo de contenido (esquema flexible para tipos de medios diversos)
- **Redis**: Estado de sesión y rate limiting (acceso sub-milisegundo)
- **Neo4j**: Grafo de identidad (relaciones entre usuarios, dispositivos, perfiles)
- **Firestore**: Configuración en tiempo real y feature flags

La tecnología cambió. El problema no: **¿cómo mantienes consistencia a través de estado distribuido?**

En 1998 usábamos two-phase commit a través de servicios CORBA. En 2024 usamos el patrón Saga a través de microservicios. Ambos enfoques tienen trade-offs:

- **2PC**: Consistencia fuerte, pero bloqueante y frágil bajo partición
- **Saga**: Consistencia eventual, pero resiliente y no bloqueante

Para el flujo de pago de MEGA GO, usamos Saga: PAY API procesa el cargo, emite un evento PaymentCompleted, OTT API extiende la suscripción, SSO API actualiza los derechos. Si algún paso falla, transacciones compensatorias hacen rollback de los pasos anteriores.

**Lección**: No hay una respuesta universal para el estado distribuido. Elige modelos de consistencia basados en requisitos de negocio, no en preferencias tecnológicas.

## Patrón 5: La Observabilidad No Es Opcional

En 1998, depurar un sistema CORBA distribuido significaba leer logs de ORB a través de múltiples servidores y correlacionar timestamps manualmente. Una sola queja de usuario podía tomar días de rastreo.

En 2024, MEGA GO usa:
- **Distributed tracing** (OpenTelemetry) a través de las siete APIs
- **Logging estructurado** (JSON) con correlation IDs
- **Métricas** (Prometheus) para latencia, throughput y tasas de error
- **Real-user monitoring** (Youbora) para experiencia de calidad de video

Cuando un usuario reporta buffering durante el Festival de Viña, podemos rastrear el path exacto de la solicitud: dispositivo → CDN → MDS API → servidor de licencias DRM → reproducción. El tiempo de identificación de causa raíz cayó de días a minutos.

**Lección**: Construye observabilidad dentro de la arquitectura, no como una reflexión posterior. Cada límite de servicio debe emitir telemetría que pueda ser correlacionada a través del sistema distribuido.

## Los Principios Atemporales

Después de 25 años construyendo sistemas distribuidos, estos principios permanecen constantes:

1. **Límites alrededor de capacidades de negocio**, no capas técnicas
2. **Transparencia de ubicación** como restricción de diseño
3. **Respetar las falacias** — te morderán
4. **Elegir modelos de consistencia** basados en necesidades de negocio
5. **La observabilidad es arquitectura**, no infraestructura

Las tecnologias cambiarán de nuevo. CORBA dio paso a SOAP, luego REST, luego gRPC, luego GraphQL. Los principios no.
