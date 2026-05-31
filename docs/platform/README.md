# platform/ — Infraestructura y Despliegue

> **Proyecto:** Quelves Platform (QWS)

---

## 📁 Estructura

```
platform/
├── README.md              ← Este archivo
├── docker-swarm-stack.yml ← Stack principal de Docker Swarm (en raíz del proyecto)
├── swarm/                 ← Configuraciones específicas de Swarm
│   ├── init-secrets.sh
│   ├── init-configs.sh
│   └── validate-predeploy.sh
├── monitoring/            ← Configuraciones de Prometheus/Grafana
│   ├── prometheus.yml
│   └── grafana-dashboards/
└── traefik/               ← Configuraciones de Traefik (si aplica)
    └── dynamic-config.yml
```

---

## 🚀 Stack Docker Swarm

| Servicio | Imagen | Réplicas | Rol |
|----------|--------|----------|-----|
| qws_app | Next.js 16 + Node.js | 2 | Aplicación principal (SSR + API routes) |
| qws_postgres | postgres:15-alpine | 1 | Base de datos relacional |
| qws_redis | redis:7-alpine | 1 | Cache, sesiones, rate limiting |
| qws_minio | minio/minio:latest | 1 | Object storage (media assets) |
| qws_prometheus | prom/prometheus:v2.48.0 | 1 | Métricas |
| qws_grafana | grafana/grafana:10.2.3 | 1 | Dashboards |
| qws_cadvisor | gcr.io/cadvisor/cadvisor:v0.47.2 | global | Métricas de contenedores |
| qws_node_exporter | prom/node-exporter:v1.7.0 | global | Métricas de host |

---

## 🔧 Comandos de Operación

```bash
# Validar pre-requisitos
./platform/swarm/validate-predeploy.sh

# Crear secrets y configs
./platform/swarm/init-secrets.sh
./platform/swarm/init-configs.sh

# Desplegar stack
docker stack deploy -c docker-swarm-stack.yml qws

# Ver estado
docker service ls
docker stack ps qws

# Logs
docker service logs qws_qws_app -f

# Escalar app
docker service scale qws_qws_app=3

# Rollback
docker service update --rollback qws_qws_app
```

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

*Mantenido por 🤖 SRE + 🤖 DevOps*
