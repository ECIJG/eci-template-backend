FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma


RUN npm ci

COPY . .

RUN npm run postinstall
RUN npm run build


FROM gcr.io/distroless/nodejs20 AS runner

WORKDIR /app

ENV NODE_ENV=production

USER nonroot

COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package*.json ./
COPY --from=builder --chown=nonroot:nonroot /app/static ./static

CMD ["dist/main.js"]