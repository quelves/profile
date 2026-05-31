

---

# 🗄️ TUTORIAL: Cómo Elegir la Base de Datos Correcta para tu Plataforma

---

## 📋 ÍNDICE

1. [Introducción: Por qué la elección importa](#1-introducción)
2. [Marco Teórico: CAP y PACELC](#2-marco-teórico)
3. [Tipos de Bases de Datos y Casos de Uso](#3-tipos-de-bases-de-datos)
4. [Factores de Decisión por Plataforma](#4-factores-por-plataforma)
5. [Arquitecturas Multi-Base de Datos](#5-arquitecturas-multi-db)
6. [Checklist de Selección](#6-checklist)
7. [Ejemplos Prácticos de Empresas Reales](#7-ejemplos-prácticos)
8. [Herramientas y Recursos Adicionales](#8-recursos)

---

## 1. INTRODUCCIÓN: Por qué la elección importa

La selección de la base de datos es una de las decisiones más críticas en el diseño de sistemas. Una mala elección puede:
- Generar cuellos de botella de rendimiento
- Incrementar costos operacionales exponencialmente
- Dificultar el escalamiento horizontal
- Comprometer la integridad de datos

> **Regla de oro**: No existe "la mejor base de datos", solo "la más adecuada para tu caso de uso específico".

---

## 2. MARCO TEÓRICO: CAP y PACELC

### 2.1 Teorema CAP (Brewer, 2000)

En sistemas distribuidos, **solo puedes garantizar 2 de 3 propiedades**:

| Propiedad | Descripción | Cuándo es crítica |
|-----------|-------------|-------------------|
| **C** - Consistency | Todos los nodos ven los mismos datos simultáneamente | Banca, pagos, salud |
| **A** - Availability | Cada solicitud recibe una respuesta (éxito o error) | Redes sociales, streaming |
| **P** - Partition Tolerance | El sistema opera a pesar de fallas de red | Cualquier sistema distribuido |

**Combinaciones posibles:**
- **CP** (Consistency + Partition Tolerance): Banca, sistemas financieros
- **AP** (Availability + Partition Tolerance): Redes sociales, catálogos
- **CA** (Consistency + Availability): Sistemas monolíticos locales (no distribuidos)

### 2.2 Teorema PACELC (Extensión de CAP)

PACELC añade una dimensión crucial: **Latencia vs Consistencia en operación normal**.

```
Si hay Partición (P) → eliges entre Availability (A) o Consistency (C)
En caso contrario (E) → eliges entre Latency (L) o Consistency (C)
```

| Sistema | PACELC | Ejemplo |
|---------|--------|---------|
| Cassandra | PA/EL | Disponible + Baja latencia |
| MongoDB | CP/EC | Consistente + Eventual consistencia |
| PostgreSQL | PC/EC | Fuerte consistencia siempre |
| DynamoDB | PA/EL | Disponible + Baja latencia |

---

## 3. TIPOS DE BASES DE DATOS Y CASOS DE USO

### 3.1 Bases de Datos Relacionales (SQL)

**Características:**
- Esquema rígido (tablas, filas, columnas)
- ACID compliance completo
- Soporte para joins complejos
- Escalamiento vertical predominante

**Cuándo usar:**
- ✅ Datos estructurados con relaciones complejas
- ✅ Transacciones financieras (banca, pagos)
- ✅ Reportes analíticos con agregaciones
- ✅ Sistemas donde la integridad es crítica

**Tecnologías:** PostgreSQL, MySQL, Oracle, SQL Server, CockroachDB

**Ejemplo de caso de uso:**
```sql
-- Sistema hospitalario: Pacientes, Doctores, Visitas
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    primary_care_physician_id UUID REFERENCES doctors(doctor_id)
);

CREATE TABLE visits (
    visit_id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(patient_id),
    doctor_id UUID REFERENCES doctors(doctor_id),
    visit_date TIMESTAMP NOT NULL,
    diagnosis TEXT
);
```

### 3.2 Bases de Datos Documentales (NoSQL)

**Características:**
- Esquema flexible (JSON, BSON)
- Escalamiento horizontal nativo
- Optimizado para lecturas por clave
- Eventual consistencia (generalmente)

**Cuándo usar:**
- ✅ Catálogos de productos con atributos variables
- ✅ Perfiles de usuario con campos dinámicos
- ✅ Contenido CMS con estructuras heterogéneas
- ✅ Aplicaciones con evolución rápida de esquema

**Tecnologías:** MongoDB, Couchbase, DynamoDB, Firestore

**Ejemplo de caso de uso:**
```json
// Catálogo de productos Amazon
{
  "product_id": "PROD-12345",
  "name": "Smartphone XYZ",
  "category": "Electronics",
  "attributes": {
    "screen_size": "6.5\"",
    "battery_mah": 5000,
    "os": "Android 14"
  },
  "variants": [
    {"color": "black", "price": 699, "stock": 150},
    {"color": "white", "price": 699, "stock": 89}
  ],
  "reviews": [
    {"user_id": "U-789", "rating": 5, "comment": "Excellent!"}
  ]
}
```

### 3.3 Bases de Datos Clave-Valor

**Características:**
- Almacenamiento simple: clave → valor
- Ultra baja latencia (sub-milisegundo)
- Sin esquema ni relaciones
- Ideal para caching y sesiones

**Cuándo usar:**
- ✅ Caché de aplicación (Redis, Memcached)
- ✅ Almacenamiento de sesiones de usuario
- ✅ Rate limiting y contadores
- ✅ Leaderboards en tiempo real

**Tecnologías:** Redis, Memcached, DynamoDB, Riak

### 3.4 Bases de Datos Column-Family (Wide-Column)

**Características:**
- Almacenamiento orientado a columnas
- Optimizado para escrituras masivas
- Particionamiento por clave de fila
- Escalamiento horizontal lineal

**Cuándo usar:**
- ✅ Series temporales (IoT, métricas, logs)
- ✅ Datos de geolocalización (Uber, GPS)
- ✅ Feeds de actividad (Twitter, Facebook)
- ✅ Big Data analytics

**Tecnologías:** Apache Cassandra, HBase, ScyllaDB, Bigtable

**Ejemplo de modelo de datos Cassandra:**
```sql
-- Uber: Datos de ubicación de conductores
CREATE TABLE driver_locations (
    driver_id UUID,
    timestamp TIMESTAMP,
    latitude DECIMAL,
    longitude DECIMAL,
    accuracy FLOAT,
    PRIMARY KEY (driver_id, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);
```

### 3.5 Bases de Datos de Grafos

**Características:**
- Modelo de nodos, aristas y propiedades
- Optimizado para recorridos de grafos
- Relaciones como ciudadanos de primera clase
- Consultas de vecindad eficientes

**Cuándo usar:**
- ✅ Redes sociales (amigos, seguidores)
- ✅ Sistemas de recomendación
- ✅ Detección de fraude (patrones de conexión)
- ✅ Gestión de redes (IT, telecomunicaciones)

**Tecnologías:** Neo4j, Amazon Neptune, ArangoDB, JanusGraph

### 3.6 Bases de Datos de Series Temporales

**Características:**
- Optimizado para datos indexados por tiempo
- Compresión agresiva
- Agregaciones temporales nativas
- Retención automática por políticas

**Cuándo usar:**
- ✅ Métricas de monitoreo (Prometheus, Grafana)
- ✅ Datos de sensores IoT
- ✅ Análisis financiero (precios, trades)
- ✅ Logs y eventos con timestamp

**Tecnologías:** InfluxDB, TimescaleDB, Prometheus, OpenTSDB

### 3.7 Motores de Búsqueda

**Características:**
- Indexación invertida
- Full-text search avanzado
- Fuzzy matching y autocomplete
- Agregaciones en tiempo real

**Cuándo usar:**
- ✅ Búsqueda de productos (e-commerce)
- ✅ Búsqueda de contenido (blogs, docs)
- ✅ Log analytics (ELK stack)
- ✅ Análisis de texto no estructurado

**Tecnologías:** Elasticsearch, Solr, OpenSearch, Algolia

---

## 4. FACTORES DE DECISIÓN POR PLATAFORMA

### 4.1 Plataforma E-commerce (Amazon, Shopify)

| Componente | Base de Datos | Justificación |
|------------|---------------|---------------|
| Catálogo de productos | MongoDB / DynamoDB | Atributos variables, escalamiento |
| Órdenes y pagos | PostgreSQL | ACID, integridad transaccional |
| Inventario en tiempo real | Redis | Baja latencia, contadores atómicos |
| Búsqueda de productos | Elasticsearch | Full-text, filtros, facets |
| Análisis de ventas | Cassandra / ClickHouse | Big data, agregaciones |
| Sesiones de usuario | Redis | Caché rápida |

**Arquitectura típica:**
```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Gateway   │
└─────────────────┘     └─────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB    │    │   PostgreSQL    │    │   Elasticsearch │
│  (Catálogo)  │    │  (Órdenes/Pagos)│    │  (Búsqueda)     │
└──────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                        ┌──────┴──────┐
                        │    Redis    │
                        │   (Cache)   │
                        └─────────────┘
```

### 4.2 Plataforma de Redes Sociales (Twitter, Instagram)

| Componente | Base de Datos | Justificación |
|------------|---------------|---------------|
| Perfiles de usuario | MongoDB / PostgreSQL | Datos estructurados + flexibles |
| Timeline / Feed | Cassandra | Escrituras masivas, timeline por usuario |
| Relaciones (seguidores) | Neo4j / PostgreSQL | Grafos de relaciones |
| Contenido multimedia | S3 + Metadata en MongoDB | Almacenamiento de blobs |
| Notificaciones | Redis (Pub/Sub) | Tiempo real, baja latencia |
| Análisis de engagement | ClickHouse / BigQuery | Analytics masivo |

### 4.3 Plataforma Fintech / Banca

| Componente | Base de Datos | Justificación |
|------------|---------------|---------------|
| Cuentas y balances | PostgreSQL / Oracle | ACID, consistencia fuerte |
| Transacciones | CockroachDB / Spanner | Consistencia global, escalamiento |
| Fraude detection | Neo4j + Redis | Patrones de grafos + caché |
| Reporting regulatorio | Snowflake / BigQuery | Data warehouse |
| Logs de auditoría | Cassandra / TimescaleDB | Inmutabilidad, series temporales |

### 4.4 Plataforma IoT / Industrial

| Componente | Base de Datos | Justificación |
|------------|---------------|---------------|
| Datos de sensores | InfluxDB / TimescaleDB | Series temporales, compresión |
| Configuración de dispositivos | MongoDB | Esquema flexible por tipo de sensor |
| Alertas y eventos | Redis Streams | Tiempo real, pub/sub |
| Análisis predictivo | Cassandra + Spark | Big data, machine learning |
| Dashboard en tiempo real | InfluxDB + Grafana | Visualización de métricas |

### 4.5 Plataforma de Streaming / Video (Netflix, YouTube)

| Componente | Base de Datos | Justificación |
|------------|---------------|---------------|
| Catálogo de contenido | MongoDB / Cassandra | Metadatos flexibles, escalamiento |
| Recomendaciones | Neo4j + Redis | Grafos de preferencias + caché |
| Viewing history | Cassandra | Escrituras masivas por usuario |
| User sessions | Redis | Caché rápida, TTL automático |
| Analytics de viewing | ClickHouse / BigQuery | Agregaciones masivas |

---

## 5. ARQUITECTURAS MULTI-BASE DE DATOS (Polyglot Persistence)

### 5.1 Patrón CQRS (Command Query Responsibility Segregation)

Separar las operaciones de lectura y escritura en bases de datos diferentes:

```
┌─────────────────┐
│   Commands      │────▶┌─────────────────┐
│  (Escrituras)   │     │   PostgreSQL    │
└─────────────────┘     │  (Write Model)  │
                        └────────┬────────┘
                                 │
                                 ▼ Event Bus
                        ┌─────────────────┐
                        │   Kafka /       │
                        │   Event Store   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Elasticsearch │
                        │  (Read Model)   │
                        └─────────────────┘
┌─────────────────┐
│   Queries       │────▶┌─────────────────┐
│   (Lecturas)    │     │   Redis Cache   │
└─────────────────┘     └─────────────────┘
```

**Beneficios:**
- Optimizar cada base de datos para su workload
- Escalar lecturas y escrituras independientemente
- Modelos de datos específicos por caso de uso

### 5.2 Patrón Lambda Architecture

```
┌─────────────────┐
│   Data Sources  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Speed  │ │ Batch  │
│ Layer  │ │ Layer  │
│(Real-  │ │(Hadoop/│
│ time)  │ │ Spark) │
│Redis/  │ │        │
│Storm   │ │        │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│  Serving Layer  │
│ (Merge results) │
└─────────────────┘
```

### 5.3 Patrón Event Sourcing

Almacenar solo eventos inmutables, reconstruir estado desde el log:

```
┌─────────────────┐
│   Application   │
└────────┬────────┘
         │ Commands
         ▼
┌─────────────────┐
│   Event Store   │
│  (Cassandra /   │
│   Kafka)        │
└────────┬────────┘
         │ Events
         ▼
┌─────────────────┐
│  Projections    │
│  (Read Models)   │
│  PostgreSQL /   │
│  MongoDB        │
└─────────────────┘
```

---

## 6. CHECKLIST DE SELECCIÓN

### Paso 1: Analizar Requisitos de Datos

- [ ] ¿Los datos son estructurados, semi-estructurados o no estructurados?
- [ ] ¿Hay relaciones complejas entre entidades?
- [ ] ¿El esquema es estable o evoluciona rápidamente?
- [ ] ¿Qué volumen de datos se espera? (GB, TB, PB)
- [ ] ¿Cuál es la tasa de crecimiento anual?

### Paso 2: Analizar Patrones de Acceso

- [ ] ¿Es read-heavy o write-heavy?
- [ ] ¿Las consultas son simples (por clave) o complejas (joins, agregaciones)?
- [ ] ¿Se necesita búsqueda de texto completo?
- [ ] ¿Hay requerimientos de tiempo real?
- [ ] ¿Qué latencia es aceptable? (<1ms, <10ms, <100ms, <1s)

### Paso 3: Analizar Requisitos No-Funcionales

- [ ] ¿Se necesita ACID completo o eventual consistencia es suficiente?
- [ ] ¿Cuál es el RPO/RTO requerido?
- [ ] ¿Se necesita escalamiento horizontal o vertical?
- [ ] ¿Hay requerimientos de multi-region?
- [ ] ¿Qué presupuesto de infraestructura se tiene?

### Paso 4: Evaluar Opciones

| Criterio | Peso | Opción A | Opción B | Opción C |
|----------|------|----------|----------|----------|
| Rendimiento lectura | 20% | | | |
| Rendimiento escritura | 20% | | | |
| Consistencia | 15% | | | |
| Escalabilidad | 15% | | | |
| Costo operacional | 15% | | | |
| Madurez del equipo | 10% | | | |
| Ecosistema | 5% | | | |
| **TOTAL** | **100%** | | | |

### Paso 5: Prototipar y Validar

- [ ] Crear POC con dataset representativo
- [ ] Ejecutar benchmarks de carga
- [ ] Simular fallas y recovery
- [ ] Medir latencia p99, throughput
- [ ] Evaluar costo total de propiedad (TCO)

---

## 7. EJEMPLOS PRÁCTICOS DE EMPRESAS REALES

### 7.1 Netflix

**Stack tecnológico:**
- **Cassandra**: Perfiles de usuario, bookmarks, viewing history
- **EVCache** (Memcached fork): Caché de metadatos de contenido
- **Elasticsearch**: Búsqueda de contenido
- **MySQL**: Datos de facturación y suscripciones
- **S3**: Almacenamiento de video

**Lección**: Usar Cassandra para datos que crecen con cada usuario (viewing history), 
pero MySQL para transacciones financieras donde ACID es crítico.

### 7.2 Uber

**Stack tecnológico:**
- **MySQL**: Transacciones de viajes, pagos
- **Cassandra**: Ubicación de conductores en tiempo real
- **Redis**: Caché de rutas, rate limiting
- **Elasticsearch**: Búsqueda de direcciones
- **Schemaless** (MongoDB fork): Datos de viajes históricos

**Lección**: Separar datos transaccionales (MySQL) de datos de telemetría (Cassandra). 
La ubicación de conductores requiere escrituras masivas y baja latencia.

### 7.3 Amazon

**Stack tecnológico:**
- **DynamoDB**: Catálogo de productos, carritos, sesiones
- **Aurora** (PostgreSQL/MySQL): Órdenes, inventario crítico
- **Redshift**: Data warehouse para analytics
- **Elasticsearch**: Búsqueda de productos
- **S3**: Imágenes de productos, backups

**Lección**: DynamoDB para escalar el catálogo a millones de productos, 
pero Aurora para transacciones donde la consistencia es no negociable.

### 7.4 Twitter

**Stack tecnológico:**
- **Manhattan** (key-value propio): Timelines, tweets
- **MySQL**: Perfiles de usuario, relaciones
- **Redis**: Contadores, trending topics
- **Elasticsearch**: Búsqueda de tweets
- **Hadoop**: Analytics masivo

**Lección**: Construir bases de datos propias cuando los requerimientos 
son tan específicos que las opciones existentes no satisfacen.

---

## 8. HERRAMIENTAS Y RECURSOS ADICIONALES

### 8.1 Benchmarks y Comparativas

| Herramienta | Uso |
|-------------|-----|
| **YCSB** (Yahoo! Cloud Serving Benchmark) | Benchmark genérico para NoSQL |
| **TPC-C** | Benchmark transaccional OLTP |
| **TPC-H** | Benchmark analítico OLAP |
| **Sysbench** | Benchmark MySQL/PostgreSQL |
| **JMH** | Benchmark Java (para clientes) |

### 8.2 Decision Trees

```
¿Necesitas ACID completo?
├── SÍ → ¿Relaciones complejas?
│   ├── SÍ → PostgreSQL / MySQL
│   └── NO → ¿Escalamiento global?
│       ├── SÍ → CockroachDB / Spanner
│       └── NO → PostgreSQL
└── NO → ¿Datos semi-estructurados?
    ├── SÍ → ¿Escrituras masivas?
    │   ├── SÍ → Cassandra / ScyllaDB
    │   └── NO → MongoDB / DynamoDB
    └── NO → ¿Series temporales?
        ├── SÍ → InfluxDB / TimescaleDB
        └── NO → ¿Búsqueda de texto?
            ├── SÍ → Elasticsearch
            └── NO → Redis (key-value simple)
```

### 8.3 Recursos de Aprendizaje

- **ByteByteGo Newsletter**: Newsletter semanal de System Design
- **Designing Data-Intensive Applications** (Martin Kleppmann): Biblia del tema
- **Database Internals** (Alex Petrov): Cómo funcionan por dentro
- **High Performance MySQL** (Silvia Botros): Optimización práctica

---

## 📊 RESUMEN VISUAL: Matriz de Selección Rápida

| Caso de Uso | SQL | Documental | Key-Value | Column-Family | Grafo | Time-Series | Search |
|-------------|:---:|:----------:|:---------:|:-------------:|:-----:|:-----------:|:------:|
| E-commerce (catálogo) | | ⭐ | | | | | ⭐ |
| E-commerce (pagos) | ⭐ | | | | | | |
| Redes sociales (feed) | | | | ⭐ | | | |
| Redes sociales (amigos) | | | | | ⭐ | | |
| Banca (transacciones) | ⭐ | | | | | | |
| IoT (sensores) | | | | | | ⭐ | |
| Logs / Monitoring | | | | | | ⭐ | ⭐ |
| Caché / Sesiones | | | ⭐ | | | | |
| Recomendaciones | | | | | ⭐ | | |
| CMS / Contenido | | ⭐ | | | | | |

---

## 🎯 CONCLUSIÓN

La selección de base de datos no es un evento único, sino una decisión evolutiva:

1. **Comienza simple**: PostgreSQL o MongoDB cubren el 80% de los casos
2. **Evoluciona cuando hay evidencia**: No optimices prematuramente
3. **Considera polyglot persistence**: Una sola base de datos rara vez es suficiente a escala
4. **Mide antes de decidir**: Benchmarks con datos reales > opiniones
5. **Planifica la migración**: Cambiar de base de datos en producción es costoso

> "La mejor base de datos es la que tu equipo conoce bien y que resuelve 
> el problema actual sin crear problemas futuros."

---

**Autor**: Tutorial generado a partir del análisis del video de YouTube sobre selección de bases de datos + profundización en temas de System Design.

**Fecha**: Mayo 2026

---

📥 **Descargar tutorial completo**: [Tutorial Selección de Bases de Datos](sandbox:///mnt/agents/output/tutorial_seleccion_bases_datos.md)

---

## 💡 Temas Adicionales para Profundizar

Si deseas seguir profundizando, te recomiendo estos temas relacionados:

1. **Sharding Strategies**: Cómo particionar datos horizontalmente (hash-based, range-based, directory-based)
2. **Replication Patterns**: Master-slave, multi-master, chain replication, quorum-based
3. **Consistency Models**: Strong, eventual, causal, read-your-writes, monotonic reads
4. **Indexing Strategies**: B-trees, LSM trees, inverted indexes, bitmap indexes
5. **Query Optimization**: Planes de ejecución, índices compuestos, covering indexes
6. **Transaction Patterns**: 2PC, Saga, Outbox pattern, Idempotency keys
7. **NewSQL Databases**: CockroachDB, TiDB, YugabyteDB — SQL distribuido con escalamiento horizontal
8. **Vector Databases**: Pinecone, Milvus, Weaviate — para embeddings de IA

¿Te gustaría que profundice en alguno de estos temas específicos? 🚀