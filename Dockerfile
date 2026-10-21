# Usa a imagem oficial do Node.js 24
FROM node:24-alpine

# Define argumentos
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Instala dependências do sistema necessárias
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    git \
    curl \
    tzdata

# Define o diretório de trabalho
WORKDIR /app

# Cria diretórios necessários
RUN mkdir -p database assets/auth/baileys assets/images assets/temp

# Copia arquivos de configuração
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production && npm cache clean --force

# Copia todo o código do projeto
COPY . .

# Ajusta permissões (importante para Termux/Unix-like)
RUN chmod -R 755 ./*

# Expõe a porta do webhook
EXPOSE 3555

# Cria um usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bender -u 1001 && \
    chown -R bender:nodejs /app

# Muda para o usuário não-root
USER bender

# Comando para iniciar o bot
CMD ["npm", "start"]
