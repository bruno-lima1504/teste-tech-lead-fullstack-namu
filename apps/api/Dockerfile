FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.11.8 prune @namu/api --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
RUN pnpm --filter @namu/api build \
 && pnpm --filter @namu/api deploy --prod /prod/api

# Runtime: só o dist e as dependências de produção, sem pnpm e sem root.
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /prod/api ./
USER node
EXPOSE 3000
# Aplica as migrations pendentes e sobe a API (exec: o node recebe os sinais de parada).
CMD ["sh", "-c", "node node_modules/typeorm/cli.js migration:run -d dist/modules/schedule/shared/persistence/typeorm-datasource.js && exec node dist/main.js"]
