---
title: "Arquitetura OTT Multi-Plataforma em Escala: Lições de 1,9M de Downloads"
date: "2025-02-10"
category: "Enterprise Architecture"
excerpt: "Como projetamos a arquitetura do MEGA GO para servir 1,9M+ downloads em 7 plataformas cliente — desde mobile Android até Smart TV, Roku e Web — mantendo uma única fonte de verdade para conteúdo, autenticação e monetização."
tags: ["OTT", "Android", "Microsserviços", "DRM", "Arquitetura"]
lang: "pt"
---

Quando você constrói uma plataforma OTT que precisa executar em telefones móveis, Android TV, Samsung Tizen, LG webOS, Roku, iOS e navegadores web — todas compartilhando o mesmo catálogo de conteúdo, identidades de usuário e lógica de monetização — as decisões arquitetônicas do mês um determinam se você sobrevive ao mês doze.

Este artigo destila os padrões arquitetônicos que usamos na Megamedia para construir o MEGA GO, o app #1 de Entretenimento no Chile, que agora serve 1,91M+ downloads e gerencia 150K usuários concurrentes durante eventos ao vivo como o Festival de Viña del Mar.

## A Base Multi-Módulo do Android

O ecossistema Android do MEGA GO está estruturado como um projeto Gradle multi-módulo com separação clara de responsabilidades:

- **módulo mobile**: App para telefone e tablet usando Material Design e Navigation Component
- **módulo tv**: App para Android TV usando Leanback UI, otimizada para navegação com D-Pad
- **módulo ottlib**: Biblioteca compartilhada (AAR) contendo lógica de domínio, repositórios, clientes API e wrappers de reprodutor
- **módulo navigation**: Biblioteca de componente de navegação reutilizável

Esta separação permite ciclos de release independentes. Quando uma correção crítica de DRM precisa sair, podemos atualizar o ottlib sem tocar as camadas de UI mobile ou TV. Quando a Samsung introduz um novo requisito de OS para TV, o módulo TV se adapta sem desestabilizar o mobile.

## MVVM + Repository + Observer: O Padrão Mobile

Na camada de UI, seguimos MVVM com LiveData:

```
UI (Activity/Fragment)
    ↓
ViewModel (LiveData)
    ↓
Repository
    ↓
┌───────┴───────┐
│               │
[Remote API]    [Local DB]
(Retrofit)      (Room)
```

O padrão Repository é crítico para a experiência de usuário offline-first. Um usuário navegando conteúdo no metrô espera resultados imediatos do cache de Room, com sincronização em segundo plano da API OTT quando a conectividade retorna. Este padrão também simplifica o testing: repositórios podem ser mockados, ViewModels podem ser unit-tested sem instrumentação Android.

## A Malha de APIs: Sete Backends, Uma Experiência

MEGA GO consome sete APIs distintas, cada uma otimizada para seu domínio:

| API | Domínio | Desafio de Escala |
|-----|---------|-------------------|
| OTT API | Catálogo de conteúdo, streaming | 10K+ RPS no pico |
| PAY API | Assinaturas, pagamentos | Consistência financeira |
| MDS API | Entrega de mídias, DRM | Sensível à latência |
| MFB API | Integração Firebase | Sincronização em tempo real |
| SSO (Keycloak) | Autenticação | 1,500 RPS validados |
| NOTIFY API | Notificações push | Rajada durante eventos ao vivo |
| Analytics | Youbora, Firebase | Telemetria de alto volume |

Cada API tem ambientes de staging e desenvolvimento independentes. O app mobile troca endpoints via build variants (release, staging, debug), permitindo que QA teste contra backends pré-produtivos enquanto desenvolvedores trabalham contra mocks locais.

## DRM: A Arquitetura Invisível

A Gestão de Direitos Digitais é onde a arquitetura OTT se torna genuinamente complexa. MEGA GO suporta três sistemas DRM:

- **Widevine** (Android/Web): DRM da Google, com níveis de segurança L1 (respaldado por hardware) e L3 (software)
- **FairPlay** (iOS/tvOS): DRM da Apple para o ecossistema Apple
- **PlayReady** (Smart TV/Roku): DRM da Microsoft para plataformas de TV

O fluxo de licença DRM é em si um sistema distribuído: solicitação de conteúdo → verificação de direitos → servidor de licenças → verificação de dispositivo → entrega de chave de decifração. Cada passo adiciona latência. Durante o Festival de Viña 2026, com 150K usuários concurrentes solicitando streams HD, o sistema DRM teve que sustentar a entrega de licenças sem se tornar um gargalo.

Pré-buscamos licenças para o próximo episódio durante a reprodução atual, reduzindo a latência percebida a quase zero.

## Arquitetura de Publicidade: DAI, CSAI e a Stack de Receitas

A monetização no MEGA GO opera em três modos:

1. **Assinatura** (SVOD): Planos mensais com acesso ao catálogo completo
2. **Pago por evento** (TVOD): Compras únicas para eventos premium
3. **Publicidade** (AVOD): Nível gratuito com anúncios

A arquitetura de publicidade suporta ambos:
- **CSAI** (Client-Side Ad Insertion): O stitching de anúncios ocorre no reprodutor cliente (ExoPlayer com IMA SDK)
- **DAI** (Dynamic Ad Insertion): O stitching de anúncios ocorre do lado do servidor, entregando um único manifesto com anúncios já inseridos

DAI é crítico para plataformas de TV onde a inserção de anúncios do lado do cliente é pouco confiável. A decisão arquitetônica de suportar ambos os modos (documentada em ADR-001) significa que podemos escolher a estratégia ótima por plataforma em vez de forçar uma abordagem em todos os lugares.

## O Que Faria Diferente Hoje

Olhando a arquitetura com três anos de retrospectiva:

1. **Injeção de Dependências**: Não usamos Hilt/Dagger desde o início. Hoje injetaria repositórios e clientes API para melhorar a testabilidade e reduzir o uso de singletons.

2. **Jetpack Compose**: Toda a UI é baseada em XML. Uma migração para Compose reduziria o código de UI em ~40% e habilitaria bibliotecas de componentes compartilhados entre mobile e TV.

3. **Limites de Módulo**: O módulo ottlib cresceu para conter muitas responsabilidades. Eu o dividiria em módulos de feature (auth-lib, player-lib, analytics-lib) para melhorar o paralelismo de build e a autonomia da equipe.

4. **GraphQL**: Sete APIs REST significam sete formatos de resposta diferentes. GraphQL com um gateway federado reduziria a complexidade de mapeamento de dados do lado do cliente.

## A Lição Central

A arquitetura OTT multi-plataforma não se trata de escolher o stack tecnológico perfeito. Trata-se de desenhar limites que permitam que cada plataforma evolua independentemente enquanto compartilham a lógica de domínio que define seu produto.

O módulo ottlib — essa AAR compartilhada que contém repositórios, clientes API e wrappers de reprodutor — é a decisão arquitetônica mais importante que tomamos. Transformou sete plataformas cliente em um único produto.
