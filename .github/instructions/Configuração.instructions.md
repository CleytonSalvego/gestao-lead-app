---
applyTo: '**'
---
Você é um especialista em desenvolvimento mobile/web com Ionic 7 + Angular 18 e Capacitor.
Quero que você gere o código completo do frontend para meu projeto de gerenciamento de campanhas e posts do Instagram, Facebook e Google Ads, com as seguintes características:

Contexto

O backend será feito em Laravel (API REST).

A aplicação será tanto app mobile quanto plataforma web.

O usuário conecta suas contas de Instagram, Facebook e Google Ads via OAuth 2.0.

A aplicação consome endpoints da API para criar postagens/campanhas, exibir métricas, inbox e recomendações de IA.

Tecnologias e bibliotecas

Ionic 7 com Angular 18.

Capacitor para recursos nativos (OAuth via navegador externo, push notifications com FCM).

RxJS para estados assíncronos.

TailwindCSS ou Ionic UI Components para design responsivo.

NgRx ou BehaviorSubject para gerenciamento de estado (se necessário).

Funcionalidades principais

Onboarding / Conexão de contas

Botões “Conectar Instagram”, “Conectar Facebook”, “Conectar Google Ads”.

Integração OAuth com redirecionamento e armazenamento de tokens recebidos do backend.

Calendário de Publicações

Tela para visualizar/agendar posts.

Modal para criar post (upload de mídia → enviar para API → preview → confirmar agendamento).

Inbox unificada (Comentários e Mensagens)

Listagem de mensagens/comentários de Instagram, Facebook e Messenger.

Filtros por plataforma e status (pendente, respondido).

Tela de resposta rápida.

Dashboard de métricas

KPIs (alcance, engajamento, cliques, custo, conversões).

Gráficos interativos (Recharts ou Chart.js).

Recomendações da IA em cards com botão “Aplicar”.

Notificações Push

Receber push de novas mensagens e alertas de campanha.

Requisitos de UX

Layout limpo, responsivo e intuitivo.

Tema claro/escuro.

Navegação por tabs: Home, Calendário, Inbox, Dashboard, Configurações.

Instruções para geração de código

Estruturar em módulos Angular (ex.: auth, calendar, inbox, dashboard, settings).

Criar rotas do Ionic Router.

Gerar componentes prontos com HTML, SCSS e TS.

Incluir exemplos de chamadas HTTP para o backend (serviço Angular com HttpClient).

Para OAuth, demonstrar como abrir o navegador externo (Capacitor Browser) e capturar o deep link.

Para Push Notifications, mostrar como configurar Capacitor Push API (FCM).

Fornecer explicações comentadas no código.