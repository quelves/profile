# QWS-E1-H8: Crear runbooks de operación y deploy

> **Estado:** 🔴 No iniciado  
> **SP:** 3  
> **Agente:** 🤖 SRE + 🤖 Scribe

---

## Criterios de Aceptación

### CA1: Runbook de deploy inicial
**Estado:** 🔴 No iniciado
**Given** se necesita desplegar el stack por primera vez  
**When** se sigue el runbook  
**Then** el stack se despliega correctamente paso a paso

### CA2: Runbook de deploy de actualización
**Estado:** 🔴 No iniciado
**Given** se necesita actualizar una imagen  
**When** se sigue el runbook  
**Then** se actualiza con zero-downtime usando rolling update

### CA3: Runbook de rollback
**Estado:** 🔴 No iniciado
**Given** un deploy falló  
**When** se sigue el runbook  
**Then** se revierte a la versión anterior del servicio

### CA4: Runbook de backup y recuperación
**Estado:** 🔴 No iniciado
**Given** se necesita respaldar o recuperar datos  
**When** se sigue el runbook  
**Then** documenta backup de PostgreSQL, Redis, MinIO y procedimiento de restore

---

## Notas Técnicas
- Ubicación: `docs/operations/runbooks/`
- Formato: Markdown con comandos copiables
- Incluir verificaciones post-operación
