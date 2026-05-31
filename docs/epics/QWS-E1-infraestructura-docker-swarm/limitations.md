# limitations.md — QWS-E1: Infraestructura Docker Swarm

> **Proyecto:** Quelves Platform (QWS)

---

## ⚠️ Constraints Técnicos

### CT-1: Docker Swarm requiere cluster inicializado
- **Descripción:** El stack no funciona en un solo nodo sin `docker swarm init`.
- **Impacto:** Requiere al menos 1 nodo manager (idealmente 3 para HA).
- **Mitigación:** Documentar paso de inicialización en runbook.

### CT-2: Traefik debe estar previamente configurado
- **Descripción:** La network `traefik-network` debe existir como external antes del deploy.
- **Impacto:** Primer deploy fallará si Traefik no está corriendo.
- **Mitigación:** Script de validación pre-deploy (`validate-predeploy.sh`).

### CT-3: Datastores con 1 réplica (no HA)
- **Descripción:** PostgreSQL, Redis y MinIO tienen `replicas: 1`.
- **Impacto:** Si el nodo datastore falla, hay downtime y potencial pérdida de datos.
- **Mitigación:** Backups diarios, placement constraints en nodo etiquetado.

### CT-4: Volumen local para persistencia
- **Descripción:** Los volumes usan `driver: local`.
- **Impacto:** No hay replicación de datos entre nodos.
- **Mitigación:** Usar storage replicated (NFS, GlusterFS) o backups en S3.

---

## ⚠️ Constraints de Recursos

### CR-1: Recursos mínimos del nodo
- **CPU:** Mínimo 4 cores recomendados (suma de reservations: ~2 cores)
- **RAM:** Mínimo 8GB recomendados (suma de limits: ~5GB)
- **Storage:** Mínimo 50GB para datos + imágenes Docker

### CR-2: Network overlay
- **Subnet:** `10.0.200.0/24` — debe no colisionar con otras redes del host.

---

## ⚠️ Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Secrets no creados antes del deploy | Alta | Alta | Script `validate-predeploy.sh` |
| Resource limits muy restrictivos | Baja | Media | Monitorear métricas reales |
| Fallo de nodo datastore | Media | Alta | Backups diarios + runbook de recuperación |
| Incompatibilidad de versiones de imágenes | Baja | Media | Fijar versiones de imágenes (no `latest`) |

---

*Mantenido por 🤖 Arch + 🤖 PO*
