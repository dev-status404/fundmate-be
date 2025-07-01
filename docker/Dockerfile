# 빌드 단계
FROM node:22-alpine AS builder

WORKDIR /app
COPY . .
RUN npm ci

# 서비스 이름을 인자로 받아 빌드
ARG SERVICE
RUN npx nx build $SERVICE

# 실행 단계
FROM node:22-alpine

WORKDIR /app
ARG SERVICE
RUN apk add --no-cache curl
ARG HOST
ENV HOST=$HOST
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

COPY --from=builder /app/apps/${SERVICE}/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/main.js"]