---
title: "Arquitetura Empresarial Auto-Adaptativa: Quando os Sistemas Se Curam a Si Mesmos"
date: "2025-11-30"
category: "Enterprise Architecture"
excerpt: "Os sistemas empresariais do futuro não esperarão que um humano detecte uma falha. Observarão continuamente, diagnosticarão causas raiz e executarão remédios autônomos. A arquitetura do MEGA GO — com auto-scaling preditivo, degradação graciosa e circuit breakers — é um primeiro passo para esse futuro."
tags: ["Arquitetura Auto-Adaptativa", "Observabilidade", "Auto-Scaling", "Circuit Breaker", "MEGA GO"]
lang: "pt"
---

A maioria das arquiteturas empresariais é projetada para resistir falhas. Poucas são projetadas para **se curarem a si mesmas**.

Na Megamedia, a plataforma MEGA GO opera 24/7 servindo 1,91 milhão de usuários. Durante eventos ao vivo como o Festival de Viña, a carga aumenta 40x em questão de minutos. Neste contexto, esperar que um humano detecte uma anomalia, a diagnostique e execute um remédio é uma estratégia de falha garantida.

Este artigo descreve como evoluímos a arquitetura do MEGA GO desde uma postura reativa (*"quando algo falha, responde"*) para uma postura auto-adaptativa (*"antecipa, detecta, diagnostica, remedia, verifica"*). E como esta evolução informa a terceira linha da minha pesquisa doutoral: arquiteturas empresariais que detectam anomalias, diagnosticam causas raiz e executam remédios sem intervenção humana.

## O Ciclo OODA Aplicado à Arquitetura

O ciclo OODA (Observe → Orient → Decide → Act) foi desenvolvido pelo coronel John Boyd para combate aéreo militar. Sua aplicação à arquitetura empresarial não é metafórica: os sistemas que ganham são os que completam o ciclo mais rápido que seus oponentes. No nosso caso, o "oponente" é a complexidade e o caos inerentes a sistemas distribuídos em escala.

### Observe: Observabilidade como Arquitetura

No MEGA GO, a observabilidade não é infraestrutura adicionada depois. É uma dimensão arquitetônica projetada desde o dia um.

**Distributed Tracing (OpenTelemetry)**: Cada transação de negócio — desde que um usuário abre o app até que reproduz conteúdo — é rastreada através dos sete microserviços que a compõem. Se um usuário reporta buffering, podemos reconstruir o path exato: dispositivo → CDN → MDS API → servidor DRM → reprodução. O tempo de identificação de causa raiz caiu de dias para minutos.

**Logging Estruturado (JSON)**: Cada serviço emite logs com correlation IDs que permitem rastrear uma transação através de limites de serviço. Não mais grep através de múltiplos servidores buscando timestamps que coincidam.

**Métricas (Prometheus)**: Latência, throughput e taxas de erro são coletadas em tempo real. Os alertas não se baseiam em thresholds estáticos mas em desvios estatísticos do comportamento histórico.

**Real-User Monitoring (Youbora)**: Mede a experiência de qualidade de vídeo desde a perspectiva do usuário final: bitrate, rebuffering ratio, tempo de início. Isto é crítico porque uma métrica de servidor pode indicar "tudo está bem" enquanto os usuários experimentam buffering.

A chave arquitetônica é que **cada limite de serviço emite telemetria que pode ser correlacionada através do sistema distribuído**. Sem esta correlação, a observabilidade é apenas uma coleção de métricas isoladas.

### Orient: Deteção de Anomalias Contextual

Observar métricas não é suficiente. O sistema deve saber quais métricas importam e quando um desvio é uma anomalia que requer ação.

Implementamos três níveis de deteção:

**Nível 1 — Thresholds Estáticos**: Regras simples como "latência de API > 500ms durante 2 minutos" ou "taxa de erro > 1%". Estas regras capturam problemas óbvios mas geram falsos positivos durante eventos atípicos (como um Festival de Viña).

**Nível 2 — Deteção Estatística**: Modelos que aprendem o comportamento histórico normal de cada métrica e detectam desvios significativos. Isto reduz falsos positivos porque entende que "normal" durante um evento ao vivo é diferente de "normal" numa terça-feira às 3 da manhã.

**Nível 3 — Deteção Causal**: O nível mais avançado, ainda em pesquisa, onde o sistema não apenas detecta que algo está errado mas formula hipóteses sobre a causa baseando-se no grafo de dependências arquitetônicas. Se a latência de autenticação aumenta, o sistema sabe que as causas possíveis são: sobrecarga de Keycloak, degradação de Redis, ou problema de rede — e pode descartar as impossíveis baseando-se em métricas correlacionadas.

### Decide: Degradação Graciosa como Decisão Arquitetônica

Quando a carga excede a capacidade, o sistema deve decidir quais funcionalidades preservar e quais degradar. No MEGA GO, estas decisões estão codificadas na arquitetura, não tomadas por humanos em tempo real.

Definimos quatro níveis de degradação automatizada:

**Nível 0 — Normal**: Tudo operacional. 100% qualidade de vídeo, chat em tempo real, social sharing.

**Nível 1 — Chat desabilitado**: A 100K usuários concurrentes, o Firebase Realtime Database throttlea. O sistema desabilita chat automaticamente com um banner explicativo.

**Nível 2 — Redução de qualidade**: Quando os nós edge do CDN se aproximam da capacidade, os clientes são instruídos automaticamente a mudar de HD para SD. Isto reduz largura de banda por usuário em 60% e aumenta capacidade efetiva do CDN em 2.5x.

**Nível 3 — Fallback regional**: Se um nó CDN regional falha, o tráfego é roteado automaticamente para o nó saudável mais próximo. Os usuários experimentam uma pausa de 2-3 segundos, depois reprodução normal.

**Nível 4 — Modo emergência**: Se a origem de streaming falha, o sistema serve os últimos 30 segundos de conteúdo bufferizado em loop enquanto engenheiros restauram a origem. Nunca foi necessário em produção.

A decisão chave é que **cada nível de degradação está automatizado e reversível**. O sistema não espera um humano para decidir degradar. Decide baseando-se em métricas em tempo real, e reverte automaticamente quando as condições melhoram.

### Act: Remédio Autônomo e Verificação

A fase final do ciclo OODA é a ação. Numa arquitetura auto-adaptativa, a ação inclui:

**Auto-scaling preditivo**: Em vez de reagir a métricas ("CPU > 70%, adicionar instâncias"), o sistema provisiona capacidade baseando-se em projeções. Durante o Festival de Viña, instâncias são adicionadas automaticamente em T-60, T-30 e T-5 minutos baseando-se em padrões históricos de rampa de tráfego.

**Circuit breakers**: Quando um serviço downstream falha repetidamente, o circuit breaker abre automaticamente, devolvendo respostas degradadas mas funcionais em vez de propagar falhas em cascata. No MEGA GO, se o serviço de recomendações falha, o sistema mostra conteúdo popular em vez de recomendações personalizadas — uma degradação que os usuários notam menos que um erro 500.

**Retry adaptativo**: Nem todas as falhas são iguais. O sistema ajusta automaticamente a estratégia de retentativas baseando-se no tipo de erro: retentativas agressivas para timeouts transitorios, retentativas conservadoras para erros de autenticação, e fallback imediato para erros de validação.

**Verificação pós-remédio**: Depois de qualquer ação autônoma, o sistema monitora métricas durante uma janela de tempo para verificar que o remédio funcionou. Se a situação piora, executa rollback automático.

## A Ponte entre Pesquisa e Operações 24/7

A terceira linha da minha pesquisa doutoral — Arquitetura Empresarial Auto-Adaptativa — não é teoria abstrata. É a formalização de práticas que já operam parcialmente no MEGA GO.

A contribuição de pesquisa específica é:

1. **Um framework para codificar conhecimento de domínio arquitetônico**: Os circuit breakers, políticas de degradação, e regras de auto-scaling do MEGA GO estão codificados manualmente hoje. A pesquisa busca generalizar isto num modelo declarativo onde o sistema aprende e adapta suas próprias políticas baseando-se em resultados históricos.

2. **Validação de que a auto-adaptação reduz custo operacional**: Métricas preliminares mostram que incidentes que requerem intervenção humana no MEGA GO se reduziram 60% após implementar degradação graciosa e circuit breakers automatizados.

3. **Um modelo de governança para ação autônoma**: Nem toda ação autônoma é segura. O sistema deve saber quando agir sozinho e quando escalar a humanos. A pesquisa define "guardrails de arquitetura" — limites dentro dos quais o sistema pode agir autonomamente sem risco de causar dano.

## O Incidente que Não Ocorreu

Durante o Festival de Viña 2025, um bug no serviço de entitlements causou que ~5% de usuários válidos fossem rejeitados. Em 2024, isto teria gerado um incidente P1, chamadas a engenheiros às 2 da manhã, e um hotfix manual.

Em 2025, o circuit breaker detectou a taxa de erro elevada no serviço de entitlements, abriu automaticamente o circuito, e o sistema fallback para verificação de direitos baseada em cache de Redis com TTL curto. Os usuários afetados experimentaram um delay de 2-3 segundos na verificação, mas puderam ver o conteúdo. A equipe de engenharia recebeu um alerta de severidade média, investigou durante horário laboral, e desplegou um fix sem urgência.

O incidente não ocorreu porque a arquitetura se curou a si mesma antes de que um humano soubesse que havia um problema.

## A Lição

A arquitetura empresarial auto-adaptativa não é um luxo para empresas com orçamentos ilimitados. É uma necessidade para qualquer sistema que opere em escala onde a velocidade de resposta humana é insuficiente.

Os princípios que guiam nossa arquitetura:
1. **Observabilidade correlacionada**: Não métricas isoladas, mas telemetria que pode ser rastreada através de limites de serviço
2. **Decisão automatizada**: Não esperar por humanos para decidir degradar ou escalar
3. **Remédio verificado**: Qualquer ação autônoma deve incluir verificação de efetividade
4. **Governança de guardrails**: O sistema age autonomamente dentro de limites definidos; fora desses limites, escala a humanos

O futuro da arquitetura empresarial não é construir sistemas mais robustos. É construir sistemas que se tornam mais robustos por si mesmos à medida que aprendem de cada anomalia, cada remédio, e cada verificação.
