# Guia de Uso - Alerta de Live

## Visão Geral

O Bender Bot agora possui um servidor webhook integrado que permite receber alertas de live de sistemas externos (como n8n) e enviá-los automaticamente para grupos do WhatsApp.

## Funcionalidades

- **Servidor Express**: Roda na porta 3000 (configurável)
- **Endpoint de Webhook**: `POST /enviar-alerta-live`
- **Health Check**: `GET /health`
- **Ativação por Grupo**: Cada grupo pode ativar/desativar alertas individualmente

## Configuração

### 1. Configuração no `src/config.js`

```javascript
// Configuração do servidor Express para webhooks
export const WEBHOOK_PORT = 3000;
export const WEBHOOK_ENABLED = true;
```

- `WEBHOOK_PORT`: Porta onde o servidor vai rodar (padrão: 3000)
- `WEBHOOK_ENABLED`: Ativa/desativa o servidor webhook (padrão: true)

### 2. Como Usar no Grupo

#### Ativar Alertas de Live

Um administrador do grupo deve usar o comando:

```
/live-alert on
```

Isso adiciona o grupo à lista de grupos que receberão alertas de live.

#### Desativar Alertas de Live

```
/live-alert off
```

Isso remove o grupo da lista de grupos que recebem alertas.

## API do Webhook

### Endpoint: `/enviar-alerta-live`

**Método**: `POST`

**Content-Type**: `application/json`

**Body da Requisição**:

```json
{
  "title": "Título da Live",
  "description": "Descrição opcional da live",
  "username": "Nome do criador"
}
```

**Campos Obrigatórios**:
- `title`: Título da live
- `username`: Nome do criador da live

**Campos Opcionais**:
- `description`: Descrição adicional (não usado na mensagem atual)

**Resposta de Sucesso**:

```json
{
  "success": true,
  "message": "Mensagem enviada para 2 grupos",
  "successCount": 2,
  "errorCount": 0
}
```

**Resposta de Erro**:

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

### Endpoint: `/health`

**Método**: `GET`

**Resposta**:

```json
{
  "status": "ok",
  "service": "Bender Bot Webhook"
}
```

## Exemplo de Integração com n8n

### Workflow no n8n

1. **Trigger**: Use um trigger que detecte início de live (ex: webhook do Twitch, YouTube, etc.)

2. **Node HTTP Request**:
   - **Método**: POST
   - **URL**: `http://localhost:3000/enviar-alerta-live` (ou URL do seu servidor)
   - **Authentication**: None
   - **Content Type**: JSON
   - **Body**:

   ```json
   {
     "title": "={{ $json.title }}",
     "username": "={{ $json.username }}"
   }
   ```

3. **Conecte o trigger ao node HTTP Request**

### Exemplo com Twitch

No n8n, você pode usar o trigger do Twitch para detectar quando um streamer inicia uma live:

1. **Twitch Trigger**: Configure para monitorar um usuário específico
2. **HTTP Request**: Configure conforme acima
3. **Mapeamento**:
   - `title`: `{{ $json.title }}` (título do stream)
   - `username`: `{{ $json.user_name }}` (nome do streamer)

## Mensagem Enviada

Quando o webhook é acionado, o bot envia a seguinte mensagem para todos os grupos ativos:

```
🚨 *Alerta de Live!*

O criador *{username}* acabou de iniciar a transmissão!
📝 {title}
```

## Persistência

Os grupos com alertas ativos são salvos em:
- `database/live-alert-groups.json`

Este arquivo contém um array com os IDs dos grupos que receberão alertas.

## Troubleshooting

### Porta já em uso

Se você receber o erro "Porta 3000 já está em uso", altere a `WEBHOOK_PORT` no `src/config.js` para outra porta.

### Nenhum grupo configurado

Se o webhook for chamado mas nenhum grupo tiver alertas ativados, a resposta será:
```json
{
  "success": true,
  "message": "Nenhum grupo configurado para receber alertas"
}
```

### Verificar grupos ativos

Atualmente não existe um comando para listar grupos ativos, mas você pode verificar manualmente no arquivo `database/live-alert-groups.json`.

## Segurança

### Acesso Local

Por padrão, o servidor roda em `localhost:3000`. Para expor publicamente:

1. **Nginx Reverse Proxy** (recomendado):
   ```nginx
   location /webhook/ {
       proxy_pass http://localhost:3000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

2. **Cloudflare Tunnel** (alternativa):
   Use `cloudflared` para criar um túnel seguro

3. **Firewall**:
   Configure o firewall para permitir apenas IPs específicos (ex: IP do servidor n8n)

### Recomendações

- Nunca exponha o endpoint publicamente sem autenticação
- Use reverse proxy com HTTPS
- Limite o acesso a IPs conhecidos
- Considere adicionar autenticação básica ou token no futuro

## Logs

O servidor webhook usa o sistema de logs do bot:
- `infoLog`: Mensagens informativas (ex: servidor iniciado)
- `errorLog`: Erros (ex: falha ao enviar mensagem)
- `successLog`: Sucessos (ex: servidor iniciado com sucesso)

## Exemplo Completo de Integração

### Fluxo Completo

1. **Streamer inicia live no Twitch**
2. **Twitch Trigger do n8n detecta**
3. **Workflow do n8n processa os dados**
4. **HTTP Request envia para webhook do Bender Bot**
5. **Bender Bot recebe a requisição**
6. **Bender Bot busca grupos ativos**
7. **Bender Bot envia mensagem para cada grupo**
8. **Resposta enviada ao n8n**

### Payload Exemplo

Do Twitch para n8n:
```json
{
  "title": "Live de Desenvolvimento",
  "user_name": "devgui",
  "game_name": "Just Chatting"
}
```

Do n8n para Bender Bot:
```json
{
  "title": "Live de Desenvolvimento",
  "username": "devgui"
}
```

Mensagem no WhatsApp:
```
🚨 *Alerta de Live!*

O criador *devgui* acabou de iniciar a transmissão!
📝 Live de Desenvolvimento
```

## Futuras Melhorias

Possíveis melhorias futuras:

- [ ] Adicionar autenticação no webhook (token ou API key)
- [ ] Comando para listar grupos com alertas ativos
- [ ] Personalização da mensagem por grupo
- [ ] Suporte a múltiplos webhooks
- [ ] Filtros por criador/título
- [ ] Rate limiting
- [ ] Dashboard de estatísticas
