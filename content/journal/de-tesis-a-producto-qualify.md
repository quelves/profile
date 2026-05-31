---
title: "De Tesis de Magíster a Pensamiento de Producto: Diseñando la Plataforma QUALIFY"
date: "2015-12-07"
category: "Digital Platforms & Product Strategy"
excerpt: "Una tesis de 71 páginas que anticipó la economía de plataformas de hoy. Diseñando un modelo de negocio y arquitectura tecnológica para una comunidad de expertos, usuarios y empresas para calificar, recomendar y comercializar productos y servicios."
tags: ["Estrategia de Producto", "Business Model Canvas", "Lean Startup", "SOA", "Arquitectura de Plataforma"]
lang: "es"
---

En 2015, mientras completaba mi Magíster en Tecnologías de la Información y Gestión en la Pontificia Universidad Católica de Chile, enfrenté una pregunta que sigue siendo relevante hoy: **¿cómo toman buenas decisiones los consumidores cuando están abrumados por elección infinita?**

Esta pregunta se convirtió en la fundación de mi tesis de graduación — un trabajo de 71 páginas que diseñó tanto el modelo de negocio como la arquitectura tecnológica para **QUALIFY INC**, una plataforma para ayudar a los consumidores a navegar la complejidad a través de validación experta y recomendaciones impulsadas por la comunidad.

## La Paradoja de la Elección

La tesis comenzó con la observación de Barry Schwartz: más elección no conduce a mejores decisiones. Cuando los consumidores enfrentan cientos de productos similares, experimentan parálisis de decisión, estrés y finalmente resultados pobres. Esto era cierto en 2005 cuando Schwartz publicó *La Paradoja de la Elección*. Es exponencialmente más cierto hoy.

El contexto específico era el mercado de e-commerce chileno, que crecía rápidamente pero carecía de mecanismos para que los consumidores validaran calidad antes de la compra. Los usuarios tenían acceso a productos, pero no a sistemas de calificación confiables.

## Diseño del Modelo de Negocio

La tesis aplicó un enfoque de doble lente:

**Lente de Innovación de Negocio**: Usando Business Model Canvas, Lean Canvas y metodología Lean Startup, diseñé una plataforma donde tres actores interactúan:
- **Expertos** que validan y califican productos
- **Usuarios** que acceden a recomendaciones y reviews de comunidad
- **Empresas** que comercializan productos calificados

El modelo de ingresos combinaba suscripciones B2C, comisiones de marketplace B2B y servicios premium de expertos. El Lean Canvas ayudó a priorizar las asunciones más riesgosas: ¿confiarían los usuarios en opiniones de expertos? ¿pagarían las empresas por leads calificados?

**Lente de Arquitectura Tecnológica**: La arquitectura de plataforma fue diseñada como Arquitectura Orientada a Servicios (SOA) con APIs REST, usando:
- Java Spring Framework para servicios backend
- Angular para la plataforma web comunitaria
- Infraestructura AWS cloud para elasticidad
- MongoDB y MySQL para persistencia políglota
- SCRUM como metodología de desarrollo

La arquitectura separó responsabilidades en servicios independientes: gestión de usuarios, catálogo de productos, motor de calificación, sistema de recomendación y transacciones comerciales.

## Metodología y Validación

La tesis siguió el Customer Development Process combinado con iteraciones Ágiles:
1. **Descubrimiento del problema** — entrevistas con 50+ usuarios potenciales y 15 empresas
2. **Hipótesis de solución** — prototipo del workflow de calificación
3. **Diseño de MVP** — plataforma mínima para testear el core loop
4. **Pivotar o perseverar** — framework de decisión basado en datos

ArchiMate fue usado para modelado de arquitectura empresarial, asegurando alineación entre procesos de negocio, aplicaciones e infraestructura tecnológica.

## Por Qué Esto Importa Hoy

Mirando hacia atrás desde 2024, varios elementos de esta tesis de 2015 resultaron premonitorios:

- **Confianza mediada por plataforma** — la idea central de que la validación experta reduce la fatiga de decisión es la fundación de las plataformas de reviews modernas, commerce de influencer y sistemas de recomendación por IA
- **SOA y microservicios** — el enfoque arquitectónico de servicios desacoplados comunicándose vía APIs se convirtió en el estándar de la industria
- **Lean Startup en la empresa** — la tesis aplicó metodología de startup dentro de un contexto académico, anticipando los laboratorios de innovación corporativa que siguieron
- **Cloud-native por defecto** — diseñar para elasticidad AWS desde el día uno era visionario en 2015

La tesis también me enseñó algo sobre la relación entre investigación y práctica. Un documento académico de 71 páginas no es un producto. Pero la disciplina de documentar asunciones, testear hipótesis y arquitectar para escala — esa disciplina se traduce directamente en el trabajo de transformación empresarial que hago hoy.

## Aprendizajes Clave

**Sobre innovación de modelo de negocio**: Los frameworks Canvas no son plantillas para rellenar. Son herramientas de pensamiento para revelar asunciones ocultas. El output más valioso del ejercicio no fue el canvas en sí, sino la lista de hipótesis que necesitaban validación.

**Sobre arquitectura tecnológica**: Diseñar la arquitectura antes de construir me enseñó que cada decisión técnica es una decisión de negocio. La elección entre monolito y servicios, entre SQL y NoSQL, entre auto-hosteado y cloud — cada una tiene implicaciones para velocidad, costo y capacidad organizacional.

**Sobre product-market fit**: La tesis concluyó que el mercado chileno de 2015 no era lo suficientemente maduro para un modelo QUALIFY puro. La recomendación fue comenzar B2B (calificando productos para empresas) antes de expandirse a marketplace de consumidores. Esta intuición de secuenciación — B2B primero, B2C segundo — sigue siendo un patrón de go-to-market válido.

## El Documento

La tesis completa de 71 páginas (en español) cubre diseño de modelo de negocio, análisis competitivo, arquitectura tecnológica, metodología de desarrollo y proyecciones financieras. Fue supervisada por el Profesor Rodrigo Sandoval Urrich en el Departamento de Ciencias de la Computación de la PUC Chile.

Representa el puente entre mi trabajo anterior en sistemas empresariales y mi enfoque posterior en transformación digital: el momento en que comencé a entender que la estrategia tecnológica y la estrategia de negocio son la misma conversación.
