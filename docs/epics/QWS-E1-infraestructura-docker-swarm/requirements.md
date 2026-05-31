# requirements.md — QWS-E1: Infraestructura Docker Swarm

> **Proyecto:** Quelves Platform (QWS)

---

## Requisitos Funcionales

### RF-1: Orquestación de Contenedores
El sistema debe usar Docker Swarm para orquestar todos los servicios de la plataforma.

### RF-2: Alta Disponibilidad de Aplicación
El servicio de aplicación (Next.js) debe tener mínimo 2 réplicas con rolling updates y rollback automático.

### RF-3: Base de Datos Relacional
PostgreSQL 15 debe estar disponible como servicio con persistencia de datos, healthchecks y placement en nodo datastore.

### RF-4: Cache y Sesiones
Redis 7 debe estar disponible para cache de aplicación, sesiones de usuario y rate limiting.

### RF-5: Almacenamiento de Objetos
MinIO debe estar disponible para almacenar media assets (imágenes, documentos) con acceso HTTPS via Traefik.

### RF-6: Reverse Proxy y Routing
Traefik debe enrutar tráfico HTTPS a los servicios correspondientes basado en hostnames.

### RF-7: Observabilidad
Prometheus debe recolectar métricas. Grafana debe visualizar dashboards. cAdvisor y Node Exporter deben recolectar métricas de contenedores y hosts.

### RF-8: Gestión de Secrets
Todas las credenciales (DB, Redis, MinIO, auth, LLM) deben gestionarse via Docker Swarm Secrets.

---

## Requisitos No Funcionales

### RNF-1: Seguridad
- Comunicación interna via overlay network cifrada
- Secrets externos, nunca en imágenes ni código
- Healthchecks en todos los servicios

### RNF-2: Performance
- Resource limits y reservations definidos para todos los servicios
- App: máximo 1 CPU, 1GB RAM por réplica
- DB: máximo 2 CPU, 2GB RAM

### RNF-3: Escalabilidad
- Servicios stateless (app) con múltiples réplicas
- Servicios stateful (DB, Redis, MinIO) con 1 réplica y volumen persistente

### RNF-4: Recuperación
- Restart policies: any, con delay y max_attempts
- Rollback automático en fallos de update
- Volumen local para datos (con plan de backup)

---

*Mantenido por 🤖 PO + 🤖 Arch*
