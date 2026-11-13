# RMVM 7 - versao sem executavel

Site institucional + area de denuncias + painel administrativo.

Esta versao **nao inclui** Node.js nem launcher `.exe`.
A base de dados e **SQLite** e vai incluida: nao precisa de MariaDB
nem MySQL.

As dependencias do projeto (`node_modules`) **ja vao incluidas**.
Por isso nao e preciso correr `npm install` para abrir o site.

## Requisitos

- **Node.js 20+** - https://nodejs.org (versao LTS)
- Mais nada. A base de dados e criada automaticamente em `dados/rmvm.db`.

## Instalar e abrir

Na pasta do projeto, abra o `cmd` e execute:

```bat
npm run dev
```

Se estiver no PowerShell e o comando for bloqueado pela politica de
scripts, use:

```bat
npm.cmd run dev
```

Alternativa equivalente, sem depender do npm:

```bat
node scripts\dev.js
```

O `scripts\dev.js`:

1. cria `backend/.env` a partir de `backend/.env.example` (com um segredo JWT novo);
2. cria a pasta `dados/` e o ficheiro SQLite `dados/rmvm.db`, se ainda nao existirem;
3. gera o cliente Prisma e sincroniza o schema com a base;
4. arranca a API e o Vite;
5. abre o navegador.

Enderecos normais:

| Servico | Endereco |
|---|---|
| Site (desenvolvimento) | http://localhost:5173 |
| API | http://localhost:3001 |

Se uma porta estiver ocupada, o script escolhe a seguinte e mostra-a.

## Base de dados

- Ficheiro: `dados/rmvm.db`
- Motor: SQLite (embutido, sem servico nem instalacao)
- Prisma com `@prisma/adapter-libsql`

Para mudar o local da base, defina `DATABASE_URL` em `backend/.env`:

```env
DATABASE_URL="file:./dados/rmvm.db"
```

Os caminhos relativos sao resolvidos a partir da pasta do projeto.

Para recomecar do zero:

1. feche o site;
2. apague a pasta `dados/`;
3. volte a executar `npm run dev`.

## Conta inicial

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@rmvm.com` | `admin123` |

Pode alterar a senha em **Minha conta** depois de entrar.

## Modo producao local

O site compilado ja vem em `frontend/dist/`.

```bat
npm.cmd run build     :: opcional, se alterar o frontend
npm.cmd start         :: servidor de producao em http://localhost:3001
```

## Estrutura

```
backend/            API Express + Prisma
  node_modules/     dependencias ja instaladas
  prisma/           schema SQLite
  scripts/          ensure-db.js e start-prod.js
  src/              codigo da API
frontend/           React + Vite
  node_modules/     dependencias ja instaladas
  dist/             site ja compilado
  src/              codigo do site
dados/              base SQLite (criada no primeiro arranque)
scripts/
  dev.js            arranque de desenvolvimento (API + Vite)
  setup.js          instalacao de dependencias e preparacao da base
  env.js            criacao/leitura de backend/.env
INSTALAR.txt        instrucoes passo a passo para quem vai usar
LEIA-ME.txt         resumo rapido
```

## Comandos uteis

```bat
npm.cmd run dev         :: desenvolvimento (API + Vite)
npm.cmd install         :: reinstalar/atualizar dependencias (opcional)
npm.cmd run setup       :: reinstalar e preparar a base de dados
npm.cmd run build       :: gera frontend/dist
npm.cmd start           :: servidor de producao local
npm.cmd run db:check    :: confirma o caminho da base SQLite
npm.cmd run db:deploy   :: sincroniza o schema com SQLite (prisma db push)
npm.cmd run lint        :: analisa o frontend
```

Evite `npm run dev` no PowerShell, porque o Windows pode bloquear o
`npm.ps1`. Use `npm.cmd run dev` ou `node scripts\dev.js`.

## Sobre os binarios em node_modules

As pastas `node_modules` contem bibliotecas de terceiros. Algumas
trazem ficheiros binarios proprios (por exemplo, o motor do Prisma e
o modulo nativo do libSQL). Isso e normal e nao e o executavel do site:
o site e aberto pelo Node.js com `npm run dev` ou `node scripts\dev.js`.

## Problemas comuns

- **`node` nao reconhecido**: instale o Node.js e reabra o `cmd`.
- **`npm` bloqueado no PowerShell**: use `npm.cmd run dev`.
- **Porta ocupada**: o script escolhe outra porta e mostra o endereco.
- **Recomecar os dados**: apague a pasta `dados/` e volte a executar
  `npm run dev`.
