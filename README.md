# Sendflow Broadcast

Aplicação SaaS multi-tenant para disparo de mensagens (simulado) a contatos organizados por conexão. Cada usuário cadastrado é um cliente isolado: gerencia suas conexões, os contatos de cada conexão e as mensagens enviadas ou agendadas.

**Stack:** React 19 + Vite + TypeScript, Material UI, Tailwind CSS, Firebase Authentication, Firestore e Cloud Functions (v2, Node 22).

## Estrutura

```
.
├── web/            # frontend (Vite)
├── functions/      # Cloud Functions
├── rules-tests/    # testes das Security Rules no emulador
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

Os três pacotes são independentes (cada um com seu `package.json`) para não acoplar o deploy das functions ao restante do repositório.

No frontend o código é organizado por feature (`auth`, `connections`, `contacts`, `messages`). Cada feature segue o mesmo formato:

- `schema.ts` – schemas zod, que são a fonte dos tipos e das validações
- `api.ts` – funções de escrita no Firestore
- `hooks.ts` – leituras em tempo real (`onSnapshot`)
- `components/` – UI, que nunca acessa o Firestore diretamente

Não há classes no projeto; tudo é feito com funções, hooks e composição.

## Modelagem

Sem subcoleções: todas as coleções ficam na raiz e a hierarquia é representada por referências.

```
clients/{uid}         name, email, createdAt
connections/{id}      tenantId, name, createdAt, updatedAt
contacts/{id}         tenantId, connectionId, name, phone, createdAt, updatedAt
messages/{id}         tenantId, connectionId, body, recipients[], status,
                      scheduledAt, sentAt, createdAt, updatedAt
```

- `tenantId` é o `uid` do usuário no Firebase Auth e está presente em **todos** os documentos. Isso permite que as regras validem o dono com uma comparação direta, sem precisar subir na hierarquia.
- `connectionId` faz o papel que o caminho de uma subcoleção faria.
- `recipients` guarda uma cópia (`contactId`, `name`, `phone`) dos destinatários no momento do envio. Uma mensagem enviada é um registro histórico e não deve mudar se o contato for editado ou excluído depois.
- Telefones são normalizados para dígitos com DDI (`5511988887777`).

## Isolamento entre clientes

O isolamento é garantido pelas Security Rules (`firestore.rules`), não pelo frontend:

- Leitura, edição e exclusão só são permitidas quando `resource.data.tenantId == request.auth.uid`.
- Na criação, o documento precisa ter `tenantId` igual ao `uid` de quem escreve.
- Contatos e mensagens só podem ser criados em uma conexão do próprio cliente (a regra faz `get()` na conexão e confere o dono).
- `tenantId` e `connectionId` são imutáveis.
- Os campos de cada documento são validados (`hasOnly`, tipos e tamanhos), e `createdAt`/`updatedAt` precisam vir de `serverTimestamp()`.
- O status da mensagem nunca é alterado pelo cliente. Ele pode criar uma mensagem já enviada (com `sentAt == request.time`) ou agendada para o futuro, e só pode editar mensagens que ainda estão agendadas. A transição para "Enviada" é feita somente pelo backend.

As consultas do frontend sempre filtram por `tenantId`. Como as regras do Firestore não funcionam como filtro, uma consulta sem esse filtro seria rejeitada inteira.

Se um dia um cliente tiver vários usuários, basta mover o `tenantId` para um custom claim no token e comparar com `request.auth.token.tenantId`; a modelagem continua a mesma.

## Agendamento

`dispatchScheduledMessages` é uma função `onSchedule` que roda a cada minuto e:

1. busca mensagens com `status == "scheduled"` e `scheduledAt <= agora` (índice composto `status + scheduledAt`), paginando por cursor;
2. marca cada uma como enviada com `BulkWriter`, usando `lastUpdateTime` como precondição.

A precondição evita uma condição de corrida: se o usuário reagendar a mensagem entre a leitura e a escrita, a escrita falha e a próxima execução lê o estado atualizado. A operação é idempotente, então não há retry; o que falhar em um minuto é processado no seguinte.

Optei pela varredura periódica em vez de Cloud Tasks (uma tarefa por mensagem) porque ela não guarda estado fora do Firestore: editar ou excluir uma mensagem agendada não exige cancelar nada. O custo é uma precisão de até ~1 minuto, aceitável para esse caso. Se fosse necessário precisão de segundos, Cloud Tasks seria o próximo passo.

A lógica fica em funções puras (`dispatch.core.ts`) e em `runDispatch(db, now)`, que recebe as dependências por parâmetro; o handler da função só faz a ligação com o Firebase.

## Exclusão em cascata

Sem subcoleções, apagar uma conexão deixaria contatos e mensagens órfãos. O trigger `onConnectionDeleted` remove os documentos filhos (filtrando por `connectionId` e `tenantId`) no backend, então a limpeza acontece mesmo que o usuário feche a aba logo após excluir.

## Tempo real

Listas de conexões, contatos e mensagens usam `onSnapshot` através de um hook genérico (`useFirestoreQuery`). Quando a função agendada marca uma mensagem como enviada, a tela atualiza sozinha. Escritas aparecem na hora graças ao cache local do SDK.

## Rodando localmente

Requisitos: Node 22 (`.nvmrc`), Java 11+ (emulador do Firestore) e Firebase CLI.

```bash
npm --prefix web install
npm --prefix functions install
npm --prefix rules-tests install

npm --prefix functions run build
firebase emulators:start --only auth,firestore,functions --project demo-sendflow
npm --prefix web run dev
```

O `web/.env.development.local` deve ter `VITE_USE_EMULATORS=true` e `VITE_FIREBASE_PROJECT_ID=demo-sendflow` (veja `web/.env.example`).

O emulador não executa funções agendadas automaticamente; para simular a execução, rode `runDispatch` apontando para o emulador ou use o shell de functions.

## Testes

```bash
npm --prefix rules-tests run test:emu   # Security Rules (isolamento, validações, status)
npm --prefix functions run test:emu     # dispatcher e cascata contra o emulador
npm --prefix web test                   # schemas, normalização de telefone, filtros
```

## Deploy

Requer o plano Blaze (Cloud Scheduler). Com `web/.env.production.local` preenchido:

```bash
firebase deploy
```

Publica Hosting, Functions, regras e índices. O Firestore está em `nam5` e as functions em `us-central1`: triggers do Firestore (v2, via Eventarc) precisam estar numa região compatível com a do banco, e a localização do banco não pode ser alterada depois de criado.

## CI

`.github/workflows/ci.yml` roda em todo push e pull request: lint, testes e build do web, build das functions e os testes das Security Rules e das functions no emulador do Firestore (projeto `demo-sendflow`, sem credenciais).

O deploy é feito manualmente com `firebase deploy`.
