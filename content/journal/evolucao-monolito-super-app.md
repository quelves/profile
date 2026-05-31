---
title: "De Monolito a Super App: Feature Flags como Estratégia de Evolução"
date: "2025-03-15"
category: "Enterprise Architecture"
excerpt: "Como evoluímos o app OTT #1 do Chile em uma Super App sem reescrever uma única linha de código legacy — usando Feature Flags, arquitetura Shell + Micro-Apps e uma abordagem evolutiva que trata o código existente como ativo, não como passivo."
tags: ["Super App", "Feature Flags", "Arquitetura Evolutiva", "Micro-Frontends", "Mobile"]
lang: "pt"
---

A decisão mais cara em arquitetura de software não é escolher a tecnologia errada. É decidir reescrever código funcional porque ele não se encaixa mais na sua visão.

Quando a Megamedia decidiu evoluir o MEGA GO de um app puro de streaming OTT para uma Super App integrando Notícias, Social, Shop e Rádios, a equipe de engenharia enfrentou um dilema clássico: bifurcar a base de código e construir em paralelo, ou estender a plataforma existente com evolução controlada?

Escolhemos a evolução. Este artigo explica por quê, e como os Feature Flags se tornaram o mecanismo arquitetônico central que tornou isso possível.

## A Decisão: Bifurcar vs. Feature Flag

A abordagem convencional para a evolução maior de uma plataforma é binária: manter o sistema antigo enquanto constrói o novo, depois migrar. Isso cria vários problemas:

- **Esforço duplicado**: Duas equipes mantendo bases de código paralelas
- **Risco de divergência**: Correções de bugs no sistema antigo não se propagam para o novo
- **Fragmentação de usuários**: Usuários do app antigo perdem novas funcionalidades
- **Inconsistência de dados**: Dois apps escrevendo nos mesmos backends com esquemas diferentes

Analisamos ambas as abordagens usando oito critérios (custo, tempo, risco, experiência do usuário, dívida técnica, capacidade da equipe, capacidade de rollback e consistência de dados). Os Feature Flags venceram em seis de oito dimensões.

## A Arquitetura Shell + Micro-Apps

A arquitetura Super App MEGA (SAM) trata o app MEGA GO existente como um **shell** que hospeda **micro-apps**:

```
┌─────────────────────────────────────────┐
│           Super App MEGA                │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │   OTT   │ │  News   │ │  Social  │  │
│  │ (legacy)│ │  (new)  │ │  (new)   │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│  ┌─────────┐ ┌─────────┐              │
│  │  Shop   │ │  Radio  │              │
│  │  (new)  │ │  (new)  │              │
│  └─────────┘ └─────────┘              │
└─────────────────────────────────────────┘
```

Cada micro-app é um módulo autocontido com:
- Grafo de navegação independente
- Configuração de build independente
- Ciclo de release independente
- Camada de auth compartilhada (Lazy Login)
- Pipeline de analytics compartilhada

O shell fornece:
- Navegação inferior entre micro-apps
- Identidade de usuário e gestão de sessões
- Avaliação de Feature Flags
- Deep linking cross-app
- Componentes de UI comuns

## Lazy Login: O Padrão Anonymous-First

Uma das decisões arquitetônicas mais consequenciais na SAM é o **Lazy Login**. Os usuários podem navegar conteúdo, ler notícias e ouvir rádio sem criar uma conta. Os dados são armazenados localmente e associados a um ID anônimo.

Quando o usuário eventualmente faz login, o sistema migra:
- Histórico de visualização
- Favoritos
- Preferências de rádio
- Carrinho de compras
- Seguimentos sociais

Este padrão aumenta a conversão dramaticamente. No contexto OTT, os usuários que navegam antes de se inscreverem têm 3x maior retenção do que aqueles forçados a se registrarem imediatamente.

A migração não é trivial. Usamos um sistema de identidade baseado em grafos (Neo4j) que rastreia relações entre IDs anônimos, usuários registrados, dispositivos e perfis. Quando o login ocorre, a travessia do grafo identifica todos os dados órfãos e os re-atribui sob o usuário autenticado.

## Feature Flags como Arquitetura

Os Feature Flags na SAM não são apenas para A/B testing. Eles são o mecanismo principal para controlar quais micro-apps são visíveis para quais usuários em quais plataformas:

```yaml
mega_shop:
  enabled: true
  platforms:
    android: { minVersion: "2.0.0", rollout: 100 }
    ios: { minVersion: "2.0.0", rollout: 50 }
    web: { minVersion: "1.5.0", rollout: 100 }
  userSegments: ["premium", "free_trial"]
  
mega_news:
  enabled: true
  platforms:
    android: { minVersion: "1.8.0", rollout: 100 }
    ios: { minVersion: "1.8.0", rollout: 100 }
  dependencies: ["mega_id_v2"]
```

Esta abordagem declarativa permite que product managers controlem o rollout sem intervenção de engenharia. Quando uma nova micro-app está pronta, o flag é habilitado. Se um bug crítico é encontrado, o flag é desabilitado — ocultando instantaneamente a micro-app de todos os usuários sem implantar uma nova versão do app.

## Module Federation para Compartilhar Código

Para as camadas web e React Native PoC, usamos Module Federation 2.0 (via Re.Pack) para compartilhar código entre o módulo OTT legacy e as novas micro-apps:

- Componentes compartilhados do design system
- Utilidades de auth compartilhadas
- Hooks de analytics compartilhados
- Clientes API compartilhados

Isso reduz o tamanho do bundle e assegura consistência. Quando a equipe de design atualiza a cor do botão primário, a mudança se propaga para todas as micro-apps sem atualizações individuais.

## A Mentalidade de Evolução

A filosofia central da SAM está capturada em ADR-001: **"Estender, não Substituir."**

Cada decisão arquitetônica é avaliada contra este princípio:
- Podemos adicionar a nova funcionalidade sem modificar código existente?
- Podemos rotear ao redor de componentes legacy usando adaptadores?
- Podemos deprecar gradualmente em vez de deletar imediatamente?

Esta mentalidade trata o código existente como um ativo. O módulo MEGA GO OTT — 2,690 linhas de lógica de reprodutor, testado em batalha através de 150K usuários concurrentes — não é dívida técnica. É uma vantagem competitiva que as novas micro-apps herdam de graça.

## Métricas de Evolução

Após 10 meses de desenvolvimento evolutivo:

- Zero downtime durante os rollouts de micro-apps
- 100% das funcionalidades legacy OTT permanecem funcionais
- Novas micro-apps (News, Social) alcançaram produção em 4 meses cada
- A retenção de usuários aumentou 23% devido ao engajamento multi-vertical
- Uma equipe de 7 engenheiros (consolidada de 12) mantém toda a plataforma

## A Lição

Reescrever código às vezes é necessário. Mas deveria ser a última opção, não a primeira. Os Feature Flags, a arquitetura Shell + Micro-Apps e os padrões Lazy Login permitem que as plataformas evoluam organicamente — adicionando novas capacidades enquanto se preserva a confiabilidade do que já funciona.

A Super App não é um destino. É um processo contínuo de evolução controlada.
