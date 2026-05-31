# QWS-E1-H2: Configurar PostgreSQL con secrets, volumen y healthcheck

> **Estado:** 🔴 No iniciado  
> **SP:** 5  
> **Agente:** 🤖 DB Lead + 🤖 Arch

---

## Criterios de Aceptación

### CA1: Servicio PostgreSQL configurado
**Estado:** 🔴 No iniciado
**Given** el stack Docker Swarm  
**When** se despliega `qws_postgres`  
**Then** usa imagen `postgres:15-alpine`, puerto 5432, healthcheck funcional

### CA2: Secrets para PostgreSQL
**Estado:** 🔴 No iniciado
**Given** las credenciales deben ser seguras  
**When** se crean secrets  
**Then** existen `qws_db_user`, `qws_db_pass`, `qws_db_url` como Docker Swarm secrets

### CA3: Volumen persistente
**Estado:** 🔴 No iniciado
**Given** los datos deben persistir  
**When** se configura el volumen  
**Then** `qws_postgres_data` monta en `/var/lib/postgresql/data`

### CA4: Placement constraints
**Estado:** 🔴 No iniciado
**Given** el datastore debe estar en nodo específico  
**When** se configura placement  
**Then** `node.labels.qws.datastore == true`

### CA5: Resource limits
**Estado:** 🔴 No iniciado
**Given** el nodo tiene recursos finitos  
**When** se configuran recursos  
**Then** limits: 2 CPU, 2GB RAM; reservations: 0.5 CPU, 512MB RAM

---

## Notas Técnicas
- `PGDATA=/var/lib/postgresql/data/pgdata` para evitar problemas de permisos
- `POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=en_US.UTF-8`
- Healthcheck: `pg_isready -U $(cat /run/secrets/qws_db_user) -d quelves`
