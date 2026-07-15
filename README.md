# Effect app template

A deliberately small TypeScript monorepo for building a Vite web application and an Effect HTTP server from one shared contract.

## Stack

- pnpm workspaces and Turborepo
- Effect v4 (Smol) HTTP API
- Vite and React
- Effect Atom and `@effect/atom-react`
- Base UI with CSS Modules and CSS custom properties
- Vitest and `@effect/vitest`

Effect Smol is experimental. Its packages are pinned to one exact beta through the pnpm catalog and root overrides so upgrades are deliberate and atomic.

## Workspace

```text
apps/
├── api/                 Effect HTTP server and Node composition root
└── web/                 Vite React application and browser composition root
packages/
├── http_api/            Shared schemas and HTTP endpoint descriptions
└── ui/                  Styled Base UI wrappers and design tokens
```

Both `apps/*` and `packages/*` are workspace packages. Internal dependencies use `workspace:*`; shared external versions use `catalog:`.

## Runtime model

- `apps/api/src/main.ts` is the only server execution edge. It launches one root layer and lets Effect own process signals and resource cleanup.
- `apps/web/src/api_client.ts` defines the browser HTTP client as an `AtomHttpApi.Service`. Effect Atom builds its layer and exposes typed query and mutation atoms.
- `apps/web/src/app/app_providers.tsx` owns the React `RegistryProvider`, which scopes atom state, running fibers, and cleanup to the application.
- `packages/http_api` describes the HTTP interface but never creates or runs a runtime.
- `packages/ui` has no Effect dependency.

Create and compose Effects inside application code. Run them only at application edges such as `main.ts`, Effect Atom integrations, or tests.

## Getting started

The repository pins Node and pnpm versions. Use Corepack for every pnpm command.

```sh
corepack pnpm install
corepack pnpm dev
```

The web application runs at `http://localhost:5173`. Vite proxies `/api` requests to the Effect server at `http://localhost:3000`.

The root `dev` command uses Turbo to run every workspace package that declares a persistent `dev` task. Run one application through the same task graph with `corepack pnpm dev:web` or `corepack pnpm dev:api`.

## Commands

```sh
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm format
```

Copy `.env.example` to `.env` when local server configuration diverges from the defaults.

## Naming

React files and directories use snake case. React components, TypeScript types, and Effect layer/schema/API descriptors use PascalCase to match their ecosystems; ordinary functions and variables use camelCase.
