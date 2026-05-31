---
title: "O Arco: 25 Anos de Transformação Tecnológica"
date: "2025-09-15"
category: "Leadership"
excerpt: "Uma reflexão pessoal sobre vinte e cinco anos de liderança tecnológica — desde sistemas distribuídos para 60 milhões de usuários de saúde até frameworks de IA autônoma. O arco não é um CV. É um fio condutor que conecta cada fase em uma narrativa coerente."
tags: ["Carreira", "Liderança", "Transformação", "Sistemas Autônomos", "Arquitetura"]
lang: "pt"
---

Quando entrevisto executivos de tecnologia, peço que me contem a história de suas carreiras como um arco único. A maioria não consegue. Descrevem uma sequência de empregos — empresa A, depois empresa B, depois empresa C — sem conectar o fio intelectual que vincula uma fase à seguinte.

Este é o artigo que gostaria que alguém tivesse me pedido para escrever há vinte anos. Não é um CV. É uma tentativa de demonstrar que uma carreira em tecnologia pode ter a mesma coerência narrativa de uma tese de doutorado: cada capítulo se constrói sobre o anterior, cada experimento informa a próxima hipótese, e a conclusão só é possível graças à jornada que a precedeu.

## Fase I: Sistemas Distribuídos (1998–2001)

Comecei a construir software em 1998 na Universidade Federal de São Paulo (UNIFESP), trabalhando no sistema de registro nacional de saúde do Brasil. O desafio era enganosamente simples: registrar 60 milhões de cidadãos em um banco de dados unificado para que pudessem agendar consultas médicas, processar reembolsos e acessar serviços de saúde pública.

O stack tecnológico — Delphi, CORBA, COM/DCOM, Orbix — é hoje obsoleto. Mas o problema arquitetônico foi atemporal: **como você constrói um sistema que lide com milhões de registros através de servidores distribuídos mantendo consistência, disponibilidade e tolerância a falhas?**

Construímos o sistema usando design baseado em componentes. Cada serviço (matching de identidade, processamento de compensações, agendamento) era um objeto CORBA separado que podia ser implantado de forma independente. O serviço de identidade usava a especificação OMG para matching de pessoas através de milhões de registros — um problema que hoje chamaríamos de "resolução de entidades" e resolveríamos com bancos de dados de grafos.

Duas publicações surgiram deste trabalho: uma sobre mapeamento objeto-relacional usando Delphi, e outra sobre construção de componentes distribuídos com DCOM, CORBA e ActiveX. Na época, pensei que fossem apenas exercícios acadêmicos. Em retrospectiva, foram a fundação de tudo o que se seguiu.

**O que aprendi**: Os limites de serviço importam mais que a tecnologia. A decisão de separar o matching de identidade do agendamento — tomada em 1999 — é a mesma decisão que tomo hoje ao projetar microserviços. O protocolo mudou de CORBA IIOP para HTTP/REST. A lógica dos limites não.

## Fase II: Plataformas Digitais LATAM (2002–2017)

Depois da UNIFESP, mudei-me para a GuiaMais — então parte da Telefónica Publicidad e Información — para construir plataformas de diretório e busca. O problema era diferente mas relacionado: **como você ajuda os usuários a encontrar o negócio certo entre milhões de listagens quando não conseguem soletrar o nome corretamente?**

Esta foi minha primeira exposição a motores de busca. Construímos sistemas de indexação fonética usando Solr e Lucene, implementamos buscadores estatísticos para visibilidade de anúncios, e migramos sistemas legacy CORBA para arquiteturas web J2EE. O site que construí representava aproximadamente 20% dos receitas da TPI do Brasil.

A lição técnica mais importante deste período foi sobre **recuperação de informação** — a mesma disciplina que impulsiona os sistemas RAG (Retrieval-Augmented Generation) e busca semântica de hoje. Em 2004, estávamos construindo algoritmos de matching fonético para lidar com nomes de negócios mal escritos. Em 2024, esse mesmo espaço de problema impulsiona embeddings vetoriais e busca por similaridade para sistemas de IA.

Em 2007, juntei-me ao gurú (Yell LATAM) para liderar a consolidação de plataformas através do Chile, Argentina e Peru. O desafio: **reduzir três plataformas por país para uma arquitetura unificada sem quebrar as experiências de usuário nem os processos de negócio existentes.**

Consolidamos usando stacks open-source (Linux, Java, MySQL, Solr) e metodologias ágeis (SCRUM, XP). Os produtos que liderei geraram aproximadamente 30% dos receitas da empresa. Mas o verdadeiro aprendizado foi organizacional: **a consolidação de plataformas não é um problema técnico. É um problema de processos de negócio que requer soluções técnicas.**

A migração de três plataformas para uma exigiu mapear cada processo de negócio através de três países, identificar inconsistências, negociar padronização com equipes locais, e construir adaptadores que permitissem transição gradual em vez de substituição big-bang. Esta experiência — gerenciar mudança através de limites organizacionais — resultou mais valiosa que qualquer habilidade técnica que adquiri.

**O que aprendi**: A busca e recuperação de informação são fundamentais para a IA. Os clusters de Solr que administrei em 2012 me ensinaram sobre índices invertidos, pontuação TF-IDF e otimização de queries — conceitos diretamente aplicáveis aos bancos de dados vetoriais e modelos de embeddings de hoje. E a gestão da mudança organizacional é tão crítica quanto o design de arquitetura.

## Fase III: Transformação Digital (2018–Presente)

Em 2018, juntei-me à Megamedia para liderar a transformação tecnológica. A empresa era um broadcaster de mídia tradicional tentando tornar-se uma plataforma digital. O desafio: **construir um serviço de streaming OTT que pudesse competir com Netflix, Disney+ e Amazon Prime aproveitando as vantagens do conteúdo local.**

MEGA GO tornou-se o app #1 de Entretenimento no Chile. A arquitetura técnica — híbrida on-premise/cloud, microserviços com DDD, multi-DRM, multi-CDN — está bem documentada em outros artigos. O que importa para esta narrativa é como as fases anteriores informaram a arquitetura:

- A experiência em **sistemas distribuídos** (Fase I) me ensinou que os limites de serviço devem ser desenhados ao redor de capacidades de negócio, não de camadas técnicas. A API OTT, API PAY, API SSO e API MDS cada uma possui um domínio de negócio.
- A experiência em **plataformas de busca** (Fase II) me ensinou que a recuperação de informação é crítica para a descoberta de conteúdo. O motor de recomendação de MEGA GO usa os mesmos princípios — índices invertidos, pontuação por similaridade, sinais de comportamento de usuário — que aprendi construindo busca de diretório em 2004.
- A experiência em **consolidação de plataformas** (Fase II) me ensinou que a mudança organizacional requer evolução gradual, não revolução. Adotamos Feature Flags e arquitetura evolutiva para a transformação Super App MEGA em vez de reescrever a base de código.

O projeto mais consequential desta fase não é o MEGA GO em si. É o **framework MEGA IA Skills** — um sistema de IA multi-agente com 15+ roles especializados, memória persistente e gates de qualidade sequenciais. Este framework demonstra um ganho de produtividade de 2.5x–4x versus desenvolvimento tradicional e está sendo validado como parte de minha pesquisa doutoral.

**O que aprendi**: A transformação digital fracassa quando a tecnologia é tratada como um projeto em vez de como uma capacidade. As organizações que têm sucesso constroem tecnologia como um músculo — não como uma iniciativa de uma única vez. E a IA não é uma ferramenta que você adota. É uma capacidade organizacional que você cultiva.

## Fase IV: Sistemas Autônomos (Próximo)

Sou Candidato a Doutorado em Ciências da Computação na Pontifícia Universidade Católica do Chile. Minha tese — título provisório: *"Sistemas Empresariais Autônomos: Auto-Integração e Auto-Correção Usando Agentes Inteligentes"* — explora uma pergunta que conecta todas as fases anteriores:

**E se os sistemas empresariais pudessem detectar suas próprias falhas, diagnosticar causas raiz e implementar reparos sem intervenção humana?**

Isso não é ficção científica. O framework MEGA IA Skills é a primeira validação em produção. Os agentes já realizam revisão de código, auditorias de segurança, geração de tests e análise arquitetônica. O próximo passo é a correção autônoma de processos: sistemas que observam sua própria execução, identificam anomalias e adaptam comportamento em tempo real.

A linhagem intelectual é clara:
- **1998**: Sistemas distribuídos que se comunicam via limites de serviço
- **2004**: Sistemas de busca que recuperam informação de índices massivos
- **2016**: Sistemas de process mining que extraem conhecimento de logs de execução
- **2024**: Sistemas de IA agentica que agem autonomamente dentro de guardrails de governança
- **Próximo**: Sistemas auto-adaptativos que integram tudo o anterior

## A Coerência do Arco

Quando olho para trás, o arco não é uma sequência de empregos desconectados. É uma exploração contínua de uma pergunta: **como você constrói sistemas que operem confiavelmente em escala com intervenção humana mínima?**

Cada fase abordou uma dimensão diferente:
- **Fase I** (Sistemas Distribuídos): Como os componentes se comunicam através de limites?
- **Fase II** (Plataformas Digitais): Como os usuários encontram o que precisam entre milhões de opções?
- **Fase III** (Transformação Digital): Como as organizações evoluem sua tecnologia sem interrupções?
- **Fase IV** (Sistemas Autônomos): Como os sistemas se gerenciam por si mesmos?

As tecnologias mudaram — CORBA para REST, Solr para bancos de dados vetoriais, implantação manual para agentes de IA — mas a pergunta subjacente permaneceu constante. Esta coerência não é acidental. É o resultado de escolher deliberadamente cada próximo passo para construir sobre o anterior.

## A Combinação Rara

O que torna este arco valioso no mercado atual não é nenhuma fase individual. É a combinação:

- **Pesquisa de nível doutoral** em sistemas autônomos
- **Arquitetura empresarial** em escala (1.9M usuários, 150K concorrentes)
- **Governança de IA em produção** (15+ agentes, 2.5x–4x produtividade)
- **Métricas de impacto de negócio** (receitas, redução de custos, posição de mercado)
- **25 anos de prática contínua** através do Brasil e Chile

A maioria dos executivos de tecnologia tem ou pesquisa profunda ou experiência profunda em produção. Muito poucos têm ambas — e menos ainda podem articular como a pesquisa informa o trabalho de produção e vice-versa. Minha pesquisa doutoral não é abstrata. É validada diariamente em ambientes empresariais de produção. O framework MEGA IA Skills existe porque preciso dele para gerenciar a complexidade das plataformas que lidero.

## O Posicionamento

Depois de vinte e cinco anos, não me posiciono como CTO, Arquiteto Cloud ou IT Manager. Esses são títulos de trabalho. Me posiciono como **Technology Transformation Executive** — alguém que conecta pesquisa científica, estratégia de negócio e execução tecnológica para ajudar as organizações a navegar a era da empresa autônoma.

O arco demonstra que este posicionamento é conquistado, não reivindicado. Cada fase da jornada aporta evidência de que a próxima fase é uma evolução natural em vez de uma virada forçada.

## Para a Próxima Geração

Se você está no início de sua carreira em tecnologia, a lição não é copiar meu caminho. É **construir seu próprio arco deliberadamente**. Pergunte-se:

1. Qual é a pergunta subjacente que conecta seu trabalho atual com suas ambições futuras?
2. Cada novo papel se constrói sobre o anterior, ou reinicia do zero?
3. Você pode articular o fio intelectual que torna coerente sua trajetória?

Uma carreira sem arco é uma sequência de empregos. Uma carreira com arco é uma narrativa que se capitaliza. A diferença não é o talento. É a intencionalidade.

---

*Este artigo foi escrito como uma reflexão pessoal, não como uma oferta de serviços profissionais. Se você está navegando uma transformação tecnológica e quer discutir a interseção de pesquisa, estratégia e execução, estou disponível para conversas de consultoria.*
