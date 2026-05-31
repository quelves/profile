# QWS-E1: Infraestructura Docker Swarm

> **Skill:** @mega-ia-team/ v3.14.0  
> **Proyecto:** Quelves Platform (QWS)  
> **Estado:** 🟡 Propuesta — pendiente aprobación Leader  
> **Story Points:** 40  
> **Target Sprint:** Sprint 1

---

## 🎯 Objetivo

Construir el stack de infraestructura Docker Swarm completo para la plataforma `quelves.com`, incluyendo servicios de aplicación, base de datos, cache, almacenamiento de objetos, observabilidad y reverse proxy. Este stack servirá como fundación para todas las épicas subsiguientes (CMS, AI Studio, auth, etc.).

---

## 📋 Scope

### In-Scope
- Stack Docker Swarm completo (`docker-swarm-stack.yml`)
- PostgreSQL 15 como base de datos principal
- Redis 7 para cache, sesiones y rate limiting
- MinIO para almacenamiento de objetos (media assets)
- Traefik como reverse proxy/ingress (external)
- Prometheus + Grafana + cAdvisor + Node Exporter para observabilidad
- Secrets y configs de Docker Swarm
- Healthchecks, restart policies y resource limits
- Documentación de operaciones (runbooks)

### Out-of-Scope
- Kafka/Zookeeper (no requiere event streaming masivo)
- pgAdmin (se usa herramienta local)
- Despliegue en producción final (esto es infraestructura de staging/dev)
- CI/CD completo (se aborda en épica QWS-E6)

---

## 🏗️ Arquitectura del Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRAEFIK (External)                                │
│                    Reverse Proxy + TLS Termination                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │ quelves  │       │ monitor. │       │ storage. │
   │ .com     │       │ quelves  │       │ quelves  │
   │ (App)    │       │ .com     │       │ .com     │
   │ 2 repl   │       │ (Grafana)│       │ (MinIO)  │
   └────┬─────┘       └──────────┘       └──────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QWS_NETWORK (Overlay)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ qws_app  │  │ qws_post │  │ qws_redis│  │ qws_minio│  │ qws_prom │     │
│  │ Next.js  │  │ gres     │  │          │  │          │  │ etheus   │     │
│  │ 2 repl   │  │ 1 repl   │  │ 1 repl   │  │ 1 repl   │  │ 1 repl   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                             │
│  ┌──────────┐  ┌──────────┐                                                │
│  │ qws_cad  │  │ qws_node │                                                │
│  │ visor    │  │ _exporter│                                                │
│  │ global   │  │ global   │                                                │
│  └──────────┘  └──────────┘                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Historias de la Épica

| ID | Historia | SP | Estado |
|----|----------|----|--------|
| QWS-E1-H1 | Diseñar y documentar stack Docker Swarm completo | 5 | 🔴 |
| QWS-E1-H2 | Configurar PostgreSQL con secrets, volumen y healthcheck | 5 | 🔴 |
| QWS-E1-H3 | Configurar Redis para cache, sesiones y rate limiting | 3 | 🔴 |
| QWS-E1-H4 | Configurar MinIO como object storage para media assets | 3 | 🔴 |
| QWS-E1-H5 | Configurar observabilidad: Prometheus + Grafana + exporters | 5 | 🔴 |
| QWS-E1-H6 | Configurar Traefik labels y routing para servicios | 3 | 🔴 |
| QWS-E1-H7 | Crear scripts de inicialización de secrets y configs | 3 | 🔴 |
| QWS-E1-H8 | Crear runbooks de operación y deploy | 3 | 🔴 |

---

## ⚠️ Limitaciones y Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Volúmenes locales no persisten si el nodo datastore falla | Media | Alta | Usar storage replicated o backups automatizados |
| Traefik no configurado correctamente | Media | Alta | Validar labels y probar en entorno local primero |
| Secrets no creados antes del deploy | Alta | Alta | Script de validación pre-deploy |
| Resource limits muy restrictivos | Baja | Media | Monitorear y ajustar basado en métricas reales |

---

## ✅ Criterios de Éxito de la Épica

1. `docker stack deploy -c docker-swarm-stack.yml qws` ejecuta sin errores
2. Todos los servicios reportan `healthy` en `docker service ls`
3. La app responde en `https://quelves.com` (o dominio de staging)
4. PostgreSQL y Redis son accesibles desde la app
5. Grafana muestra métricas de todos los servicios
6. Los runbooks documentan procedimientos de deploy, rollback y recuperación

---

*Épica creada por 🤖 Arch + 🤖 PO — pendiente aprobación Leader*
