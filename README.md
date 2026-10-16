# Namu: agendamento de sessões

Aplicação para agendar sessões com especialistas de bem-estar (psicologia, nutrição, educação física e yoga). O enunciado original está em [docs/desafio.md](docs/desafio.md).

> Em construção: este README é completado a cada etapa (execução com Docker, decisões técnicas, limites da solução).

## Estrutura

```
apps/
  api/                 NestJS 11: API REST com as regras de agendamento
  web/                 Next.js 16 (App Router): tela de agendamento
packages/
  eslint-config/       presets de ESLint (nest, next) compartilhados
  tsconfig/            bases de TypeScript compartilhadas
seed.sql               schema e dados iniciais fornecidos (não editado)
```

Monorepo com **pnpm workspaces** e **Turborepo** (orquestra `build`, `lint`, `typecheck` e `test` com cache).

## Pré-requisitos

- Node.js 24 (`nvm use` lê o `.nvmrc`)
- pnpm 12 (`corepack enable` usa a versão fixada em `package.json`)
- Docker com Compose

## Desenvolvimento

```bash
pnpm install
pnpm dev            # api em http://localhost:3000 e web em http://localhost:3001
```

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `pnpm lint`         | ESLint em todos os pacotes                  |
| `pnpm typecheck`    | checagem de tipos em todos os pacotes       |
| `pnpm test`         | testes unitários (Jest) de todos os pacotes |
| `pnpm build`        | build de produção da api e do web           |
| `pnpm format:check` | verifica a formatação (Prettier)            |
