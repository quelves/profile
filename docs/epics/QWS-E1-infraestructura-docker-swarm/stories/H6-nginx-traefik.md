# QWS-E1-H6: Configurar Traefik labels y routing para servicios

> **Estado:** 🔴 No iniciado  
**SP:** 3  
> **Agente:** 🤖 SRE + 🤖 Arch

---

## Criterios de Aceptación

### CA1: Routing de aplicación principal
**Estado:** 🔴 No iniciado
**Given** la app debe responder en el dominio principal  
**When** se accede a `quelves.com` o `www.quelves.com`  
**Then** Traefik enruta al servicio `qws_app` en puerto 3000 con TLS

### CA2: Healthcheck en load balancer
**Estado:** 🔴 No iniciado
**Given** el LB debe saber si la app está sana  
**When** se configura Traefik  
**Then** healthcheck path `/api/health`, interval 10s, timeout 5s

### CA3: Routing de MinIO
**Estado:** 🔴 No iniciado
**Given** MinIO console debe ser accesible  
**When** se accede a `storage.quelves.com`  
**Then** Traefik enruta al servicio `qws_minio` en puerto 9001 con TLS

### CA4: Routing de Grafana
**Estado:** 🔴 No iniciado
**Given** Grafana debe ser accesible  
**When** se accede a `monitor.quelves.com`  
**Then** Traefik enruta al servicio `qws_grafana` en puerto 3000 con TLS

### CA5: TLS automático
**Estado:** 🔴 No iniciado
**Given** se requiere HTTPS  
**When** se configura Traefik  
**Then** usa `certresolver=letsencrypt` para TLS automático

---

## Notas Técnicas
- Traefik corre fuera del stack (external network `traefik-network`)
- Labels deben incluir: `traefik.enable=true`, `traefik.docker.network=traefik-network`
- TLS: true en todos los routers
