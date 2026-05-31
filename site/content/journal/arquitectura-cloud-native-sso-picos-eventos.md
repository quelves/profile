---
title: "Arquitectura Cloud-Native para SSO: Soportando 150K Usuarios en Picos de Eventos"
date: "2025-09-10"
category: "Enterprise Architecture"
excerpt: "Cómo diseñamos el SSO de Megamedia sobre Kubernetes para soportar desde operación normal hasta 150K usuarios concurrentes durante el Festival de Viña del Mar — y por qué el autoscaling automático es la respuesta equivocada para eventos en vivo."
tags: ["Cloud-Native", "SSO", "Keycloak", "Kubernetes", "Escalabilidad", "Huawei Cloud"]
lang: "es"
---

El Single Sign-On es la infraestructura más invisible y más crítica de cualquier plataforma digital. Cuando funciona, nadie lo menciona. Cuando falla, nada más funciona. En Megamedia, el SSO de MEGA GO autentica a 1.91 millones de usuarios activos, y durante el Festival de Viña del Mar 2026 soportó 150,000 usuarios concurrentes sin un solo incidente de autenticación.

Este artículo no es una guía de Keycloak. Es una narrativa de decisiones arquitectónicas cloud-native tomadas para convertir un sistema de autenticación monolítico en una plataforma que escala desde 150 RPS en un martes cualquiera hasta 500 RPS de pico durante un evento masivo — y lo hace de manera predecible, no reactiva.

## El Problema: Cuando el Login se Convierte en el Cuello de Botella

En 2024, el SSO de Megamedia corría en dos máquinas virtuales estáticas. Funcionaba bien para operación normal. Pero cuando un evento deportivo generaba una notificación push a 100,000 usuarios simultáneos, el sistema colapsaba en minutos. No porque Keycloak fuera lento, sino porque la arquitectura subyacente no estaba diseñada para picos de tráfico en oleadas.

Los eventos en vivo — deportivos o culturales — no generan carga uniforme. Generan un patrón de oleadas:

| Fase | Hora | Qué sucede | Carga en SSO |
|---|---|---|---|
| **Pre-evento** | 19:30 | Deploy de configuración, pre-calentamiento | Baja, preparatoria |
| **Ola 1** | 20:00 | Push notification → login masivo | Pico de autenticación |
| **Show** | 20:30 | Usuarios en CDN viendo contenido | Baja (core libre) |
| **Ola 2** | 21:45 | Cambio de artista / medio tiempo | Refresh tokens |
| **Ola 3+** | 23:30, 01:30 | Más transiciones | Picos repetidos |

La trampa es que entre olas la CPU baja al 25-35%. Un autoscaler reactivo interpretaría esto como "sobran recursos" y reduciría pods. Cuando llega la siguiente ola, los pods no están — y Huawei Cloud tarda 2 minutos en provisionar nodos nuevos. Dos minutos en un pico de autenticación es una eternidad.

## La Visión Estratégica: SSO como Plataforma, no como Aplicación

La decisión estratégica más importante fue reconceptualizar el SSO. No es una aplicación que "necesitamos mantener encendida". Es una plataforma de identidad que debe operar con los mismos estándares de confiabilidad que un sistema financiero:

- **Disponibilidad objetivo**: 99.9% (máximo 8.7 horas de downtime al año)
- **RPO/RTO**: RPO = 0 (no perdemos sesiones activas), RTO < 5 minutos
- **Capacidad operativa**: De 150 RPS base hasta 5,000 RPS de pico con la misma arquitectura
- **Costo predecible**: No pagar por capacidad ociosa, pero tampoco arriesgar uptime por ahorro

Esta visión llevó a tres decisiones arquitectónicas fundamentales:

1. **Cloud-native desde cero**: Kubernetes StatefulSet en Huawei Cloud CCE, no VMs estáticas
2. **Configuraciones pre-calculadas por RPS**: No ajustar recursos en calor durante un evento
3. **Anti-scaling durante eventos**: Pre-calentar y mantener, nunca reducir entre olas

## Arquitectura Cloud-Native: Kubernetes + Keycloak + Infinispan

La arquitectura actual corre sobre Huawei Cloud CCE (Kubernetes 1.31+) como un StatefulSet gestionado por Helm:

```
Usuarios → CDN/WAF → ELB Huawei → Traefik Ingress
                                    ↓
                        ┌───────────────────────┐
                        │   Kubernetes CCE      │
                        │  ┌─────┐ ┌─────┐     │
                        │  │KC-0 │ │KC-1 │ ... │  StatefulSet
                        │  │ 8c  │ │ 8c  │     │  (3-15 pods)
                        │  │17GB │ │17GB │     │
                        │  └──┬──┘ └──┬──┘     │
                        │     └───────┘        │
                        │    JGroups TCP        │
                        │  Infinispan Cache     │
                        │   CACHE_OWNERS=2      │
                        └──────────┬────────────┘
                                   ↓
                        ┌───────────────────────┐
                        │  RDS PostgreSQL 14    │
                        │  (4,200 conexiones)   │
                        └───────────────────────┘
```

### ¿Por qué StatefulSet y no Deployment?

Keycloak con Infinispan distribuido requiere identidad persistente de pod. Cada pod tiene:
- Un nombre estable (`keycloak-0`, `keycloak-1`)
- Una vista de cluster JGroups que sobrevive reinicios
- Un fragmento de caché distribuida con `CACHE_OWNERS_COUNT=2`

Un Deployment recrea pods con nombres aleatorios, rompiendo la membresía del cluster. El StatefulSet permite que un pod que se reinicia re-ingrese al cluster con la misma identidad y recupere su fragmento de caché.

### Discovery con DNS_PING

En Kubernetes, los pods se descubren entre sí mediante `DNS_PING` sobre el headless service de Keycloak. Cuando un pod nuevo arranca:

1. Resuelve el DNS del servicio para obtener IPs de peers existentes
2. Se une al cluster JGroups vía TCP (no UDP, por restricciones de red de Huawei Cloud)
3. Inicia state transfer desde los peers que tienen sus datos
4. Una vez sincronizado, empieza a servir tráfico

El state transfer de 100,000 sesiones toma 2-5 minutos. Esto es la razón fundamental del anti-scaling: no podemos permitir que un pod nuevo entre en calor durante una ola.

## Dos Modos de Operación: OPT-V4 y FVM 2026

La operación del SSO se divide en dos configuraciones pre-calculadas, no en ajustes dinámicos:

### OPT-V4: Operación Normal

| Parámetro | Valor | Justificación |
|---|---|---|
| **Nodo** | c6.3xlarge.2 (12 vCPU / 24 GB) | Ratio CPU/thread optimizado |
| **CPU/Pod** | 8 vCPU (67% del nodo) | Margen de seguridad 70% Huawei |
| **RAM/Pod** | 17 GB (70% del nodo) | Evita alertas críticas de CCE |
| **JVM Heap** | ~8.5 GB (50% de RAM) | G1GC eficiente, pausas <200ms |
| **Undertow Workers** | 192 | Ratio 20:1, CPU-bound |
| **DB Pool** | 80 conexiones/pod | 400 total a 5 pods, 90% margen BD |
| **Réplicas** | 3-15 (manual) | Escalado controlado |

OPT-V4 es la configuración base validada el 6 de marzo de 2026. Con 5 pods soportó 1,500 RPS en pruebas k6 con 0% de errores. Para operación normal (<150 RPS), corre con 3 pods. Para picos predecibles, escala manualmente a 5-8.

### FVM 2026: Evento Masivo

| Parámetro | Valor | Justificación |
|---|---|---|
| **Nodo** | c7n.6xlarge.2 (24 vCPU / 48 GB) | Doble capacidad por pod |
| **CPU/Pod** | 16 vCPU (67% del nodo) | 70% de seguridad en flavor mayor |
| **RAM/Pod** | 32 GB | 16 GB heap + 4 GB DirectMemory + margen |
| **JVM Heap** | 16 GB (50%) | G1GC <50ms pausas |
| **Undertow Workers** | 320 | Ratio 20:1 en 16 vCPU |
| **DB Pool** | 80 conexiones/pod | 1,200 total a 15 pods, 71% margen |
| **Réplicas** | 5-15 (pre-calentado) | Sin HPA durante evento |

FVM 2026 fue la configuración usada para el Festival de Viña del Mar 2026. Arrancó con 5 pods pre-calentados a las 19:30 y escaló manualmente a 8 durante las olas. Nunca se redujo entre artistas.

### Matriz de Configuración por RPS

| Evento | Usuarios Concurrentes | RPS Target | Configuración | Réplicas |
|---|---|---|---|---|
| Operación normal | ~5,000-10,000 | ≤1,500 | OPT-V4 | 3-5 |
| Partido regular | ~3,000-5,000 | 300-500 | 300/500 RPS | 3-4 |
| Copa del Rey | ~60,000 | 5,000 | Evento | 10 |
| Festival de Viña | ~150,000 | 3,000-4,000 | FVM 2026 | 5-15 |
| El Clásico | ~100,000 | 10,000 | 10K RPS | 20 |
| Champions Final | ~250,000 | 25,000 | 25K RPS | 30 |

> **Nota crítica**: Los RPS target son para tráfico real. Las pruebas k6 sintéticas generan 3-10x más carga computacional por RPS debido al churn de sesiones. Una prueba de 1,500 RPS en k6 equivale a aproximadamente 3,000-4,000 RPS de tráfico real.

## La Lección del CPU-Bound: Por Qué Redujimos el Heap

Una de las decisiones técnicas más contraintuitivas fue reducir el heap JVM de 24 GB a 16 GB (y en OPT-V4, de 18 GB a 8.5 GB).

Keycloak realiza operaciones criptográficas intensivas: PBKDF2 para hash de contraseñas, firmas JWT con RS256, validación de tokens en cada request. Estas operaciones saturan CPU antes de agotar memoria. El sistema es **CPU-bound, no memory-bound**.

| Configuración | Heap | G1GC Pauses | Startup | Throughput |
|---|---|---|---|---|
| OPT-V3 (anterior) | 18 GB | 200-400ms | 8-10 min | Bueno |
| **OPT-V4** | **8.5 GB** | **<200ms** | **5-7 min** | **Óptimo** |
| FVM 2026 | 16 GB | <50ms | 5-7 min | Óptimo |

Con heap más pequeño:
- G1GC recolecciones son más frecuentes pero más cortas
- El startup del pod es más rápido (menor inicialización de heap)
- Menor presión de memoria reduce riesgo de OOM Killer
- El CPU liberado se destina a threads de cálculo criptográfico

La regla de oro que emergió: **heap = 50% de RAM asignada**, nunca más. El resto se reserva para DirectMemory (buffers NIO de Undertow), cachés nativas de Infinispan, y el sistema operativo.

## El Patrón de Oleadas: Anti-Scaling como Estrategia

Durante años, la ortodoxia cloud-native ha predicado: "escala automáticamente según demanda". Para eventos en vivo, esto es peligroso. La demanda entre olas es un valle que mata.

```
19:30 ── Pre-warm: 5 pods fijos, HPA desactivado
20:00 ── OLA 1: CPU 25% → 85% (login masivo)
20:30 ── Show: CPU 85% → 25% (usuarios en CDN)
        ❌ HPA diría "sobran pods" → scale down
        ✅ Nosotros decimos "mantener caliente"
21:45 ── OLA 2: CPU 25% → 75% (refresh tokens)
        ✅ Pods ya están, sin delay de provisioning
```

### Timeline Operativo FVM 2026

| Hora | Acción | Pods | HPA |
|---|---|---|---|
| 19:30 | Pre-warming | 5 | Desactivado |
| 19:45 | Validación post-deploy | 5 | Desactivado |
| 20:00 | Inicio evento | 5-8 | Desactivado |
| 20:00-03:00 | Evento activo | 5-15 (manual) | Desactivado |
| 03:00 | Fin evento | 8 | Desactivado |
| 03:30 | Cooldown | 8→5→3 | Reactivado gradual |

El costo de mantener 8 pods ociosos entre olas es insignificantemente menor que el costo de reputación de usuarios que no pueden autenticarse porque el sistema está provisionando nodos.

## Métricas de Producción: La Falacia del Factor 3.2x

En febrero de 2026, antes del Festival de Viña, ejecutamos pruebas de carga k6 que reportaron 1,600 RPS pico con 2,000 VUs. La primera interpretación fue: "tenemos factor de seguridad 3.2x sobre los 500 RPS esperados". Esta conclusión era matemáticamente correcta y operacionalmente peligrosa.

### Por qué las pruebas sintéticas no correlacionan

| Dimensión | Test k6 | Tráfico Real | Diferencia |
|---|---|---|---|
| Churn de sesiones | Login→logout cada 5s | Login 1x cada 3-7 días | **225x más intensivo** |
| Think time | 1-2 segundos | Minutos entre acciones | **36x más denso** |
| Token refresh | Cada 4 segundos | Cada 30 minutos | **450x más frecuente** |
| CPU por RPS | ~50% estimado | 5% medido | **10x más eficiente** |

Un usuario real genera ~2 operaciones de autenticación por hora (login + refresh ocasional). Un VU de k6 generaba 450 operaciones de auth/hora. La prueba medía throughput sintético, no capacidad de usuarios reales.

### Métricas Reales del Festival de Viña 2026

| Métrica | Valor medido |
|---|---|
| **Usuarios concurrentes** | 150,000 |
| **RPS pico real** | ~500 RPS |
| **CPU durante pico** | ~5% |
| **Latencia P95** | 14.5 ms |
| **Error rate** | 0.00% |
| **Incidentes** | 0 |

El sistema operó a 5% de CPU durante el pico más alto del evento. Esto no significa que estuviera sobredimensionado. Significa que el tráfico real es organizamente diferente del tráfico sintético. Los usuarios reales mantienen sesiones largas, hacen refresh token cada 30 minutos, y pasan la mayor parte del tiempo en CDN — no golpeando el SSO.

### Modelo de Capacidad Ajustado

| Escenario | RPS Real | CPU Est. | Latencia P95 | Estado |
|---|---|---|---|---|
| Baseline | 122 | 1.2% | 10ms | ✅ Normal |
| Pico FVM | 500 | 5% | 14.5ms | ✅ Evento |
| Capacidad cómoda | 2,000 | 20% | ~50ms | ✅ Seguro |
| Límite threads | 5,000 | 50% | ~200ms | ⚠️ Saturación |
| Colapso GC | 8,000+ | 80%+ | >1,000ms | 🔴 Inestable |

La capacidad real del sistema es ~2,000 RPS con degradación aceptable, y ~5,000 RPS antes de que los threads de Undertow se saturen. El cuello de botella no es CPU ni memoria: es el número de workers disponibles para procesar requests concurrentes.

## Cuellos de Botella y Decisiones Arquitectónicas

### Cuello de Botella #1: ELB Huawei (~8,000 RPS)

El Elastic Load Balancer de Huawei Cloud tiene un límite técnico de ~8,000 RPS. Para eventos mayores (Champions, Mundial), hemos solicitado aumento de límite. Este es el cuello de botella más crítico porque está fuera de nuestro control directo.

### Cuello de Botella #2: Infinispan State Transfer (2-5 min)

Cuando un pod nuevo se une al cluster con 100,000 sesiones activas, debe sincronizar ~50 MB de datos desde 19 peers (en un cluster de 20 pods). Durante este tiempo:
- El pod nuevo no sirve tráfico
- Los peers dedican CPU a la transferencia
- La latencia del cluster aumenta 10-20%

**Mitigación**: Pre-warming obligatorio. Nunca agregar pods fríos durante una ola.

### Cuello de Botella #3: JGroups Overhead (+10% CPU)

En un cluster de 20 pods, JGroups genera ~1,140 heartbeats/segundo. El overhead estimado es ~10% de CPU adicional del cluster. Aceptable hasta 15 pods. Después de 15, cada réplica adicional aporta menos capacidad marginal.

| Réplicas | Capacidad total | Eficiencia | Recomendación |
|---|---|---|---|
| 5 | 3,500 RPS | 100% | ✅ Base estable |
| 8 | 5,420 RPS | 90% | ✅ Óptimo FVM |
| 10 | 6,800 RPS | 90% | ✅ Mejor costo/beneficio |
| 15 | 9,000 RPS | 80% | ⚠️ State transfer lento |
| 20 | 12,000 RPS | 70% | ⚠️ Máximo técnico |

### Decisión: Node Affinity Obligatoria

La configuración OPT-V4 tiene `nodeAffinity` obligatoria para `c6.3xlarge.2`. Los pods no se programan en otros flavors. Esto no es una restricción arbitraria: los ratios de threads (20:1 para Undertow, 10:1 para EJB) están calculados específicamente para 12 vCPUs. Correr en un nodo con 8 vCPUs haría que Undertow solicite 160 workers para 8 cores, generando thrashing de contexto.

### Decisión: Prohibir kubectl exec en Producción

En febrero de 2026 confirmamos que ejecutar `jboss-cli.sh --connect` vía `kubectl exec` activa el OOM Killer de Kubernetes. El comando consume memoria adicional que empuja el pod sobre el límite, y Kubernetes lo mata.

**Solución**: Toda la configuración se aplica mediante ConfigMap + `embed-server` (modo offline CLI). Las validaciones en producción son de solo lectura: métricas vía endpoint de Prometheus, logs vía `kubectl logs`, y variables de entorno vía `kubectl get pod -o jsonpath`.

## La Operación: Checklists, Runbooks y Cultura

La arquitectura cloud-native no es solo tecnología. Es cultura operativa. Para cada evento seguimos un checklist de 30+ ítems validados por scripts automatizados:

**Pre-deploy (19:30)**
- [ ] Node affinity verificada para flavor correcto
- [ ] Resource limits ≤70% de capacidad del nodo
- [ ] JVM heap = 50% de RAM, G1GC configurado
- [ ] Undertow workers = ratio 20:1
- [ ] EJB pools: SLSB = ratio 10:1, MDB = ratio 2:1
- [ ] DB pool = 80 conexiones/pod
- [ ] JGroups cluster formado sin errores
- [ ] Probes: timeouts correctos (no 1s como en el incidente de enero 2026)
- [ ] PDB: minAvailable ≤ réplicas
- [ ] Backup de configuración anterior

**Durante el evento (20:00-03:00)**
- [ ] CPU < 70%, memoria < 70%
- [ ] Latencia P95 < 500ms
- [ ] Error rate < 1%
- [ ] Pods ready = esperados
- [ ] Comando de rollback a mano
- [ ] Plan de escalado de emergencia (hasta 15 pods)

El script de validación `validar-fvm-2026-config.sh` ejecuta estos checks en ~30 segundos sin tocar un solo pod en ejecución.

## Visión de Futuro: Hacia el SSO Autónomo

La arquitectura actual es reactiva en su mejor momento. Pre-calentamos, monitoreamos, escalamos manualmente. La próxima evolución es un SSO que se configure automáticamente según el calendario de eventos:

1. **Calendario de eventos integrado**: El sistema lee la programación de MEGA GO y pre-calienta automáticamente 30 minutos antes
2. **Decision tree de configuración**: Según el tipo de evento (fútbol, FVM, concierto), aplica la configuración de RPS correspondiente sin intervención humana
3. **Predictive scaling**: Modelos de ML que predicen la ola basándose en patrones históricos (qué artista genera más tráfico, qué partido de fútbol moviliza más usuarios)
4. **Multi-region failover**: Replicación de sesiones entre zonas de disponibilidad de Huawei Cloud para tolerancia a fallos de región

El objetivo no es eliminar a los operadores. Es eliminar las decisiones mecánicas repetitivas para que los operadores se concentren en lo impredecible.

## La Lección

La arquitectura cloud-native no es sobre usar Kubernetes, Helm o autoscalers. Es sobre diseñar sistemas que entienden su propio comportamiento bajo estrés y se preparan para él de manera predecible.

Las lecciones del SSO de Megamedia son aplicables a cualquier sistema crítico que enfrente cargas variables:

1. **Conoce tu carga real**: Las pruebas sintéticas son útiles para encontrar cuellos de botella, no para estimar capacidad de usuarios reales
2. **Pre-calienta, no reactives**: El provisioning de la nube tarda minutos; los picos de tráfico duran segundos
3. **Optimiza para el recurso correcto**: Keycloak es CPU-bound; un heap más grande no ayuda, un GC más eficiente sí
4. **Documenta tus decisiones**: Cada valor de configuración tiene una razón documentada. No hay "magia" en la configuración
5. **Opera con checklists**: La infraestructura más confiable es la que se valida sistemáticamente, no la que depende de la memoria de un experto

> "El SSO no es un costo operativo. Es un activo estratégico. Cuando un usuario puede autenticarse en 14.5ms durante el evento más visto del año, no está viendo Keycloak ni Kubernetes. Está viendo una plataforma que respeta su tiempo."
