# QWS-E1-H3: Configurar Redis para cache, sesiones y rate limiting

> **Estado:** 🔴 No iniciado  
> **SP:** 3  
> **Agente:** 🤖 DB Lead + 🤖 Arch

---

## Criterios de Aceptación

### CA1: Servicio Redis configurado
**Estado:** 🔴 No iniciado
**Given** la app necesita cache y sesiones  
**When** se despliega `qws_redis`  
**Then** usa imagen `redis:7-alpine`, puerto 6379, con AUTH habilitado

### CA2: Configuración de seguridad y persistencia
**Estado:** 🔴 No iniciado
**Given** Redis debe ser seguro y persistente  
**When** se configura el comando  
**Then** incluye: `--requirepass`, `--appendonly yes`, `--maxmemory 512mb`, `--maxmemory-policy allkeys-lru`

### CA3: Secrets para Redis
**Estado:** 🔴 No iniciado
**Given** la autenticación requiere credenciales seguras  
**When** se crean secrets  
**Then** existen `qws_redis_pass`, `qws_redis_url` como Docker Swarm secrets

### CA4: Placement y recursos
**Estado:** 🔴 No iniciado
**Given** Redis es un datastore  
**When** se configura deploy  
**Then** placement en `node.labels.qws.datastore == true`, limits: 0.5 CPU, 512MB RAM

---

## Notas Técnicas
- `--appendfsync everysec` para balance entre performance y durabilidad
- Healthcheck: `redis-cli --raw incr ping`
