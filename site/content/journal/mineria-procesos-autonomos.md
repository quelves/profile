---
title: "De la Observación de Procesos a la Corrección Autónoma: Un Arco de 25 Años"
date: "2025-11-20"
category: "Enterprise Architecture"
excerpt: "Mi paper IEEE de 2016 sobre process mining en publicidad fue un primer paso para entender cómo extraer inteligencia accionable desde logs de ejecución. Hoy, esa investigación evoluciona hacia sistemas que no solo analizan procesos, sino que los corrigen autónomamente."
tags: ["Process Mining", "Sistemas Autónomos", "Análisis de Procesos", "MEGA GO", "Investigación"]
lang: "es"
---

En 2016 publiqué un paper en IEEE sobre process mining aplicado a publicidad digital. El trabajo demostraba cómo extraer patrones de comportamiento desde logs de ejecución de campañas publicitarias para optimizar la asignación de presupuesto entre canales. En ese momento, pensé que el siguiente paso sería construir dashboards más sofisticados.

Me equivoqué. El siguiente paso no es mejor visualización. El siguiente paso es **acción autónoma**.

Este artículo describe el arco intelectual que conecta ese paper de 2016 con mi investigación doctoral actual: un viaje desde el análisis descriptivo de procesos hacia sistemas que observan, predicen y corrigen procesos organizacionales sin intervención humana.

## Fase 1: Observación (1998–2016)

Mi primer contacto con la extracción de conocimiento desde datos de ejecución fue en 1998, construyendo el registro nacional de salud de Brasil. El sistema generaba logs de cada transacción: quién accedía a qué registro, cuándo, desde qué hospital, con qué resultado. En ese entonces, estos logs servían principalmente para auditoría y cumplimiento legal.

En 2004, trabajando con motores de búsqueda en GuiaMais, comencé a analizar logs de consultas para entender patrones de comportamiento de usuario. ¿Qué términos de búsqueda llevaban a conversiones? ¿Qué patrones de navegación indicaban intención de compra? Esto era analytics descriptivo primitivo, pero ya apuntaba hacia algo más grande: **los logs de ejecución contienen inteligencia que los sistemas tradicionales desperdician**.

El paper de 2016 formalizó esta intuición. Usando técnicas de process mining sobre logs de ejecución de una plataforma de publicidad digital, demostramos que era posible:
- Reconstruir el flujo real de procesos de negocio (no el flujo documentado)
- Identificar cuellos de botella donde las campañas perdían eficiencia
- Detectar desviaciones entre el proceso diseñado y el proceso ejecutado
- Cuantificar el impacto financiero de cada desviación

El paper concluía con una recomendación que hoy reconozco como limitada: usar estos insights para que los gerentes tomen mejores decisiones. La limitación no estaba en el análisis. Estaba en la suposición de que la respuesta correcta a un insight era **informar a un humano**.

## Fase 2: Análisis Predictivo (2016–2020)

Después del paper, el trabajo natural era extender el análisis desde descriptivo hacia predictivo. En lugar de preguntar *"¿qué pasó?"*, comenzamos a preguntar *"¿qué va a pasar?"*.

En gurú (Yell LATAM), aplicamos modelos predictivos sobre logs de procesos de venta:
- ¿Qué leads tienen mayor probabilidad de convertir basándose en su trayectoria a través del proceso?
- ¿En qué etapa del funnel se pierden los clientes más valiosos?
- ¿Qué patrones de comportamiento del equipo de ventas correlacionan con mayores ingresos?

Los resultados fueron útiles pero frustrantes. Los modelos predictivos generaban insights accionables, pero la acción requería que alguien leyera el reporte, entendiera la recomendación, decidiera actuar, y ejecutara el cambio. El lag entre predicción y acción era de días o semanas. Para cuando alguien actuaba, las condiciones habían cambiado.

La lección fue clara: **predecir sin capacidad de actuación autónoma es como diagnosticar una enfermedad sin poder prescribir tratamiento**.

## Fase 3: Prescripción Automatizada (2020–2024)

En Megamedia, la plataforma MEGA GO genera millones de eventos diarios: usuarios que se autentican, contenido que se reproduce, pagos que se procesan, anuncios que se sirven. Cada evento es un punto de datos que describe el estado del sistema en un momento dado.

Construimos pipelines de analytics que no solo predicen: **prescriben**. Por ejemplo:

**Prescripción de contenido**: Cuando el modelo detecta que un segmento de usuarios está abandonando la plataforma (churn prediction), el sistema no solo alerta: automáticamente genera una campaña de retención con contenido personalizado, descuentos específicos, y notificaciones push dirigidas.

**Prescripción de infraestructura**: Cuando los logs de streaming muestran degradación de calidad de video en una región específica, el sistema no solo reporta: automáticamente redirige tráfico a un CDN alternativo y escala capacidad en esa región.

**Prescripción de monetización**: Cuando el análisis de logs de suscripción detecta que un usuario está a punto de cancelar, el sistema genera automáticamente una oferta de retención personalizada basada en su historial de visualización.

Estas prescripciones automatizadas demostraron que la acción autónoma era posible, pero tenían una limitación: **cada prescripción estaba hard-coded para un dominio específico**. El sistema sabía cómo retener usuarios de OTT, pero no sabía cómo aplicar la misma lógica a procesos de venta o soporte técnico.

## Fase 4: Corrección Autónoma (2024–Próximo)

La investigación doctoral actual busca generalizar la prescripción automatizada hacia **corrección autónoma de procesos**. La diferencia es sutil pero profunda:

- **Prescripción automatizada**: Un sistema humano diseña una regla (*"si churn > 80%, enviar descuento"*), y el sistema la ejecuta automáticamente.
- **Corrección autónoma**: El sistema detecta un problema, formula una hipótesis sobre su causa, diseña un remedio, ejecuta el remedio, y verifica si el problema se resolvió — todo sin que un humano haya definido la regla de antemano.

La arquitectura de corrección autónoma que estamos diseñando consta de cuatro componentes:

### 1. Observabilidad de Proceso

No solo métricas técnicas (CPU, memoria, latencia), sino **métricas de proceso**: ¿Cuánto tiempo toma un usuario completar una suscripción? ¿Cuántos pasos requiere? ¿Dónde abandonan? ¿Cómo varía esto por segmento, por hora, por dispositivo?

En MEGA GO, esto se implementa mediante:
- **Distributed tracing** (OpenTelemetry) que sigue cada transacción de negocio a través de microservicios
- **Event sourcing** donde el estado del sistema se reconstruye desde un log inmutable de eventos
- **Real-user monitoring** (Youbora) que mide la experiencia de calidad de video como proxy de satisfacción

### 2. Detección de Anomalías de Proceso

Un modelo de machine learning entrenado sobre logs históricos aprende qué constituye comportamiento "normal" del proceso. Cuando el comportamiento actual se desvía significativamente, el sistema detecta una anomalía.

Las anomalías pueden ser:
- **Sistémicas**: Todo el proceso se vuelve más lento (por ejemplo, latencia de autenticación aumenta 3x)
- **Segmentadas**: Un subconjunto de usuarios experimenta degradación (por ejemplo, usuarios de Android TV en regiones rurales)
- **Estructurales**: El flujo del proceso cambia (por ejemplo, 40% de usuarios saltan un paso que antes completaban)

### 3. Diagnóstico Causal

La detección de anomalías responde *"algo está mal"*. El diagnóstico causal responde *"¿por qué?"*.

Usamos técnicas de causal inference sobre logs de ejecución para distinguir correlación de causalidad. Por ejemplo: si la tasa de abandono de suscripción aumenta después de un deployment, ¿fue el deployment la causa? ¿O fue un cambio en pricing que ocurrió el mismo día? ¿O una degradación de CDN que afectó la experiencia de streaming?

El diagnóstico causal en producción es difícil porque los sistemas empresariales tienen múltiples variables cambiantes simultáneamente. Nuestro enfoque combina:
- **Análisis de contrafactuales**: ¿Qué habría pasado si no hubiéramos hecho el deployment?
- **Aislamiento de variables**: Pruebas A/B en producción donde un subconjunto de usuarios recibe el cambio y otro no
- **Modelado gráfico causal**: Representar conocimiento de dominio como un grafo causal que guía la inferencia

### 4. Ejecución de Remedio y Verificación

Una vez diagnosticada la causa, el sistema ejecuta un remedio y verifica su efectividad:
- **Remedio**: Si el diagnóstico indica que un microservicio tiene un memory leak, el sistema reinicia la instancia y aumenta el pool de conexiones
- **Verificación**: Monitorea métricas de proceso durante 15 minutos post-remedio para confirmar que la anomalía se resolvió
- **Rollback**: Si el remedio empeora la situación, el sistema revierte automáticamente y escala el incidente a un humano

## El Caso de Estudio: Festival de Viña 2026

Durante el Festival de Viña 2026, la plataforma MEGA GO procesó 150,000 usuarios concurrentes. Los logs generados permitieron observar un caso interesante de corrección semi-autónoma:

**Anomalía detectada**: 40 minutos después del inicio del evento, la tasa de autenticación exitosa cayó de 98% a 87%. La detección fue automática (threshold-based alerting).

**Diagnóstico**: El análisis de logs mostró que los fallos estaban concentrados en usuarios con tokens OAuth2 emitidos más de 12 horas antes. La causa: una configuración de TTL de caché de Redis que no había sido actualizada después de un cambio reciente en Keycloak.

**Remedio**: El equipo de operaciones ejecutó manualmente un flush de caché de sesión y ajustó el TTL. El tiempo total entre detección y resolución fue 8 minutos.

**La lección**: En 2026, el diagnóstico requirió un humano. En 2027, el objetivo es que el sistema detecte, diagnostique y ejecute el remedio sin intervención humana — porque el Checkpoint Protocol de MEGA IA Skills ya tiene el conocimiento de dominio necesario para entender la relación entre tokens OAuth2, Redis TTL, y tasas de autenticación.

## La Conexión con la Investigación Doctoral

La línea de investigación en Process Intelligence & Mining es una de las tres columnas de mi tesis. Su contribución específica es demostrar que:

1. **Los logs de ejecución son una fuente de conocimiento subutilizada**: La mayoría de las organizaciones almacenan logs para cumplimiento y debugging, pero no los usan para optimización de procesos.

2. **El análisis debe evolucionar desde descriptivo hacia autónomo**: Cada fase del arco (observación → predicción → prescripción → corrección) representa un orden de magnitud de valor agregado.

3. **La corrección autónoma requiere conocimiento de dominio**: Un sistema genérico no puede diagnosticar por qué falla la autenticación de un OTT. Necesita entender la arquitectura, las dependencias, y el contexto de negocio.

## La Lección

La minería de procesos no es una disciplina de visualización. Es una disciplina de acción. El valor no está en saber qué pasó. Está en que el sistema haga algo al respecto antes de que un humano se dé cuenta de que hay un problema.

Las organizaciones que invierten en observabilidad de proceso hoy — no solo métricas técnicas, sino métricas de negocio derivadas de logs de ejecución — están construyendo la fundación para sistemas autónomos mañana. Las que no, seguirán viendo dashboards mientras sus procesos se degradan en silencio.
