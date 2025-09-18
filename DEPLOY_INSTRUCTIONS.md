# 📋 Instruções de Deploy - Gestão Lead App

## 🚀 Arquivos para Publicação

Os arquivos compilados para produção estão localizados na pasta `www/`. Este é o conteúdo que deve ser enviado para o shared hosting.

### 📁 Estrutura dos Arquivos de Build:
```
www/
├── index.html              (Arquivo principal - 12KB)
├── main.*.js               (Código principal da aplicação - 656KB)
├── styles.*.css            (Estilos compilados - 58KB)
├── polyfills.*.js          (Polyfills para compatibilidade)
├── runtime.*.js            (Runtime do Angular)
├── assets/                 (Imagens, ícones, etc.)
├── svg/                    (Ícones SVG)
├── .htaccess              (Configuração para Apache - CRIADO AUTOMATICAMENTE)
└── [outros arquivos JavaScript lazy-loaded]
```

**Tamanho Total: ~9MB**

## 🌐 Instruções de Deploy para Shared Hosting

### 1. **Preparação dos Arquivos**
   - ✅ Build realizado com sucesso
   - ✅ Arquivo `.htaccess` criado automaticamente
   - ✅ Todos os arquivos estão na pasta `www/`

### 2. **Upload para Shared Hosting**
   1. Acesse o painel de controle do seu hosting (cPanel, Plesk, etc.)
   2. Vá para o File Manager ou use FTP
   3. Navegue até a pasta `public_html` (ou pasta raiz do domínio)
   4. **Envie TODOS os arquivos da pasta `www/`** para a pasta raiz
   5. Certifique-se de que o arquivo `.htaccess` foi enviado

### 3. **Estrutura Final no Servidor**
```
public_html/
├── index.html
├── main.*.js
├── styles.*.css
├── .htaccess               ← IMPORTANTE!
├── assets/
├── svg/
└── [todos os outros arquivos]
```

### 4. **Configurações Importantes**

#### ✅ **Arquivo .htaccess (Já Criado)**
O arquivo `.htaccess` já foi criado automaticamente e inclui:
- Redirecionamento para SPA (Single Page Application)
- Cache de arquivos estáticos
- Compressão GZIP
- Headers de segurança

#### ⚙️ **Configurações de PHP (se necessário)**
Para shared hosting com PHP, certifique-se de que:
- PHP 7.4+ está ativado
- Mod_rewrite está habilitado
- Mod_deflate está habilitado (para compressão)

### 5. **Verificação Pós-Deploy**

Após o upload, teste:
1. **Página Principal**: `https://seudominio.com`
2. **Navegação**: Clique em diferentes menus
3. **Atualização de Página**: F5 em qualquer rota deve funcionar
4. **Performance**: Verifique se os arquivos estão sendo comprimidos

### 6. **Credenciais de Teste**

A aplicação possui credenciais de demonstração:

**Usuário Admin:**
- Email: `admin@portoseguro.com.br`
- Senha: `123456`

**Usuário Consultant:**
- Email: `joao.silva@portoseguro.com.br`
- Senha: `123456`

**Usuário Analista Meta:**
- Email: `analista-meta@teste.com`
- Senha: `Met@Teste123`

### 7. **Recursos da Aplicação**

#### 🏢 **Sistema Completo de CRM**
- Dashboard com métricas em tempo real
- Kanban board para gestão de leads
- Gestão de consultores e performance
- Sistema de redes sociais com integração Facebook
- Relatórios e analytics

#### 🔐 **Funcionalidades de Segurança**
- Sistema de autenticação por roles
- Mascaramento de dados sensíveis para usuário analista
- Logs de auditoria
- Proteção contra XSS e CSRF

#### 📱 **Responsividade**
- Interface mobile-first
- Suporte a PWA (Progressive Web App)
- Compatível com iOS e Android

### 8. **Suporte Técnico**

#### 🐛 **Problemas Comuns:**

**Erro 404 ao navegar:**
- Verificar se o `.htaccess` foi enviado
- Verificar se mod_rewrite está ativado

**Arquivos não carregam:**
- Verificar permissões dos arquivos (644 para arquivos, 755 para pastas)
- Verificar se todos os arquivos foram enviados

**Aplicação muito lenta:**
- Verificar se GZIP está ativado
- Verificar cache dos arquivos estáticos

### 9. **URLs de Teste**

Após o deploy, você pode testar diretamente:
- `/login` - Tela de login
- `/dashboard` - Dashboard principal
- `/kanban` - Kanban board
- `/social-media` - Gestão de redes sociais
- `/integrations` - Configurações de integração

---

## 📊 **Resumo do Build**

- ✅ **Build Status**: Sucesso
- 📦 **Tamanho Total**: 9MB
- 🗂️ **Arquivos**: 100+ arquivos otimizados
- 🔧 **Otimizações**: Tree-shaking, minificação, lazy loading
- 🛡️ **Segurança**: Headers de segurança configurados
- ⚡ **Performance**: Cache e compressão habilitados

**Aplicação pronta para produção! 🚀**