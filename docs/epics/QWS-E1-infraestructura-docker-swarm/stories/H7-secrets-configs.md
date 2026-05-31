# QWS-E1-H7: Crear scripts de inicialización de secrets y configs

> **Estado:** 🔴 No iniciado  
> **SP:** 3  
> **Agente:** 🤖 DevOps/SRE + 🤖 Sec

---

## Criterios de Aceptación

### CA1: Script de creación de secrets
**Estado:** 🔴 No iniciado
**Given** el stack requiere secrets  
**When** se ejecuta el script  
**Then** crea todos los secrets: db_user, db_pass, db_url, redis_pass, redis_url, minio_user, minio_pass, grafana_user, grafana_pass, nextauth_secret, llm_api_key

### CA2: Script de creación de configs
**Estado:** 🔴 No iniciado
**Given** Prometheus requiere config  
**When** se ejecuta el script  
**Then** crea `qws_prometheus_config` desde archivo `prometheus.yml`

### CA3: Script de validación pre-deploy
**Estado:** 🔴 No iniciado
**Given** antes de deploy se debe validar  
**When** se ejecuta el script  
**Then** verifica que todos los secrets y configs existen, que la network existe, que los nodos tienen labels correctos

### CA4: Documentación de secrets
**Estado:** 🔴 No iniciado
**Given** los secrets deben ser gestionados  
**When** se documenta  
**Then** existe tabla con nombre, propósito y rotación recomendada

---

## Notas Técnicas
- Usar `docker secret create` y `docker config create`
- No commitear valores de secrets en el repo
- Script debe ser idempotente (no crear duplicados)
