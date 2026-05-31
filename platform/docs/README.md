# platform/ — Infraestructura y Plataforma QWS

> **Proyecto:** Quelves Platform (QWS) — Track 2
> **Estado:** 📋 Planificación — no codear sin aprobación Leader

---

## 📁 Estructura

```
platform/
├── docs/              ← Este archivo (documentación de plataforma)
└── qws/               ← Stack Docker Swarm y configuraciones QWS
    ├── docker-swarm-stack.yml     ← Stack principal
    ├── swarm/                     ← Scripts de inicialización (futuro)
    │   ├── init-secrets.sh
    │   ├── init-configs.sh
    │   └── validate-predeploy.sh
    ├── monitoring/                ← Configuraciones Prometheus/Grafana
    │   ├── prometheus.yml
    │   └── grafana-dashboards/
    └── traefik/                   ← Configuraciones Traefik (futuro)
        └── dynamic-config.yml
```

---

## 🚀 Stack Docker Swarm (Diseñado)

| Servicio | Imagen | Réplicas | Rol |
|----------|--------|----------|-----|
| qws_app | Next.js 16 + Node.js SSR | 2 | Aplicación principal |
| qws_postgres | postgres:15-alpine | 1 | Base de datos relacional |
| qws_redis | redis:7-alpine | 1 | Cache, sesiones, rate limiting |
| qws_minio | minio/minio:latest | 1 | Object storage (media assets) |
| qws_prometheus | prom/prometheus:v2.48.0 | 1 | Métricas |
| qws_grafana | grafana/grafana:10.2.3 | 1 | Dashboards |
| qws_cadvisor | gcr.io/cadvisor/cadvisor:v0.47.2 | global | Métricas de contenedores |
| qws_node_exporter | prom/node-exporter:v1.7.0 | global | Métricas de host |

---

## 🔐 Secrets Requeridos

| Secret | Descripción |
|--------|-------------|
| `qws_db_user` | Usuario PostgreSQL |
| `qws_db_pass` | Password PostgreSQL |
| `qws_db_url` | URL completa de conexión PostgreSQL |
| `qws_redis_pass` | Password Redis |
| `qws_redis_url` | URL completa de conexión Redis |
| `qws_minio_user` | Root user MinIO |
| `qws_minio_pass` | Root password MinIO |
| `qws_grafana_user` | Admin user Grafana |
| `qws_grafana_pass` | Admin password Grafana |
| `qws_nextauth_secret` | Secret para Auth.js/NextAuth |
| `qws_llm_api_key` | API key para LLM provider |

---

## ⚠️ Importante

Este directorio (`platform/qws/`) contiene el **diseño** de la infraestructura para la Fase 2 (QWS). **No implementar hasta que el Leader apruebe explícitamente el trabajo en Track 2.**

El foco actual del equipo debe estar en **Track 1 (LQDS — site estático)** en `site/`.

---

*Mantenido por 🤖 SRE + 🤖 Arch*
