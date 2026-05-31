# epic-test-plan.md — QWS-E1: Infraestructura Docker Swarm

> **Proyecto:** Quelves Platform (QWS)  
> **Épica:** QWS-E1  
> **Skill:** @mega-ia-team/ v3.14.0

---

## 🎯 Objetivo del Plan de Testing

Validar que el stack Docker Swarm se despliega correctamente, todos los servicios son accesibles, healthchecks funcionan, y la observabilidad recolecta métricas.

---

## 🧪 Tests por Servicio

### qws_app (Next.js SSR)

| ID | Descripción | Tipo | Herramienta | Estado |
|----|-------------|------|-------------|--------|
| T-APP-1 | Healthcheck endpoint `/api/health` responde 200 | Integration | curl/wget | 🔴 |
| T-APP-2 | Rolling update sin downtime | E2E | docker service update | 🔴 |
| T-APP-3 | Rollback automático en fallo | E2E | docker service update --rollback | 🔴 |
| T-APP-4 | 2 réplicas distribuyen tráfico | Load Test | curl + conteo | 🔴 |

### qws_postgres (PostgreSQL)

| ID | Descripción | Tipo | Herramienta | Estado |
|----|-------------|------|-------------|--------|
| T-DB-1 | pg_isready healthcheck pasa | Integration | pg_isready | 🔴 |
| T-DB-2 | Conexión desde qws_app funciona | Integration | psql / app logs | 🔴 |
| T-DB-3 | Datos persisten tras restart | E2E | docker service restart + query | 🔴 |
| T-DB-4 | Secrets se inyectan correctamente | Security | docker inspect | 🔴 |

### qws_redis (Redis)

| ID | Descripción | Tipo | Herramienta | Estado |
|----|-------------|------|-------------|--------|
| T-CACHE-1 | redis-cli ping responde PONG | Integration | redis-cli | 🔴 |
| T-CACHE-2 | Autenticación con password funciona | Security | redis-cli -a | 🔴 |
| T-CACHE-3 | Persistencia AOF funciona | E2E | restart + verificar keys | 🔴 |

### qws_minio (MinIO)

| ID | Descripción | Tipo | Herramienta | Estado |
|----|-------------|------|-------------|--------|
| T-S3-1 | Console accesible via HTTPS | E2E | browser/curl | 🔴 |
| T-S3-2 | Bucket creation funciona | Integration | mc / aws-cli | 🔴 |
| T-S3-3 | Upload/download de objetos | E2E | SDK / curl | 🔴 |

### Observabilidad

| ID | Descripción | Tipo | Herramienta | Estado |
|----|-------------|------|-------------|--------|
| T-OBS-1 | Prometheus recolecta métricas de app | Integration | Prometheus UI | 🔴 |
| T-OBS-2 | Grafana muestra dashboards | E2E | Grafana UI | 🔴 |
| T-OBS-3 | cAdvisor muestra métricas de contenedores | Integration | Prometheus targets | 🔴 |
| T-OBS-4 | Node Exporter muestra métricas de host | Integration | Prometheus targets | 🔴 |

---

## 📊 Cobertura Esperada

| Categoría | Tests | Cobertura |
|-----------|-------|-----------|
| Deploy | 3 | 100% |
| Healthchecks | 5 | 100% |
| Conectividad | 4 | 100% |
| Observabilidad | 4 | 100% |
| Seguridad (secrets) | 2 | 100% |

---

*Mantenido por 🤖 QA*  
*Validar que la épica es testable antes del primer feature start*
