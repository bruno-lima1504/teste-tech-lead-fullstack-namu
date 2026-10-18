# Namu: agendamento de sessões

Aplicação para agendar sessões com especialistas de bem-estar (psicologia, nutrição, educação física e yoga). O enunciado original está em [docs/desafio.md](docs/desafio.md).

> API (Parte 1) e tela web (Parte 2) concluídas, inclusive o cancelamento (`DELETE /bookings/:id` e o botão na tela), entregue por Pull Request.

## Funcionalidades

### API

| Rota                                           | O que faz                                                                                                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /professionals?specialty=`                | Profissionais ativos, por nome, com filtro opcional por especialidade (`psicologia`, `nutricao`, `educacao-fisica`, `yoga`)                                                       |
| `GET /professionals/:id/slots?date=YYYY-MM-DD` | Horários livres do profissional no dia informado, no calendário de São Paulo: ainda não começaram e não têm agendamento confirmado                                                |
| `POST /bookings` `{ "slotId": 4 }`             | Agenda o horário: só futuros, de profissionais ativos, um confirmado por horário e sem sobreposição com outra sessão confirmada do usuário, inclusive com requisições simultâneas |
| `DELETE /bookings/:id`                         | Cancela a sessão, só pelo dono e até 24 horas antes do início; o horário volta a ficar livre                                                                                      |
| `GET /me/bookings`                             | Sessões do usuário (confirmadas e canceladas), por ordem de início                                                                                                                |

- O usuário é identificado pelo header `X-User-Id`, já que a autenticação está fora do escopo.
- Os horários ficam em UTC no banco. A API devolve todos eles em ISO 8601 com o offset de São Paulo, por exemplo `2026-10-19T14:00:00-03:00`.
- A documentação OpenAPI fica em [`/docs`](http://localhost:3000/docs), com a especificação em `/docs-json`.

### Tela

Em http://localhost:3001, uma página só:

- **Usuário:** um seletor com os quatro usuários do seed. A escolha vai no header `X-User-Id`.
- **Profissional:** filtro por especialidade e escolha do profissional.
- **Data e horário:** a data começa em hoje e não aceita dia passado. Os horários livres aparecem no horário de Brasília.
- **Confirmação:** a mensagem da API aparece com um título por código ("Horário ocupado", "Conflito de horário"…), e a grade de horários recarrega.
- **Minhas sessões:** as sessões do usuário, confirmadas e canceladas. As confirmadas têm o botão "Cancelar", que pede confirmação. A regra das 24 horas fica com a API: fora do prazo, a recusa aparece no item como "Fora do prazo de cancelamento". Cancelada, a sessão muda de status e o horário volta à grade.

### Erros da API

Todo erro sai no mesmo formato, com um `code` estável para o cliente tratar e uma mensagem em português para exibir:

```json
{
  "statusCode": 409,
  "code": "SLOT_UNAVAILABLE",
  "message": "Este horário já foi agendado. Escolha outro horário."
}
```

| Status | `code`                                       | Quando                                                                   |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------ |
| 400    | `VALIDATION_ERROR` (com `details` por campo) | corpo, query ou parâmetro inválido (ex.: `date=2026-02-30`)              |
| 400    | `INVALID_USER_ID`                            | `X-User-Id` malformado (`abc`, `0`, `-1`, `1.5`)                         |
| 401    | `MISSING_USER_ID` / `UNKNOWN_USER`           | header ausente / usuário que não existe                                  |
| 404    | `PROFESSIONAL_NOT_FOUND` / `SLOT_NOT_FOUND`  | profissional ou horário que não existe                                   |
| 404    | `BOOKING_NOT_FOUND`                          | sessão que não existe ou é de outro usuário (a resposta não revela qual) |
| 409    | `SLOT_UNAVAILABLE`                           | o horário já tem agendamento confirmado                                  |
| 409    | `BOOKING_OVERLAP`                            | o usuário já tem sessão confirmada que coincide com o horário            |
| 409    | `BOOKING_ALREADY_CANCELLED`                  | a sessão já foi cancelada                                                |
| 422    | `SLOT_IN_PAST` / `PROFESSIONAL_INACTIVE`     | horário que já começou / profissional inativo                            |
| 422    | `CANCELLATION_WINDOW_CLOSED`                 | cancelamento com menos de 24 horas para o início da sessão               |
| 500    | `INTERNAL_ERROR`                             | erro inesperado: logado com o contexto, sem detalhes na resposta         |

## Como executar

### Backend com Docker (um comando)

```bash
docker compose -f infra/docker-compose.yml up --build    # ou: pnpm docker:up
```

O comando sobe o MySQL com o `infra/seed.sql` e a API em http://localhost:3000. A API espera o banco ficar pronto, aplica as migrations pendentes e então começa a responder.

Para usar a tela com esse backend, rode o web localmente: `pnpm install && pnpm --filter @namu/web dev`, em http://localhost:3001. Ele repassa `/api` para a API em `localhost:3000`.

As variáveis têm os valores do `.env.example` por padrão. Para usar outros, passe `--env-file .env`. Para recomeçar do seed, rode `docker compose -f infra/docker-compose.yml down -v`.

Para experimentar com os dados do seed, use datas relativas ao dia em que o banco foi criado:

```bash
curl localhost:3000/professionals
curl "localhost:3000/professionals/1/slots?date=$(date -d '+2 days' +%F)"   # macOS: date -v+2d +%F
curl -X POST localhost:3000/bookings -H 'X-User-Id: 1' -H 'Content-Type: application/json' -d '{"slotId": 9}'
curl localhost:3000/me/bookings -H 'X-User-Id: 1'
curl -X DELETE localhost:3000/bookings/2 -H 'X-User-Id: 2'
```

### Desenvolvimento local

Pré-requisitos: Node.js 24 (`nvm use` lê o `.nvmrc`), pnpm 12 (`corepack enable` usa a versão fixada no `package.json`) e Docker com Compose.

```bash
pnpm install
cp .env.example .env                                  # a api lê o .env da raiz e valida as variáveis ao subir
docker compose -f infra/docker-compose.yml up -d mysql
pnpm --filter @namu/api db:migrate
pnpm dev                                              # api em http://localhost:3000 e web em http://localhost:3001
```

| Comando               | O que faz                                             |
| --------------------- | ----------------------------------------------------- |
| `pnpm lint`           | ESLint em todos os pacotes                            |
| `pnpm lint:structure` | confere a organização por agregado dos módulos da api |
| `pnpm typecheck`      | checagem de tipos em todos os pacotes                 |
| `pnpm test:unit`      | testes unitários (da api)                             |
| `pnpm test:e2e`       | testes e2e da api contra o MySQL                      |
| `pnpm build`          | build de produção da api e do web                     |
| `pnpm format:check`   | verifica a formatação (Prettier)                      |

Os comandos de banco rodam na api (`pnpm --filter @namu/api <comando>`) e leem o `.env` da raiz:

| Comando       | O que faz                                                            |
| ------------- | -------------------------------------------------------------------- |
| `db:migrate`  | aplica as migrations pendentes                                       |
| `db:revert`   | desfaz a última migration                                            |
| `db:generate` | gera uma migration a partir da diferença entre entidades e banco     |
| `db:create`   | cria uma migration vazia (para o que o TypeORM não gera, como CHECK) |

### Testes

- **Unitários** (`pnpm test:unit`): cobrem as regras de agendamento e cancelamento do `BookingService`, com repositórios simulados e relógio fixo, e o cálculo do dia de São Paulo, inclusive em datas históricas de horário de verão.
- **E2E** (`pnpm test:e2e`, com o MySQL do compose no ar): cobrem cada endpoint contra o MySQL de verdade, as constraints do banco e a disputa por horário com requisições simultâneas. Cada suíte recria do zero um banco próprio, `<DB_NAME>_test`, com o seed e as migrations. O banco de desenvolvimento não é tocado.
- **Tela:** sem testes automatizados, por decisão de escopo. Os fluxos de agendamento e cancelamento e os casos de erro foram verificados no navegador.
- **CI** (GitHub Actions, a cada push e pull request): roda formatação, lint, estrutura, typecheck e testes unitários, e também os e2e contra um MySQL no próprio job.

## Estrutura

```
apps/
  api/                       NestJS 11: API REST com as regras de agendamento
    src/
      main.ts                bootstrap: logger, borda HTTP, OpenAPI
      app.module.ts          escolhe os módulos e as configurações carregadas
      modules/
        schedule/            módulo de agendamento, uma pasta por agregado
          professional/      professional.{entity,repository,service,controller,dto}.ts …
          slot/              horários de disponibilidade
          booking/           agendamentos (regras de concorrência no service)
          user/              usuários (existência e lock por pessoa)
          shared/            persistência (datasource, migrations) e fuso de São Paulo
          __test__/          e2e, factories e suporte dos testes
        shared/              infraestrutura comum: config, context, auth, exception, http, logger, typeorm
  web/                       Next.js 16: tela de agendamento
    src/
      app/                   layout, provedores (TanStack Query, usuário atual) e a página
      modules/
        schedule/            professional/, slot/, booking/: tipos, queries e componentes de cada conceito
        shared/              cliente da API, usuário atual, fuso de São Paulo, alerta
packages/                    presets compartilhados de ESLint e TypeScript
infra/                       docker-compose.yml e seed.sql fornecido (não editado)
scripts/                     validação da estrutura dos módulos
```

- **Monorepo:** pnpm workspaces e Turborepo, que orquestra `build`, `lint`, `typecheck` e os testes com cache.
- **Bootstrap:** o app só sobe a aplicação; as regras ficam nos módulos.
- **Organização por agregado:** os arquivos de um conceito de negócio ficam juntos e se distinguem pelo sufixo, não por pastas técnicas.
- **Fronteiras:** de fora de um módulo ou de uma área de `shared/`, só se importa o `index.ts`. O ESLint barra imports de arquivos internos, e o `lint:structure` barra pastas por camada.

## Tecnologias e por quê

| Tecnologia                                 | Por quê                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NestJS 11                                  | Preferido no enunciado; módulos e injeção de dependência deixam as regras testáveis, e guards, pipes e filtros concentram a borda HTTP                      |
| TypeORM 0.3 + mysql2                       | Migrations versionadas com `up` e `down`; locks pessimistas e QueryBuilder sem SQL solto nos services                                                       |
| `nestjs-cls` + `@nestjs-cls/transactional` | Contexto por requisição (request id, usuário) e `@Transactional` declarativo: os repositórios entram na transação sem receber o EntityManager por parâmetro |
| zod                                        | Configuração validada na subida: a API não sobe com variável faltando ou inválida                                                                           |
| class-validator / class-transformer        | Validação dos DTOs e mapeamento entidade → resposta                                                                                                         |
| date-fns + `@date-fns/tz`                  | Conversão pelo fuso IANA `America/Sao_Paulo`, não por offset fixo                                                                                           |
| winston                                    | Logs estruturados: JSON em produção, legível em desenvolvimento                                                                                             |
| `@nestjs/swagger`                          | Documentação gerada dos DTOs, com os códigos de erro de cada rota                                                                                           |
| Jest + supertest + knex                    | E2E pela API real; o knex prepara e confere dados sem passar pela aplicação                                                                                 |
| Next.js 16 + React 19                      | Tela web: roda no navegador sem emulador nem build nativo; o proxy `/api` do Next fala com a API sem CORS                                                   |
| TanStack Query                             | Estados de carregando e erro, cache e recarga de horários e sessões depois de agendar                                                                       |
| Tailwind CSS 4                             | Estilo junto do componente, sem folha de estilos à parte                                                                                                    |
| pnpm + Turborepo                           | API e web no mesmo repositório, com tarefas e cache por pacote                                                                                              |

## Decisões técnicas

### 1. Um horário nunca recebe dois agendamentos confirmados

**Como:** em duas camadas.

- **Lock na transação:** o agendamento roda numa transação `READ COMMITTED` que trava a linha do horário (`SELECT … FOR UPDATE`). Quem disputa o mesmo horário espera; quando chega a vez, a checagem já vê o agendamento do primeiro e devolve `SLOT_UNAVAILABLE`.
- **Garantia no banco:** a coluna gerada `confirmed_slot_id = IF(status = 'confirmed', slot_id, NULL)` tem índice único. Assim o banco recusa um segundo confirmado mesmo que alguém escreva fora da API, e os cancelados (NULL) não colidem.

**Alternativas:**

- Só consultar antes de gravar: com duas requisições simultâneas, as duas passam pela consulta.
- `UNIQUE (slot_id)`: impediria reagendar um horário cancelado.
- Índice parcial: o MySQL não tem.
- Lock otimista com versão: exigiria retry e complicaria a resposta ao usuário.
- `SERIALIZABLE`: traz gap locks e deadlocks para uma regra que se resolve travando uma linha.

**Como foi provado:** o e2e dispara quatro agendamentos simultâneos no mesmo horário e confere que sai exatamente um 201 e uma linha confirmada. Removendo o lock do código, o índice único continua segurando a regra.

### 2. O usuário não tem duas sessões confirmadas sobrepostas

**Como:** a mesma transação trava antes a linha do usuário em `users` (`FOR UPDATE`), o que enfileira os agendamentos de uma mesma pessoa. A checagem de sobreposição usa intervalos semiabertos: uma sessão que termina quando a outra começa não conta. A ordem dos locks é sempre usuário → horário, para não haver deadlock. O `READ COMMITTED` faz as leituras depois dos locks enxergarem o que a transação concorrente acabou de gravar.

**Alternativas:**

- Constraint de exclusão de intervalos: o MySQL não tem (o Postgres tem, com `EXCLUDE`).
- Trigger: lógica escondida e difícil de testar.
- `GET_LOCK` (lock nomeado): vive fora da transação e da conexão do pool.
- Lock de tabela: serializaria todos os usuários.

**Como foi provado:** o e2e pede ao mesmo tempo, para a mesma pessoa, dois horários sobrepostos de profissionais diferentes, e confere um 201 e um `BOOKING_OVERLAP`. Removendo esse lock, o teste falha.

### 3. Fuso horário: UTC por dentro, São Paulo na borda

**Como:**

- **Dentro da aplicação:** banco, aplicação e conexão (`timezone: 'Z'`) trabalham em UTC.
- **Entrada:** o parâmetro `date` vira o intervalo `[00:00, 24:00)` do dia em São Paulo. Cada limite é calculado como a meia-noite local pelo fuso IANA, então o dia pode ter 23h ou 25h nas datas históricas de horário de verão.
- **Saída:** as respostas trazem o offset de São Paulo.

**Alternativas:**

- Offset fixo `-03:00`: quebra em datas com horário de verão e se ele voltar a existir.
- `CONVERT_TZ` no MySQL: depende das tabelas de fuso estarem carregadas no servidor.
- Gravar em horário local: ambíguo na hora repetida do fim do horário de verão.

**Como foi provado:** o teste unitário pegou um erro real durante o desenvolvimento. Calcular o fim do dia como "início + 1 dia" dava 24h no dia em que a meia-noite não existiu.

### 4. Monólito modular organizado por agregado

**Como:**

- **Bootstrap mínimo:** o app só sobe a aplicação.
- **Um único módulo de negócio, `schedule`:** dentro dele, uma pasta por conceito (`professional`, `slot`, `booking`, `user`) com entidade, repositório, service, controller e DTO lado a lado.
- **Repositórios encapsulam o TypeORM:** os services não montam consultas.
- **Infraestrutura comum em `shared/`:** cada área é importada pelo `index.ts`.

**Alternativas:**

- Camadas técnicas (`core/`, `http/`, `persistence/`): espalham um conceito por várias pastas.
- Arquitetura hexagonal com ports e adapters: interfaces sem segunda implementação, excesso para o escopo.
- Módulos `identity` e `catalog` separados: a transação do agendamento trava usuário, horário e profissional juntos, então essa regra fica dentro de uma fronteira só.
- Pacotes separados no monorepo: configuração de build sem ganho com um único deploy.

### 5. Schema evoluído por migrations, sem tocar no seed

**Como:** o `seed.sql` fornecido continua sendo o ponto de partida. As entidades espelham exatamente o schema dele: um `db:generate` contra o banco recém-criado não acusa diferença.

- **Primeira migration:** gerada a partir das entidades. Adiciona a coluna gerada com índice único, `(user_id, status)` para as consultas por usuário e `UNIQUE (professional_id, starts_at)`.
- **Segunda migration:** criada à mão, porque o TypeORM não gera CHECK no MySQL. Garante que cancelado tenha `cancelled_at` e que o horário termine depois de começar.
- **Testes:** as duas têm `up` e `down`, e o ciclo `migrate → revert → migrate` foi testado.
- **Docker:** a API aplica as pendentes ao subir.

**Alternativas:**

- `synchronize: true`: altera o schema sem revisão.
- Editar o seed: proibido pelo enunciado.
- SQL avulso fora de versionamento.

### 6. Erros como parte do contrato

**Como:** os services lançam exceções de domínio por categoria (entrada inválida, não autenticado, não encontrado, conflito, regra de negócio), sem nada de HTTP. Um filtro global traduz cada categoria no status e no formato único. Erros do próprio framework (rota inexistente, JSON malformado, corpo grande demais) saem no mesmo formato. Erros inesperados viram 500, logados com o `requestId` e sem detalhes vazando.

**Alternativas:**

- `HttpException` dentro dos services: acopla a regra ao HTTP.
- try/catch em cada controller: repetição e risco de esquecer um caso.

### 7. Frontend: React web, com as regras na API

**Como:**

- **Plataforma:** React web com Next.js. A avaliação roda no navegador, sem emulador nem build nativo, e o front usa o mesmo monorepo e o mesmo TypeScript da API.
- **Dados:** os componentes rodam no cliente com TanStack Query e falam com a API pelo proxy `/api` do Next, então não há CORS. Depois de agendar, ou de uma recusa, recarregam horários e sessões. Erros de regra (4xx) não são repetidos.
- **Regras na API:** o front só guia (data mínima hoje, botão desabilitado sem horário) e mostra a `message` da API com um título por `code`. Quando a API recusa, a seleção do horário é desfeita.
- **Fuso:** tudo é exibido em `America/Sao_Paulo` com `Intl`, qualquer que seja o fuso do navegador. O "hoje" é calculado só no navegador, e a página é pré-renderizada como estática.
- **Usuário:** um seletor com os usuários do seed, já que não há autenticação, enviado no `X-User-Id`.

**Alternativas:**

- React Native: exigiria emulador ou aparelho para avaliar uma tela de formulário.
- Server Components com Server Actions: menos JavaScript no cliente, mas o fluxo é interativo e os estados de erro ficam mais simples no cliente.
- `fetch` com `useEffect` e estado manual: reimplementaria cache, carregamento e recarga.
- Converter horários pelo fuso do navegador: mostraria o horário errado para quem não está em São Paulo.

Ref. NMU-7203

## Riscos e limites

- **Identificação, não autenticação:** qualquer cliente pode se passar por outro usuário trocando o `X-User-Id`. O `AuthGuard` é o ponto de troca para um JWT ou OIDC.
- **Migrations na subida do container:** servem para uma instância. Com réplicas, devem virar um passo do deploy, porque o TypeORM não trava a execução concorrente. Como o MySQL não tem DDL transacional, uma migration que falha no meio deixa o schema parcial, então elas devem ficar pequenas.
- **Contenção:** um horário muito disputado enfileira as requisições no lock. Cada uma espera no máximo o `innodb_lock_wait_timeout` do servidor (50s por padrão), que vale ajustar para a experiência desejada.
- **Escopo do domínio:** não há gestão de agenda dos profissionais. A duração do horário não é conferida com `session_minutes`, e `GET /me/bookings` não tem paginação.
- **Usuário do banco:** o compose usa o `root` do seed. Em produção, seria um usuário próprio com permissões mínimas.
- **Tela sem testes automatizados:** a verificação foi manual, no navegador.
- **Usuários fixos na tela:** o seletor lista os quatro usuários do seed. Com autenticação real, ele deixa de existir.

## O que faria com mais tempo

- Autenticação real; o seletor de usuário da tela sai.
- Testes e2e da tela com Playwright: fluxo de agendamento e mensagens de erro.
- Chave de idempotência no `POST /bookings`, para retries do cliente não virarem um `SLOT_UNAVAILABLE` confuso.
- Health check (`/health` com o banco) para o orquestrador e métricas e tracing com OpenTelemetry.
- Migrations como job separado no pipeline de deploy.
- Testcontainers nos e2e, para não depender de um MySQL já no ar.
