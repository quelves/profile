# QWS-E1-H4: Configurar MinIO como object storage para media assets

> **Estado:** 🔴 No iniciado  
> **SP:** 3  
> **Agente:** 🤖 Arch + 🤖 DevBE

---

## Criterios de Aceptación

### CA1: Servicio MinIO configurado
**Estado:** 🔴 No iniciado
**Given** la plataforma almacena imágenes y documentos  
**When** se despliega `qws_minio`  
**Then** usa imagen `minio/minio:latest`, command `server /data --console-address ":9001"`

### CA2: Secrets para MinIO
**Estado:** 🔴 No iniciado
**Given** las credenciales de MinIO deben ser seguras  
**When** se crean secrets  
**Then** existen `qws_minio_user`, `qws_minio_pass` como Docker Swarm secrets

### CA3: Routing Traefik
**Estado:** 🔴 No iniciado
**Given** MinIO console debe ser accesible via HTTPS  
**When** se configuran labels  
**Then** `storage.quelves.com` apunta al puerto 9001 con TLS

### CA4: Volumen persistente
**Estado:** 🔴 No iniciado
**Given** los objetos deben persistir  
**When** se configura el volumen  
**Then** `qws_minio_data` monta en `/data`

---

## Notas Técnicas
- Bucket inicial `qws-media` para assets de la plataforma
- Política de bucket: public-read para imágenes públicas, private para documentos
