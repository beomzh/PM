# --------------------------------------------------------
# 1단계: 빌더 (Builder)
# --------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm ci


# --------------------------------------------------------
# 2단계: 러너 (Runner)
# --------------------------------------------------------
FROM node:18-alpine AS runner


WORKDIR /app

USER node

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "server.js"]
