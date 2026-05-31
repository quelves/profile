# analysis.md — QWS-E1: Infraestructura Docker Swarm

> **Proyecto:** Quelves Platform (QWS)

---

## 🎯 Análisis de Dominio

### Problema
El proyecto QWS requiere una infraestructura robusta, escalable y observable para soportar:
- Aplicación Next.js con SSR
- Base de datos relacional (PostgreSQL)
- Cache y sesiones (Redis)
- Almacenamiento de objetos (MinIO)
- Observabilidad completa (Prometheus + Grafana)

### Solución Propuesta
Stack Docker Swarm basado en la referencia `mega-sales-platform` (salpla), simplificado para las necesidades de una plataforma de contenido ejecutivo.

---

## 🏗️ Decisiones de Arquitectura

### 1. Orquestador: Docker Swarm
**Decisión:** Usar Docker Swarm en lugar de Kubernetes.  
**Justificación:** Simplicidad operativa, integración nativa con Docker, rolling updates built-in, adecuado para el tamaño del proyecto.

### 2. Reverse Proxy: Traefik (External)
**Decisión:** Traefik como ingress externo, no como servicio dentro del stack.  
**Justificación:** Consistente con la arquitectura de referencia (salpla, megott). Permite reutilizar Traefik para múltiples stacks.

### 3. Base de Datos: PostgreSQL 15 Alpine
**Decisión:** PostgreSQL sobre MySQL o MongoDB.  
**Justificación:** Prisma ORM tiene soporte nativo excelente. Relaciones complejas (artículos, categorías, tags, usuarios, roles). ACID compliance para workflow editorial.

### 4. Cache: Redis 7 Alpine
**Decisión:** Redis sobre Memcached.  
**Justificación:** Soporte para sesiones, rate limiting, y cache de queries. Persistencia AOF habilitada.

### 5. Object Storage: MinIO
**Decisión:** MinIO sobre almacenamiento local o S3 directo.  
**Justificación:** Compatible con API S3, self-hosted, costo cero. Permite migrar a S3/GCS en el futuro sin cambiar código.

### 6. Observabilidad: Prometheus + Grafana + Exporters
**Decisión:** Stack Prometheus sobre Datadog/New Relic.  
**Justificación:** Open source, costo cero, integración nativa con Docker Swarm. cAdvisor y Node Exporter para métricas de contenedores y hosts.

---

## 📐 Diagrama de Flujo

```
Usuario ──► Traefik (HTTPS) ──► qws_app (Next.js SSR, 2 réplicas)
                                    │
                                    ├──► qws_postgres (PostgreSQL)
                                    ├──► qws_redis (Redis)
                                    └──► qws_minio (MinIO)

Observabilidad:
qws_prometheus ◄── qws_cadvisor (global)
qws_prometheus ◄── qws_node_exporter (global)
qws_grafana ◄── qws_prometheus
```

---

## 🔍 Análisis de Capacidad

| Servicio | Réplicas | CPU Limit | RAM Limit | Uso esperado |
|----------|----------|-----------|-----------|--------------|
| qws_app | 2 | 1.0 | 1GB | Alto (SSR + API routes) |
| qws_postgres | 1 | 2.0 | 2GB | Medio (DB principal) |
| qws_redis | 1 | 0.5 | 512MB | Medio (cache + sesiones) |
| qws_minio | 1 | 0.5 | 512MB | Bajo (media assets) |
| qws_prometheus | 1 | 0.5 | 512MB | Medio (métricas) |
| qws_grafana | 1 | 0.5 | 256MB | Bajo (dashboards) |

---

*Mantenido por 🤖 Arch*
