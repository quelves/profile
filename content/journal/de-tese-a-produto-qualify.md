---
title: "De Tese de Mestrado a Pensamento de Produto: Projetando a Plataforma QUALIFY"
date: "2015-12-07"
category: "Digital Platforms & Product Strategy"
excerpt: "Uma tese de 71 páginas que antecipou a economia de plataformas de hoje. Projetando um modelo de negócio e arquitetura tecnológica para uma comunidade de especialistas, usuários e empresas para qualificar, recomendar e comercializar produtos e serviços."
tags: ["Estratégia de Produto", "Business Model Canvas", "Lean Startup", "SOA", "Arquitetura de Plataforma"]
lang: "pt"
---

Em 2015, enquanto completava meu Mestrado em Tecnologias da Informação e Gestão na Pontifícia Universidade Católica do Chile, enfrentei uma pergunta que continua relevante hoje: **como os consumidores tomam boas decisões quando estão sobrecarregados por escolha infinita?**

Esta pergunta se tornou a fundação da minha tese de graduação — um trabalho de 71 páginas que projetou tanto o modelo de negócio quanto a arquitetura tecnológica para a **QUALIFY INC**, uma plataforma para ajudar os consumidores a navegar a complexidade através de validação especializada e recomendações impulsionadas pela comunidade.

## O Paradoxo da Escolha

A tese começou com a observação de Barry Schwartz: mais escolha não leva a melhores decisões. Quando os consumidores enfrentam centenas de produtos similares, eles experimentam paralisia de decisão, estresse e finalmente resultados pobres. Isso era verdade em 2005 quando Schwartz publicou *O Paradoxo da Escolha*. É exponencialmente mais verdade hoje.

O contexto específico era o mercado de e-commerce chileno, que crescia rapidamente mas carecia de mecanismos para que os consumidores validassem qualidade antes da compra. Os usuários tinham acesso a produtos, mas não a sistemas de qualificação confiáveis.

## Design do Modelo de Negócio

A tese aplicou uma abordagem de dupla lente:

**Lente de Inovação de Negócio**: Usando Business Model Canvas, Lean Canvas e metodologia Lean Startup, eu projetei uma plataforma onde três atores interagem:
- **Especialistas** que validam e qualificam produtos
- **Usuários** que acessam recomendações e reviews da comunidade
- **Empresas** que comercializam produtos qualificados

O modelo de receitas combinava assinaturas B2C, comissões de marketplace B2B e serviços premium de especialistas. O Lean Canvas ajudou a priorizar as suposições mais arriscadas: os usuários confiariam em opiniões de especialistas? As empresas pagariam por leads qualificados?

**Lente de Arquitetura Tecnológica**: A arquitetura da plataforma foi projetada como Arquitetura Orientada a Serviços (SOA) com APIs REST, usando:
- Java Spring Framework para serviços backend
- Angular para a plataforma web comunitária
- Infraestrutura AWS cloud para elasticidade
- MongoDB e MySQL para persistência políglota
- SCRUM como metodologia de desenvolvimento

A arquitetura separou responsabilidades em serviços independentes: gestão de usuários, catálogo de produtos, motor de qualificação, sistema de recomendação e transações comerciais.

## Metodologia e Validação

A tese seguiu o Customer Development Process combinado com iterações Ágeis:
1. **Descoberta do problema** — entrevistas com 50+ usuários potenciais e 15 empresas
2. **Hipótese de solução** — protótipo do workflow de qualificação
3. **Design de MVP** — plataforma mínima para testar o core loop
4. **Pivotar ou perseverar** — framework de decisão baseado em dados

ArchiMate foi usado para modelagem de arquitetura empresarial, assegurando alinhamento entre processos de negócio, aplicações e infraestrutura tecnológica.

## Por Que Isso Importa Hoje

Olhando para trás desde 2024, vários elementos desta tese de 2015 provaram ser premonitórios:

- **Confiança mediada por plataforma** — a ideia central de que a validação especializada reduz a fadiga de decisão é a fundação das plataformas de reviews modernas, commerce de influencer e sistemas de recomendação por IA
- **SOA e microsserviços** — a abordagem arquitetônica de serviços desacoplados se comunicando via APIs tornou-se o padrão da indústria
- **Lean Startup na empresa** — a tese aplicou metodologia de startup dentro de um contexto acadêmico, antecipando os laboratórios de inovação corporativa que se seguiram
- **Cloud-native por padrão** — projetar para elasticidade AWS desde o dia um era visionário em 2015

A tese também me ensinou algo sobre a relação entre pesquisa e prática. Um documento acadêmico de 71 páginas não é um produto. Mas a disciplina de documentar suposições, testar hipóteses e arquitetar para escala — essa disciplina se traduz diretamente no trabalho de transformação empresarial que eu faço hoje.

## Aprendizados Chave

**Sobre inovação de modelo de negócio**: Os frameworks Canvas não são templates para preencher. São ferramentas de pensamento para revelar suposições ocultas. O output mais valioso do exercício não foi o canvas em si, mas a lista de hipóteses que precisavam de validação.

**Sobre arquitetura tecnológica**: Projetar a arquitetura antes de construir me ensinou que cada decisão técnica é uma decisão de negócio. A escolha entre monolito e serviços, entre SQL e NoSQL, entre auto-hospedado e cloud — cada uma tem implicações para velocidade, custo e capacidade organizacional.

**Sobre product-market fit**: A tese concluiu que o mercado chileno de 2015 não era maduro o suficiente para um modelo QUALIFY puro. A recomendação foi começar B2B (qualificando produtos para empresas) antes de expandir para marketplace de consumidores. Esta intuição de sequenciamento — B2B primeiro, B2C segundo — continua sendo um padrão de go-to-market válido.

## O Documento

A tese completa de 71 páginas (em espanhol) cobre design de modelo de negócio, análise competitiva, arquitetura tecnológica, metodologia de desenvolvimento e projeções financeiras. Foi supervisionada pelo Professor Rodrigo Sandoval Urrich no Departamento de Ciências da Computação da PUC Chile.

Representa a ponte entre meu trabalho anterior em sistemas empresariais e meu foco posterior em transformação digital: o momento em que comecei a entender que a estratégia tecnológica e a estratégia de negócio são a mesma conversação.
