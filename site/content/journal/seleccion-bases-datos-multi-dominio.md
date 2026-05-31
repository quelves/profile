---
title: "Selección de Bases de Datos para Plataformas Multi-Dominio: ¿SQL, NoSQL o Ambas?"
date: "2025-07-22"
category: "Enterprise Architecture"
excerpt: "Cómo elegimos PostgreSQL, MongoDB, Redis, Neo4j y Firestore para diferentes dominios en la plataforma MEGA GO — y por qué usar una sola base de datos para todo usualmente es la respuesta equivocada."
tags: ["Bases de Datos", "PostgreSQL", "MongoDB", "Redis", "Neo4j", "Arquitectura"]
lang: "es"
---

El error más común de base de datos que veo en arquitectura de plataformas no es elegir la base de datos equivocada. Es elegir una sola base de datos para todo, luego forzar cada caso de uso a encajar en su modelo.

MEGA GO usa cinco bases de datos diferentes. Cada una sirve un dominio específico donde su modelo de datos provee una ventaja competitiva. Este artículo explica los criterios de selección, trade-offs y lecciones operacionales de ejecutar una arquitectura de persistencia políglota a escala.

## Marco Teórico: CAP y PACELC

Antes de elegir una base de datos, es necesario entender qué garantías puede ofrecer un sistema distribuido. El teorema CAP establece que en presencia de una partición de red, solo se pueden garantizar dos de tres propiedades: consistencia (C), disponibilidad (A) y tolerancia a particiones (P). PACELC extiende este marco: en operación normal (sin particiones), se debe elegir entre latencia (L) y consistencia (C).

| Base de datos | CAP / PACELC | Implicación para MEGA GO |
|---|---|---|
| PostgreSQL | CP / EC | Consistencia fuerte para pagos; réplicas de lectura con retraso aceptable |
| MongoDB | CP / EC | Consistencia configurable; sharding para disponibilidad |
| Redis | AP / EL | Disponibilidad y baja latencia; eventual consistencia en cluster |
| Neo4j | CP / EC | Consistencia en transacciones de grafo; recorridos deterministas |
| Firestore | AP / EL | Alta disponibilidad y sincronización en tiempo real |

Esta matriz guía cada decisión. El catálogo de contenido puede tolerar consistencia eventual porque un usuario no nota si una nueva serie aparece 500 ms después en una réplica. Los pagos no pueden: la consistencia fuerte es no negociable.

## El Panorama de Bases de Datos

| Base de Datos | Dominio | Modelo de Datos | Por Qué Fue Elegida |
|---------------|---------|-----------------|---------------------|
| **PostgreSQL** | Suscripciones, pagos, perfiles de usuario | Relacional (ACID) | Consistencia financiera, queries complejos |
| **MongoDB** | Catálogo de contenido, categorías, metadatos | Documento (BSON) | Esquema flexible para tipos de medios diversos |
| **Redis** | Sesiones, rate limits, feature flags | Clave-valor (en memoria) | Acceso sub-milisegundo, alto throughput |
| **Neo4j** | Grafo de identidad, relaciones cross-dispositivo | Grafo (nodos/aristas) | Recorrido de relaciones, resolución de identidad |
| **Firestore** | Configuración, tests A/B, sync en tiempo real | Documento (NoSQL) | Integración nativa Firebase, listeners en tiempo real |

## PostgreSQL: El Sistema de Registro

PostgreSQL es nuestro sistema de registro para cualquier cosa que involucre dinero o cumplimiento legal:

- **Cuentas de usuario**: Fecha de registro, email, flags de consentimiento legal
- **Suscripciones**: Tipo de plan, ciclo de facturación, fechas de renovación, razón de cancelación
- **Pagos**: IDs de transacción, montos, monedas, métodos de pago, estado de reembolso
- **Derechos**: Qué contenido puede acceder cada usuario, hasta cuándo

Estas tablas requieren transacciones ACID. Cuando un usuario hace upgrade de Free a Premium, tres operaciones deben atómicamente tener éxito: cargar el método de pago, extender el derecho, y actualizar el registro de suscripción. Si algún paso falla, toda la transacción hace rollback.

**Decisión Clave**: PostgreSQL 14 con réplicas de lectura para queries de analytics. Las operaciones de escritura van al primario; las queries de reporting intensivas van a las réplicas, previniendo que cargas analíticas impacten la latencia de transacciones.

**Lección Operacional**: Particiona tablas grandes por fecha. La tabla `payments` creció a 50M filas en 18 meses. El particionamiento mensual redujo el tamaño de índice en 80% y mejoró el rendimiento de queries en 3x.

### ¿Por qué no Oracle ni SQL Server?

Evaluamos Oracle y SQL Server en 2019. Ambos ofrecían características empresariales superiores, pero el costo de licenciamiento para un OTT en crecimiento era prohibitivo. PostgreSQL cubría el 100% de nuestros requisitos ACID con costo cero de licencia y una comunidad activa en LATAM. La capacidad de extensión con PostGIS (para geolocalización de eventos en vivo) y pg_stat_statements (para análisis de queries lentas) fueron diferenciadores decisivos.

## MongoDB: El Catálogo de Contenido

El contenido de medios no encaja bien en esquemas relacionales. Una película tiene campos diferentes que un episodio de serie, que tiene campos diferentes que un evento en vivo, que tiene campos diferentes que un clip de noticias.

El modelo de documentos de MongoDB permite que cada tipo de contenido tenga su propio esquema:

```json
{
  "_id": "movie-12345",
  "type": "movie",
  "title": "Festival de Viña 2026",
  "duration": 7200,
  "genres": ["Music", "Live Event"],
  "cast": [{"name": "Artista", "role": "Performer"}],
  "streams": {
    "hd": "https://cdn.../hd.m3u8",
    "sd": "https://cdn.../sd.m3u8"
  },
  "drm": {
    "widevine": "https://license...",
    "fairplay": "https://license..."
  },
  "availability": {
    "start": "2026-02-24T20:00:00Z",
    "end": "2027-02-24T20:00:00Z"
  }
}
```

La misma colección puede almacenar películas, series, episodios, eventos en vivo y clips — cada uno con los campos relevantes para su tipo. Sin migraciones de esquema cuando se agrega un nuevo tipo de contenido.

**Decisión Clave**: MongoDB 6 con sharding por hash de `contentId`. El catálogo sirve 10K+ RPS durante pico; el sharding distribuye la carga a través de tres replica sets.

**Lección Operacional**: Indexa queries compuestos cuidadosamente. Nuestro índice inicial en `{type: 1, genre: 1}` funcionó bien para navegación filtrada pero falló para búsqueda de texto. Agregar un índice de texto en `{title: "text", description: "text"}` redujo la latencia de búsqueda de 800ms a 45ms.

### Comparación con DynamoDB

Amazon DynamoDB fue evaluado como alternativa para el catálogo. Ofrece escalamiento horizontal automático y latencia predecible, pero el modelo de precios por capacidad provisionada generó costos impredecibles durante picos de eventos en vivo (como la final de un reality show). MongoDB nos dio control de costo con infraestructura propia y un modelo de consulta más rico para agregaciones complejas de catálogo.

## Redis: La Capa de Velocidad

Redis existe porque los milisegundos importan. Tres casos de uso justifican su complejidad operacional:

**Caché de Sesión**: Tokens de acceso OAuth2 con TTL de 5 minutos. Validar cada llamada de API contra Keycloak requeriría 1,500 RPS de tráfico SSO. Redis reduce esto a ~150 RPS (solo cache misses).

**Rate Limiting**: Contadores de ventana deslizante por usuario por API. Implementados como sorted sets de Redis con buckets de 1 minuto. Previene abuso sin escrituras a base de datos.

**Feature Flags**: Firebase Remote Config cacheado con TTL de 15 minutos. Sin Redis, 1.9M dispositivos activos martillarían Firestore en cada cold start.

**Decisión Clave**: Redis Cluster con 3 masters y 3 réplicas. Cada master maneja ~40K ops/seg; el cluster sostiene 120K ops/seg agregado.

**Lección Operacional**: Monitorea la fragmentación de memoria. El uso de memoria de Redis creció a 85% antes de que nos diéramos cuenta de que actualizaciones frecuentes de TTL estaban causando fragmentación. Cambiar de `volatile-ttl` a evicción `allkeys-lru` y ejecutar `MEMORY PURGE` semanalmente estabilizó la memoria en 60%.

### Alternativas evaluadas

Memcached fue descartado porque carece de persistencia y estructuras de datos ricas (sorted sets, hyperloglogs). Valkey (fork de Redis open-source por AWS) es monitoreado como alternativa futura para reducir dependencia de Redis Ltd.

## Neo4j: El Grafo de Identidad

La elección de base de datos más interesante en nuestra arquitectura es Neo4j. Resuelve un problema que las bases de datos relacionales manejan pobremente: **resolución de identidad a través de dispositivos y cuentas**.

En la Super App MEGA, un único usuario podría tener:
- Un teléfono (Android) con historial de navegación anónima
- Una TV (Android TV) con perfil familiar
- Una tablet (iPad) con perfil personal
- Un navegador web con perfil de trabajo
- Sesiones anónimas antes de login

Neo4j modela estos como un grafo:

```cypher
(User:registered {email: "user@example.com"})
  -[:HAS_DEVICE]-> (Device:android {id: "device-123"})
  -[:HAS_PROFILE]-> (Profile:anonymous {id: "anon-456"})
  -[:WATCHED]-> (Content:movie {id: "movie-789"})
```

Cuando el usuario hace login en un nuevo dispositivo, el recorrido del grafo encuentra todos los perfiles anónimos relacionados y migra sus datos. Esta operación en PostgreSQL requeriría 6+ JOINs a través de tablas con foreign keys complejas. En Neo4j, es una única query Cypher con recorrido de 2 saltos.

**Decisión Clave**: Neo4j 5 Community Edition. El grafo es relativamente pequeño (~50M nodos, ~200M relaciones) pero la complejidad de query es alta. Community Edition maneja la carga con una única instancia y backups diarios.

**Lección Operacional**: Las bases de datos de grafo no son de propósito general. Úsalas solo cuando las relaciones son el patrón de query primario. Inicialmente intentamos almacenar metadatos de contenido en Neo4j y nos arrepentimos — las queries Cypher para filtrado simple fueron más lentas que el find() de MongoDB por un orden de magnitud.

## Firestore: El Almacén de Configuración

Firestore sirve necesidades de configuración en tiempo real que no justifican overhead operacional:

- **Variantes de tests A/B**: Qué versión de UI ve cada usuario
- **Configuración remota**: Feature toggles, banners de mantenimiento, versiones mínimas de app
- **Analytics en tiempo real**: Conteos de vistas agregados durante eventos en vivo

La integración nativa con Firebase significa que clientes móviles y web pueden escuchar cambios de configuración en tiempo real sin polling.

**Decisión Clave**: Firestore en modo Datastore para precios consistentes. El precio por documento del modo nativo se volvió impredecible a escala.

## Arquitecturas Multi-Base de Datos en Producción

No todas las interacciones son simples lecturas y escrituras a una base de datos. Tres patrones arquitectónicos emergen cuando múltiples bases de datos colaboran:

### CQRS (Command Query Responsibility Segregation)

Separamos operaciones de escritura y lectura en modelos de datos diferentes. Las escrituras van a PostgreSQL (modelo transaccional); las lecturas complejas (búsqueda de contenido) se proyectan a un índice optimizado. En MEGA GO, el catálogo se escribe en MongoDB pero la búsqueda de texto consume un índice denormalizado generado por un pipeline de cambios.

### Patrón Strangler Fig

Migramos el catálogo de contenido de PostgreSQL a MongoDB en 2021 con cero downtime: dual-write a ambas bases de datos, verificar consistencia, cambiar lecturas, retirar PostgreSQL. Este patrón mitiga el riesgo de migración permitiendo rollback en cada etapa.

### Caché como Capa de Protección

Redis no es solo un caché: es una barrera de protección que absorbe picos de tráfico antes de que lleguen a bases de datos persistentes. Durante el lanzamiento de un evento en vivo con 500K usuarios concurrentes, Redis absorbió el 95% de las lecturas de configuración, dejando Firestore y MongoDB operando dentro de sus límites normales.

## El Trade-off de Persistencia Políglota

Ejecutar cinco bases de datos aumenta la complejidad operacional:
- Cinco estrategias de backup
- Cinco dashboards de monitoreo
- Cinco ciclos de upgrade
- Cinco conjuntos de expertise en el equipo

La alternativa — una base de datos para todo — fuerza cada caso de uso en un modelo subóptimo. Probamos PostgreSQL para el catálogo de contenido en 2020. Las migraciones de esquema para nuevos tipos de contenido tomaban semanas. El rendimiento de queries para categorías jerárquicas se degradó a medida que crecía el catálogo.

El enfoque polígloto cuesta más en operaciones pero se paga en rendimiento, flexibilidad y velocidad de desarrollo.

## Lecciones de la Industria

Las decisiones de MEGA GO no son únicas. Comparando con plataformas de referencia:

| Plataforma | Stack de bases de datos | Lección aplicable |
|---|---|---|
| **Netflix** | Cassandra + EVCache + Elasticsearch + MySQL | Cassandra para datos que crecen por usuario (historial); MySQL para transacciones financieras |
| **Uber** | MySQL + Cassandra + Redis + Elasticsearch | Separar datos transaccionales de datos de telemetría; Cassandra para escrituras masivas de ubicación |
| **Amazon** | DynamoDB + Aurora + Elasticsearch | DynamoDB para catálogo a escala; Aurora para transacciones con consistencia no negociable |
| **Twitter/X** | Manhattan + MySQL + Redis | Bases de datos propias cuando los requerimientos son extremadamente específicos |

La convergencia es clara: ninguna plataforma a escala usa una sola base de datos. La persistencia políglota no es moda — es consecuencia de la especialización.

## Checklist de Selección

Antes de adoptar una nueva base de datos en producción, validamos estos criterios:

**Análisis de datos**
- ¿Los datos son estructurados, semi-estructurados o no estructurados?
- ¿Hay relaciones complejas entre entidades?
- ¿El esquema es estable o evoluciona rápidamente?
- ¿Qué volumen de datos se espera? (GB, TB, PB)

**Patrones de acceso**
- ¿Es read-heavy o write-heavy?
- ¿Las consultas son simples (por clave) o complejas (joins, agregaciones)?
- ¿Se necesita búsqueda de texto completo?
- ¿Qué latencia es aceptable? (<1ms, <10ms, <100ms, <1s)

**Requisitos no funcionales**
- ¿Se necesita ACID completo o eventual consistencia es suficiente?
- ¿Cuál es el RPO/RTO requerido?
- ¿Se necesita escalamiento horizontal o vertical?
- ¿Qué presupuesto de infraestructura se tiene?

**Validación práctica**
- Crear POC con dataset representativo
- Ejecutar benchmarks de carga (usamos k6 para APIs, YCSB para NoSQL)
- Simular fallas y recovery
- Medir latencia p99 y throughput

## El Framework de Selección

Al evaluar una nueva base de datos, usamos este árbol de decisiones:

1. **¿Involucra dinero o cumplimiento legal?** → PostgreSQL (ACID requerido)
2. **¿El esquema cambia frecuentemente?** → MongoDB (documentos flexibles)
3. **¿Requiere acceso sub-milisegundo?** → Redis (en memoria)
4. **¿Las relaciones son el patrón de query primario?** → Neo4j (recorrido de grafo)
5. **¿Necesita sync en tiempo real con cliente?** → Firestore (integración Firebase)
6. **¿No encaja en ninguna categoría arriba?** → Re-evaluar el caso de uso

### Matriz de selección rápida

| Caso de uso | SQL | Documental | Key-Value | Grafo | Time-Series | Search |
|---|---|---|---|---|---|---|
| Pagos / suscripciones | ⭐ | | | | | |
| Catálogo de contenido | | ⭐ | | | | ⭐ |
| Caché / sesiones | | | ⭐ | | | |
| Relaciones de usuario | | | | ⭐ | | |
| Logs / métricas | | | | | ⭐ | ⭐ |
| Configuración en tiempo real | | ⭐ | | | | |

## La Lección

La selección de base de datos no es una decisión de una sola vez. Es una conversación arquitectónica continua. A medida que los dominios evolucionan, la base de datos que los sirvió bien en el año uno puede convertirse en una restricción en el año tres.

La clave es reconocer cuándo un dominio ha superado su base de datos — y tener la madurez operacional para migrar sin downtime. Migramos el catálogo de contenido de PostgreSQL a MongoDB en 2021 con cero downtime usando el patrón Strangler Fig: dual-write a ambas bases de datos, verificar consistencia, cambiar lecturas, retirar PostgreSQL.

La persistencia políglota no se trata de usar muchas bases de datos por complejidad. Se trata de elegir el modelo de datos correcto para cada dominio — y aceptar el costo operacional como el precio del rendimiento.

> "La mejor base de datos es la que tu equipo conoce bien y que resuelve el problema actual sin crear problemas futuros."
