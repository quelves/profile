# QWS-E1-H1: Diseñar y documentar stack Docker Swarm completo

> **Estado:** 🔴 No iniciado  
> **SP:** 5  
> **Agente:** 🤖 Arch

---

## Criterios de Aceptación

### CA1: Stack YAML completo
**Estado:** 🔴 No iniciado
**Given** el proyecto requiere infraestructura Docker Swarm  
**When** se crea `docker-swarm-stack.yml`  
**Then** contiene todos los servicios: app, postgres, redis, minio, prometheus, grafana, cadvisor, node_exporter

### CA2: Networks definidas
**Estado:** 🔴 No iniciado
**Given** los servicios necesitan comunicarse  
**When** se definen networks  
**Then** existen `traefik-network` (external) y `qws_network` (overlay, attachable)

### CA3: Volumes persistentes
**Estado:** 🔴 No iniciado
**Given** los datastores necesitan persistencia  
**When** se definen volumes  
**Then** existen volumes para postgres, redis, minio, prometheus, grafana

### CA4: Documentación de arquitectura
**Estado:** 🔴 No iniciado
**Given** el stack está definido  
**When** se documenta  
**Then** existe diagrama de arquitectura y descripción de cada servicio

---

## Notas Técnicas
- Basar en `mega-sales-platform/docker-compose.yml` y `docker-swarm-stack.yml`
- Simplificar: sin Kafka, Zookeeper, pgAdmin
- Usar version 3.9 de compose
