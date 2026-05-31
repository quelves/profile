---
title: "Sistemas Distribuídos em Produção: O Que 60M de Registros de Saúde Me Ensinaram sobre Escala OTT"
date: "2025-04-20"
category: "Enterprise Architecture"
excerpt: "Os mesmos princípios de sistemas distribuídos que apliquei construindo o registro nacional de saúde do Brasil para 60 milhões de usuários em 1998 são os que uso hoje para plataformas OTT servindo 150K espectadores concurrentes. Alguns padrões são atemporais."
tags: ["Sistemas Distribuídos", "CORBA", "Microsserviços", "Escalabilidade", "Arquitetura"]
lang: "pt"
---

Em 1998 eu construí um sistema distribuído usando CORBA, COM/DCOM e Delphi para registrar 60 milhões de usuários no Sistema Único de Saúde (SUS) do Brasil. Em 2024 eu projetei uma arquitetura híbrida on-premise/cloud para uma plataforma OTT servindo 150K usuários concurrentes durante eventos ao vivo.

As tecnologias não poderiam ser mais diferentes. Os princípios são idênticos.

Este artigo conecta duas décadas de prática em sistemas distribuídos — desde componentes CORBA até microsserviços Kubernetes — através dos padrões que transcendem qualquer stack tecnológico específico.

## Padrão 1: Os Limites de Serviço Definem Tudo

Em 1998, o registro SUS usava CORBA para desacoplar:
- **Serviço de Identidade**: Matching de pessoas através de 60M registros
- **Serviço de Compensação**: Processamento de reembolsos médicos
- **Serviço de Agendamento**: Reserva de consultas

Cada serviço tinha seu próprio modelo de dados, sua própria unidade de deploy, e se comunicava via ORB (Object Request Broker). Os limites eram físicos — processos separados em servidores separados.

Em 2024, o MEGA GO usa a mesma lógica de limites:
- **OTT API**: Catálogo de conteúdo e streaming
- **PAY API**: Processamento de assinaturas e pagamentos
- **SSO API**: Autenticação e identidade
- **MDS API**: Entrega de mídias e DRM

O protocolo de comunicação mudou de CORBA IIOP para HTTP/REST e gRPC. A filosofia de limites não.

**Lição**: Os limites de serviço devem ser desenhados ao redor de capacidades de negócio, não de camadas técnicas. O Serviço de Identidade em 1998 e o Serviço SSO em 2024 fazem a mesma coisa: responder a pergunta "quem é este usuário?"

## Padrão 2: A Transparência de Localização Cria Flexibilidade

A promessa central do CORBA era transparência de localização: um cliente chama um método em um objeto sem saber se esse objeto está no mesmo processo, outro processo na mesma máquina, ou um servidor através da rede.

Em 1998, isso nos permitiu começar com deploy monolítico (todos os serviços em um servidor) e distribuir gradualmente à medida que a carga aumentava — sem mudar o código cliente.

Em 2024, o Kubernetes entrega a mesma promessa através de Service Discovery e DNS. Um microsserviço chama `http://ott-api:8080` sem saber se o alvo é um pod no mesmo nó, outro nó no mesmo cluster, ou um pod em uma região diferente.

**Lição**: Projete para transparência de localização desde o dia um. A capacidade de mover serviços sem mudar os chamadores é a fundação da arquitetura escalável.

## Padrão 3: As Falácias da Computação Distribuída Ainda Doem

As Oito Falácias da Computação Distribuída de Peter Deutsch foram publicadas em 1994. Elas ainda são a fonte principal de outages em produção em 2024:

| Falácia | Lição 1998 | Lição 2024 |
|---------|------------|------------|
| A rede é confiável | Timeouts de CORBA durante horas pico de hospitais | Retentativas HTTP durante eventos ao vivo |
| A latência é zero | Overhead de marshaling ORB | Latência de service mesh Kubernetes |
| A largura de banda é infinita | Conexões de hospital de 64Kbps | Requisitos de streaming 4K HDR |
| A rede é segura | Sem TLS em CORBA | Service mesh zero-trust |
| A topologia não muda | Realocações de servidor quebravam referências | Reprogramação de pods muda IPs |
| Há um administrador | TI federal + estadual + hospital | Equipes de Plataforma + DevOps + SRE |
| O custo de transporte é zero | Licenças de ORB | Custos de egress cloud |
| A rede é homogênea | HP-UX + Windows + Solaris | Nós x86 + ARM + GPU |

Cada sistema distribuído que construí — 1998 ou 2024 — eventualmente violou pelo menos três dessas falácias em produção.

**Lição**: As falácias não são teóricas. São o checklist que você deve revisar antes de cada decisão arquitetônica.

## Padrão 4: A Gestão de Estado É o Problema Difícil

Em 1998, o registro SUS usava o serviço de objetos persistentes do Orbix para manter estado através de reinícios de servidor. Em 2024, o MEGA GO usa:

- **PostgreSQL**: Estado transacional (assinaturas, pagamentos, perfis de usuário)
- **MongoDB**: Catálogo de conteúdo (esquema flexível para tipos de mídias diversos)
- **Redis**: Estado de sessão e rate limiting (acesso sub-milissegundo)
- **Neo4j**: Grafo de identidade (relações entre usuários, dispositivos, perfis)
- **Firestore**: Configuração em tempo real e feature flags

A tecnologia mudou. O problema não: **como você mantém consistência através de estado distribuído?**

Em 1998 usávamos two-phase commit através de serviços CORBA. Em 2024 usamos o padrão Saga através de microsserviços. Ambas as abordagens têm trade-offs:

- **2PC**: Consistência forte, mas bloqueante e frágil sob partição
- **Saga**: Consistência eventual, mas resiliente e não bloqueante

Para o fluxo de pagamento do MEGA GO, usamos Saga: PAY API processa a cobrança, emite um evento PaymentCompleted, OTT API estende a assinatura, SSO API atualiza os direitos. Se algum passo falha, transações compensatórias fazem rollback dos passos anteriores.

**Lição**: Não há uma resposta universal para estado distribuído. Escolha modelos de consistência baseados em requisitos de negócio, não em preferências tecnológicas.

## Padrão 5: A Observabilidade Não É Opcional

Em 1998, depurar um sistema CORBA distribuído significava ler logs de ORB através de múltiplos servidores e correlacionar timestamps manualmente. Uma única reclamação de usuário podia levar dias de rastreamento.

Em 2024, o MEGA GO usa:
- **Distributed tracing** (OpenTelemetry) através das sete APIs
- **Logging estruturado** (JSON) com correlation IDs
- **Métricas** (Prometheus) para latência, throughput e taxas de erro
- **Real-user monitoring** (Youbora) para experiência de qualidade de vídeo

Quando um usuário reporta buffering durante o Festival de Viña, podemos rastrear o path exato da solicitação: dispositivo → CDN → MDS API → servidor de licenças DRM → reprodução. O tempo de identificação de causa raiz caiu de dias para minutos.

**Lição**: Construa observabilidade dentro da arquitetura, não como um afterthought. Cada limite de serviço deve emitir telemetria que possa ser correlacionada através do sistema distribuído.

## Os Princípios Atemporais

Após 25 anos construindo sistemas distribuídos, estes princípios permanecem constantes:

1. **Limites ao redor de capacidades de negócio**, não camadas técnicas
2. **Transparência de localização** como restrição de design
3. **Respeitar as falácias** — elas vão te morder
4. **Escolher modelos de consistência** baseados em necessidades de negócio
5. **A observabilidade é arquitetura**, não infraestrutura

As tecnologias vão mudar novamente. CORBA deu lugar ao SOAP, depois REST, depois gRPC, depois GraphQL. Os princípios não.
