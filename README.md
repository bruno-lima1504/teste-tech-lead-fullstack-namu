# Namu: agendamento de sessões

Aplicação para agendar sessões com especialistas de bem-estar (psicologia, nutrição, educação física e yoga). O enunciado original está em [docs/desafio.md](docs/desafio.md).

> Em construção: este README é completado a cada etapa (execução com Docker, decisões técnicas, limites da solução).

## Estrutura

```
apps/
  api/                 NestJS 11: API REST com as regras de agendamento
    src/
      main.ts          bootstrap: só sobe a aplicação
      app.module.ts    escolhe os módulos e as configurações carregadas
      modules/
        schedule/      módulo de agendamento, uma pasta por agregado
        shared/        infraestrutura comum aos módulos (config, ...)
  web/                 Next.js 16 (App Router): tela de agendamento
packages/
  eslint-config/       presets de ESLint (nest, next) compartilhados
  tsconfig/            bases de TypeScript compartilhadas
infra/                 docker-compose.yml (MySQL) e seed.sql fornecidos (o seed não é editado)
```

Monorepo com **pnpm workspaces** e **Turborepo** (orquestra `build`, `lint`, `typecheck` e testes com cache).

A API é um monólito modular: o app só sobe a aplicação, e as regras ficam nos módulos. Cada módulo é organizado por agregado: os arquivos de um conceito de negócio ficam juntos e se distinguem pelo sufixo (`.entity.ts`, `.repository.ts`, `.service.ts`, `.controller.ts`, `.dto.ts`). Os testes unitários ficam em `<agregado>/__test__/` e os e2e em `<módulo>/__test__/e2e/`. De fora de um módulo ou de uma área de `shared/`, só se importa o `index.ts` (regra do ESLint). A infraestrutura comum é importada pelo alias `@shared/<área>`.

## Pré-requisitos

- Node.js 24 (`nvm use` lê o `.nvmrc`)
- pnpm 12 (`corepack enable` usa a versão fixada em `package.json`)
- Docker com Compose

## Desenvolvimento

```bash
pnpm install
cp .env.example .env   # a api lê o .env da raiz e valida as variáveis ao subir
pnpm dev               # api em http://localhost:3000 e web em http://localhost:3001
```

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `pnpm lint`         | ESLint em todos os pacotes                  |
| `pnpm typecheck`    | checagem de tipos em todos os pacotes       |
| `pnpm test:unit`    | testes unitários (Jest) de todos os pacotes |
| `pnpm build`        | build de produção da api e do web           |
| `pnpm format:check` | verifica a formatação (Prettier)            |
