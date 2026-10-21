# Guia de Uso - Docker

## Visão Geral

Este projeto inclui suporte completo para Docker, permitindo rodar o Bender Bot em containers de forma isolada e reproduzível.

## Arquivos

- **Dockerfile**: Configuração do container
- **docker-compose.yml**: Orquestração com volumes e rede
- **.dockerignore**: Arquivos a serem ignorados no build

## Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 2.0 ou superior)

## Como Usar

### 1. Build da Imagem

```bash
docker build -t bender-bot .
```

### 2. Rodar com Docker Compose (Recomendado)

```bash
# Iniciar o container
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### 3. Rodar com Docker puro

```bash
# Iniciar o container
docker run -d \
  --name bender-bot \
  -p 3555:3555 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/assets/auth:/app/assets/auth \
  -v $(pwd)/assets/images:/app/assets/images \
  -e TZ=America/Sao_Paulo \
  bender-bot

# Ver logs
docker logs -f bender-bot

# Parar o container
docker stop bender-bot

# Remover o container
docker rm bender-bot
```

## Volumes

O docker-compose.yml configura os seguintes volumes para persistência:

### 1. Database (`./database:/app/database`)
- Armazena configurações do bot
- Arquivos JSON de grupos, prefixos, auto-responder, etc.
- **Importante**: Mantenha este volume para não perder configurações

### 2. Auth (`./assets/auth:/app/assets/auth`)
- Armazena a autenticação do WhatsApp (creds.json)
- **Importante**: Sempre mantenha este volume para não precisar re-autenticar

### 3. Images (`./assets/images:/app/assets/images`)
- Imagens personalizadas do menu e outros assets
- Opcional, mas útil se você customizar o menu

### 4. Logs (`./logs:/app/assets/temp`)
- Logs do bot (opcional)
- Útil para debugging

## Portas

- **3555**: Porta do webhook para alertas de live
- Exposta como `3555:3555` no docker-compose

## Variáveis de Ambiente

Você pode adicionar variáveis de ambiente no docker-compose.yml:

```yaml
environment:
  - NODE_ENV=production
  - TZ=America/Sao_Paulo
  - WEBHOOK_PORT=3555
  - WEBHOOK_ENABLED=true
```

## Primeira Execução

### 1. Clone o repositório
```bash
git clone https://github.com/guiireal/bender-bot.git
cd bender-bot
```

### 2. Configure o arquivo src/config.js
Edite o arquivo `src/config.js` antes de buildar:

```javascript
export const BOT_LID = "SEU_NUMERO@lid";
export const OWNER_LID = "SEU_NUMERO@lid";
export const SPIDER_API_TOKEN = "SEU_TOKEN";
// ... outras configurações
```

### 3. Crie diretórios necessários
```bash
mkdir -p database assets/auth assets/images
```

### 4. Build e inicie
```bash
docker-compose up -d
```

### 5. Acompanhe os logs
```bash
docker-compose logs -f
```

### 6. Autentique o WhatsApp
Siga as instruções nos logs para escanear o QR code.

## Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose logs -f bender-bot
```

### Entrar no container
```bash
docker-compose exec bender-bot sh
```

### Reiniciar o container
```bash
docker-compose restart bender-bot
```

### Atualizar o container
```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

### Ver status dos containers
```bash
docker-compose ps
```

### Limpar tudo (cuidado!)
```bash
docker-compose down -v
```

## Backup

### Backup do database e auth
```bash
tar -czf bender-backup-$(date +%Y%m%d).tar.gz database assets/auth
```

### Restaurar backup
```bash
tar -xzf bender-backup-YYYYMMDD.tar.gz
```

## Troubleshooting

### Porta já em uso
Se a porta 3555 já estiver em uso, altere no docker-compose.yml:
```yaml
ports:
  - "3556:3555"  # Usa porta 3556 no host
```

### Permissões de arquivos
Se tiver problemas de permissão, execute:
```bash
sudo chown -R $USER:$USER database assets
```

### Container não inicia
Verifique os logs:
```bash
docker-compose logs bender-bot
```

### Autenticação perdida
Se perder a autenticação, pare o container, remova o volume auth e reinicie:
```bash
docker-compose down
rm -rf assets/auth/*
docker-compose up -d
```

## Atualização do Bot

### 1. Parar o container
```bash
docker-compose down
```

### 2. Atualizar o código
```bash
git pull
```

### 3. Rebuild e iniciar
```bash
docker-compose build
docker-compose up -d
```

## Performance

### Usar cache de build
```bash
docker-compose build --no-cache
```

### Limpar imagens não utilizadas
```bash
docker image prune -a
```

### Limpar volumes não utilizados
```bash
docker volume prune
```

## Segurança

### Usar usuário não-root
O Dockerfile já configura um usuário não-root (`bender`) para segurança.

### Restringir acesso ao webhook
Configure um firewall ou use reverse proxy (Nginx) na frente do container.

### Não expor portas desnecessárias
Apenas a porta 3555 está exposta, que é necessária para o webhook.

## Integração com Nginx (Opcional)

Exemplo de configuração Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location /webhook/ {
        proxy_pass http://localhost:3555/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deploy em VPS

### 1. Instale Docker e Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. Clone o repositório
```bash
git clone https://github.com/guiireal/bender-bot.git
cd bender-bot
```

### 3. Configure
Edite `src/config.js` com suas credenciais

### 4. Inicie
```bash
docker-compose up -d
```

### 5. Configure auto-restart (systemd)
Crie `/etc/systemd/system/bender-bot.service`:

```ini
[Unit]
Description=Bender Bot Docker
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/bender-bot
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Habilite o serviço:
```bash
systemctl enable bender-bot.service
systemctl start bender-bot.service
```

## Monitoramento

### Status do container
```bash
docker stats bender-bot
```

### Uso de disco
```bash
docker system df
```

### Logs rotativos
Para evitar logs infinitos, configure no docker-compose.yml:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Ambiente de Desenvolvimento

Para desenvolvimento sem volumes persistidos:

```bash
docker run --rm -it \
  -p 3555:3555 \
  -v $(pwd):/app \
  bender-bot npm start
```

## Notas Importantes

1. **Sempre mantenha os volumes** para não perder autenticação e configurações
2. **Faça backup regular** do diretório `database` e `assets/auth`
3. **Configure o timezone** corretamente para que os logs tenham o horário certo
4. **Use docker-compose** em produção para melhor gerenciamento
5. **Monitore os logs** regularmente para detectar problemas
