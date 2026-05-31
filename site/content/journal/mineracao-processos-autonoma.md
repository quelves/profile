---
title: "Da Observação de Processos à Correção Autônoma: Um Arco de 25 Anos"
date: "2025-11-20"
category: "Enterprise Architecture"
excerpt: "Meu paper IEEE de 2016 sobre process mining em publicidade foi um primeiro passo para entender como extrair inteligência acionável desde logs de execução. Hoje, essa pesquisa evolui para sistemas que não apenas analisam processos, mas os corrigem autonomamente."
tags: ["Process Mining", "Sistemas Autônomos", "Análise de Processos", "MEGA GO", "Pesquisa"]
lang: "pt"
---

Em 2016 publiquei um paper na IEEE sobre process mining aplicado a publicidade digital. O trabalho demonstrava como extrair padrões de comportamento desde logs de execução de campanhas publicitárias para otimizar a alocação de orçamento entre canais. Naquele momento, pensei que o próximo passo seria construir dashboards mais sofisticados.

Enganei-me. O próximo passo não é melhor visualização. O próximo passo é **ação autônoma**.

Este artigo descreve o arco intelectual que conecta esse paper de 2016 com minha pesquisa doutoral atual: uma viagem desde o análise descritivo de processos até sistemas que observam, predizem e corrigem processos organizacionais sem intervenção humana.

## Fase 1: Observação (1998–2016)

Meu primeiro contacto com a extração de conhecimento desde dados de execução foi em 1998, construindo o registro nacional de saúde do Brasil. O sistema gerava logs de cada transação: quem acedia a que registro, quando, desde que hospital, com que resultado. Naquele então, esses logs serviam principalmente para auditoria e cumprimento legal.

Em 2004, trabalhando com motores de busca na GuiaMais, comecei a analisar logs de consultas para entender padrões de comportamento de usuário. Que termos de busca levavam a conversões? Que padrões de navegação indicavam intenção de compra? Isso era analytics descritivo primitivo, mas já apontava para algo maior: **os logs de execução contêm inteligência que os sistemas tradicionais desperdiçam**.

O paper de 2016 formalizou essa intuição. Usando técnicas de process mining sobre logs de execução de uma plataforma de publicidade digital, demonstramos que era possível:
- Reconstruir o fluxo real de processos de negócio (não o fluxo documentado)
- Identificar gargalos onde as campanhas perdiam eficiência
- Detectar desvios entre o processo desenhado e o processo executado
- Quantificar o impacto financeiro de cada desvio

O paper concluía com uma recomendação que hoje reconheço como limitada: usar esses insights para que os gerentes tomem melhores decisões. A limitação não estava na análise. Estava na suposição de que a resposta correta a um insight era **informar a um humano**.

## Fase 2: Análise Preditivo (2016–2020)

Depois do paper, o trabalho natural era estender o análise desde descritivo para preditivo. Em vez de perguntar *"o que aconteceu?"*, começamos a perguntar *"o que vai acontecer?"*.

No gurú (Yell LATAM), aplicamos modelos preditivos sobre logs de processos de venda:
- Que leads têm maior probabilidade de converter baseando-se na sua trajetória através do processo?
- Em que etapa do funnel se perdem os clientes mais valiosos?
- Que padrões de comportamento da equipe de vendas correlacionam com maiores receitas?

Os resultados foram úteis mas frustrantes. Os modelos preditivos geravam insights acionáveis, mas a ação requeria que alguém lesse o relatório, entendesse a recomendação, decidisse agir, e executasse a mudança. O lag entre predição e ação era de dias ou semanas. Para quando alguém agia, as condições tinham mudado.

A lição foi clara: **predizer sem capacidade de ação autônoma é como diagnosticar uma doença sem poder prescrever tratamento**.

## Fase 3: Prescrição Automatizada (2020–2024)

Na Megamedia, a plataforma MEGA GO gera milhões de eventos diários: usuários que se autenticam, conteúdo que se reproduz, pagos que se processam, anúncios que se servem. Cada evento é um ponto de dados que descreve o estado do sistema num momento dado.

Construímos pipelines de analytics que não apenas predizem: **prescrevem**. Por exemplo:

**Prescrição de conteúdo**: Quando o modelo detecta que um segmento de usuários está abandonando a plataforma (churn prediction), o sistema não apenas alerta: automaticamente gera uma campanha de retenção com conteúdo personalizado, descontos específicos, e notificações push dirigidas.

**Prescrição de infraestrutura**: Quando os logs de streaming mostram degradação de qualidade de vídeo numa região específica, o sistema não apenas reporta: automaticamente redireciona tráfego para um CDN alternativo e escala capacidade nessa região.

**Prescrição de monetização**: Quando a análise de logs de assinatura detecta que um usuário está prestes a cancelar, o sistema gera automaticamente uma oferta de retenção personalizada baseada no seu histórico de visualização.

Essas prescrições automatizadas demonstraram que a ação autônoma era possível, mas tinham uma limitação: **cada prescrição estava hard-coded para um domínio específico**. O sistema sabia como reter usuários de OTT, mas não sabia como aplicar a mesma lógica a processos de venda ou suporte técnico.

## Fase 4: Correção Autônoma (2024–Próximo)

A pesquisa doutoral atual busca generalizar a prescrição automatizada para **correção autônoma de processos**. A diferença é sutil mas profunda:

- **Prescrição automatizada**: Um sistema humano desenha uma regra (*"se churn > 80%, enviar desconto"*), e o sistema a executa automaticamente.
- **Correção autônoma**: O sistema detecta um problema, formula uma hipótese sobre sua causa, desenha um remédio, executa o remédio, e verifica se o problema se resolveu — tudo sem que um humano tenha definido a regra de antemão.

A arquitetura de correção autônoma que estamos desenhando consiste em quatro componentes:

### 1. Observabilidade de Processo

Não apenas métricas técnicas (CPU, memória, latência), mas **métricas de processo**: Quanto tempo leva um usuário completar uma assinatura? Quantos passos requer? Onde abandonam? Como varia isto por segmento, por hora, por dispositivo?

No MEGA GO, isto implementa-se mediante:
- **Distributed tracing** (OpenTelemetry) que segue cada transação de negócio através de microserviços
- **Event sourcing** onde o estado do sistema se reconstrói desde um log imutável de eventos
- **Real-user monitoring** (Youbora) que mede a experiência de qualidade de vídeo como proxy de satisfação

### 2. Deteção de Anomalias de Processo

Um modelo de machine learning treinado sobre logs históricos aprende o que constitui comportamento "normal" do processo. Quando o comportamento atual se desvia significativamente, o sistema detecta uma anomalia.

As anomalias podem ser:
- **Sistémicas**: Todo o processo se torna mais lento (por exemplo, latência de autenticação aumenta 3x)
- **Segmentadas**: Um subconjunto de usuários experimenta degradação (por exemplo, usuários de Android TV em regiões rurais)
- **Estruturais**: O fluxo do processo muda (por exemplo, 40% de usuários saltam um passo que antes completavam)

### 3. Diagnóstico Causal

A deteção de anomalias responde *"algo está errado"*. O diagnóstico causal responde *"porquê?"*.

Usamos técnicas de causal inference sobre logs de execução para distinguir correlação de causalidade. Por exemplo: se a taxa de abandono de assinatura aumenta depois de um deployment, foi o deployment a causa? Ou foi uma mudança em pricing que ocorreu no mesmo dia? Ou uma degradação de CDN que afetou a experiência de streaming?

O diagnóstico causal em produção é difícil porque os sistemas empresariais têm múltiplas variáveis mudando simultaneamente. Nossa abordagem combina:
- **Análise de contrafactuais**: O que teria acontecido se não tivéssemos feito o deployment?
- **Isolamento de variáveis**: Testes A/B em produção onde um subconjunto de usuários recebe a mudança e outro não
- **Modelação gráfica causal**: Representar conhecimento de domínio como um grafo causal que guia a inferência

### 4. Execução de Remédio e Verificação

Uma vez diagnosticada a causa, o sistema executa um remédio e verifica sua efetividade:
- **Remédio**: Se o diagnóstico indica que um microserviço tem um memory leak, o sistema reinicia a instância e aumenta o pool de conexões
- **Verificação**: Monitoriza métricas de processo durante 15 minutos pós-remédio para confirmar que a anomalia se resolveu
- **Rollback**: Se o remédio piora a situação, o sistema reverte automaticamente e escala o incidente a um humano

## O Caso de Estudo: Festival de Viña 2026

Durante o Festival de Viña 2026, a plataforma MEGA GO processou 150.000 usuários concurrentes. Os logs gerados permitiram observar um caso interessante de correção semi-autônoma:

**Anomalia detectada**: 40 minutos depois do início do evento, a taxa de autenticação bem-sucedida caiu de 98% para 87%. A deteção foi automática (threshold-based alerting).

**Diagnóstico**: A análise de logs mostrou que os falhos estavam concentrados em usuários com tokens OAuth2 emitidos mais de 12 horas antes. A causa: uma configuração de TTL de cache de Redis que não tinha sido atualizada depois de uma mudança recente em Keycloak.

**Remédio**: A equipe de operações executou manualmente um flush de cache de sessão e ajustou o TTL. O tempo total entre deteção e resolução foi 8 minutos.

**A lição**: Em 2026, o diagnóstico requereu um humano. Em 2027, o objetivo é que o sistema detecte, diagnostique e execute o remédio sem intervenção humana — porque o Checkpoint Protocol do MEGA IA Skills já tem o conhecimento de domínio necessário para entender a relação entre tokens OAuth2, Redis TTL, e taxas de autenticação.

## A Conexão com a Pesquisa Doutoral

A linha de pesquisa em Process Intelligence & Mining é uma das três colunas da minha tese. Sua contribuição específica é demonstrar que:

1. **Os logs de execução são uma fonte de conhecimento subutilizada**: A maioria das organizações armazena logs para cumprimento e debugging, mas não os usa para otimização de processos.

2. **O análise deve evoluir desde descritivo para autônomo**: Cada fase do arco (observação → predição → prescrição → correção) representa uma ordem de magnitude de valor agregado.

3. **A correção autônoma requer conhecimento de domínio**: Um sistema genérico não pode diagnosticar por que falha a autenticação de um OTT. Precisa entender a arquitetura, as dependências, e o contexto de negócio.

## A Lição

A mineração de processos não é uma disciplina de visualização. É uma disciplina de ação. O valor não está em saber o que aconteceu. Está em que o sistema faça algo a respeito antes de que um humano se dê conta de que há um problema.

As organizações que investem em observabilidade de processo hoje — não apenas métricas técnicas, mas métricas de negócio derivadas de logs de execução — estão construindo a fundação para sistemas autônomos amanhã. As que não, seguirão vendo dashboards enquanto seus processos se degradam em silêncio.
