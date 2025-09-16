# Configuração do Facebook API

Este documento explica como configurar as credenciais do Facebook para o sistema funcionar corretamente.

## 📋 Pré-requisitos

1. Conta Facebook Developer
2. App Facebook criada
3. Página Facebook Business
4. Conta Instagram Business (opcional)

## 🔧 Configuração

### 1. Editar Arquivo de Ambiente

Edite o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  facebook: {
    appId: 'SEU_APP_ID_AQUI',
    appSecret: 'SEU_APP_SECRET_AQUI',
    accessToken: 'SEU_ACCESS_TOKEN_AQUI',
    businessManagerId: 'SEU_BUSINESS_MANAGER_ID',
    pageId: 'SEU_PAGE_ID',
    instagramAccountId: 'SEU_INSTAGRAM_ACCOUNT_ID'
  }
};
```

### 2. Para Produção

Edite `src/environments/environment.prod.ts` com as mesmas informações.

## 🔑 Como Obter as Credenciais

### App ID e App Secret

1. Acesse: https://developers.facebook.com/apps/
2. Selecione sua app
3. Vá em **Configurações** → **Básico**
4. Copie **ID da App** e **Chave Secreta da App**

### Access Token

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione sua app
3. Clique em **Gerar Token de Acesso**
4. Selecione as permissões necessárias:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `ads_read`
   - `leads_retrieval`
   - `pages_read_engagement`
   - `pages_manage_metadata`
5. Copie o token gerado

### Page ID

1. Acesse sua página Facebook
2. Vá em **Sobre**
3. Role até **ID da Página**
4. Ou use Graph API: `/me/accounts`

### Instagram Account ID

1. Use Graph API Explorer
2. Execute: `/{page-id}?fields=instagram_business_account`
3. Copie o ID retornado

## 🚀 Testando a Configuração

1. Inicie o projeto: `ng serve`
2. Vá para **APIs & Webhooks** → **Configurações**
3. Clique em **Testar API Real**
4. Deve retornar sucesso com seus dados

## ⚠️ Segurança

- **NUNCA** commite tokens no Git
- Use variáveis de ambiente em produção
- Tokens expiram (renovar periodicamente)
- Para produção, implemente renovação automática

## 🔄 Renovação de Token

Tokens de usuário expiram em 1-2 horas. Para tokens de longa duração:

1. Use tokens de página (não expiram)
2. Implemente fluxo OAuth completo
3. Use endpoint `/oauth/access_token` para renovar

## 📞 Suporte

Em caso de problemas:

1. Verifique se a app tem as permissões corretas
2. Confirme se a página está conectada à app
3. Teste o token no Graph API Explorer
4. Verifique os logs do console do navegador