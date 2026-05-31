# QWS-E1-H5: Configurar observabilidad: Prometheus + Grafana + exporters

> **Estado:** 🔴 No iniciado  
> **SP:** 5  
> **Agente:** 🤖 SRE + 🤖 Arch

---

## Criterios de Aceptación

### CA1: Prometheus configurado
**Estado:** 🔴 No iniciado
**Given** se necesitan métricas del stack  
**When** se despliega `qws_prometheus`  
**Then** recolecta métricas de app, node, cadvisor, con retention 30d

### CA2: Grafana configurado
**Estado:** 🔴 No iniciado
**Given** se necesitan dashboards  
**When** se despliega `qws_grafana`  
**Then** accesible en `monitor.quelves.com`, con datasource Prometheus

### CA3: cAdvisor global
**Estado:** 🔴 No iniciado
**Given** se necesitan métricas de contenedores  
**When** se despliega `qws_cadvisor`  **Then** modo global, recolecta métricas de todos los nodos

### CA4: Node Exporter global
**Estado:** 🔴 No iniciado
**Given** se necesitan métricas de host  
**When** se despliega `qws_node_exporter`  
**Then** modo global, recolecta CPU, memoria, disco, red

### CA5: Config de Prometheus como external config
**Estado:** 🔴 No iniciado
**Given** la config de Prometheus debe ser versionable  
**When** se define config  
**Then** `qws_prometheus_config` es external config en Docker Swarm

---

## Notas Técnicas
- Grafana plugins: `grafana-clock-panel`, `grafana-simple-json-datasource`
- Secrets: `qws_grafana_user`, `qws_grafana_pass`
- Prometheus targets: qws_app, qws_postgres (postgres_exporter futuro), cadvisor, node_exporter
