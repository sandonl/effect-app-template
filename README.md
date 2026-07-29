# Effect app template

A deliberately small TypeScript monorepo for building a Vite web application and an Effect HTTP server from one shared contract.

## Stack

- pnpm workspaces and Turborepo
- Effect v4 (Smol) HTTP API
- Vite and React
- Effect Atom and `@effect/atom-react`
- Alchemy v2 infrastructure as Effect
- Base UI with CSS Modules and CSS custom properties
- Oxlint
- Vitest and `@effect/vitest`

Effect Smol is experimental. Its packages are pinned to one exact beta through the pnpm catalog and root overrides so upgrades are deliberate and atomic.

## Workspace

```text
apps/
├── api/                 Effect HTTP API and local Node adapter
└── web/                 Vite React application and browser composition root
infrastructure/           Cloudflare runtime adapters
packages/
├── http_api/            Shared schemas and HTTP endpoint descriptions
└── ui/                  Styled Base UI wrappers and design tokens
alchemy.run.ts            Cloudflare deployment composition root
```

Both `apps/*` and `packages/*` are workspace packages. Internal dependencies use `workspace:*`; shared external versions use `catalog:`.

## Runtime model

- `apps/api/src/api_layer.ts` composes the platform-neutral HTTP API and handlers.
- `apps/api/src/main.ts` is the local Node execution edge. It launches one root layer and lets Effect own process signals and resource cleanup.
- `infrastructure/cloudflare_api.ts` adapts that same API layer to a Cloudflare Worker's `fetch` interface.
- `apps/web/src/api_client.ts` defines the browser HTTP client as an `AtomHttpApi.Service`. Effect Atom builds its layer and exposes typed query and mutation atoms.
- `apps/web/src/app/app_providers.tsx` owns the React `RegistryProvider`, which scopes atom state, running fibers, and cleanup to the application.
- `packages/http_api` describes the HTTP interface but never creates or runs a runtime.
- `packages/ui` has no Effect dependency.

Create and compose Effects inside application code. Run them only at application edges such as `main.ts`, Effect Atom integrations, or tests.

## Template boundaries

This repository is ready as a minimal application template. It intentionally provides one complete read path rather than preselecting application architecture that every product may not need.

- The web application is a browser-only SPA. SSR, routing, and hydration are not configured.
- Effect Atom owns request state, but the template does not impose retry, polling, focus-refetch, or long-lived cache policies.
- The health endpoint demonstrates a query. Add mutation and reactivity-key invalidation only when the first write use case exists.
- Cloudflare is the default deployment provider. Authentication, persistence, observability, custom domains, and CI remain application decisions.
- Effect v4 and its Atom APIs are still beta/unstable. Upgrade all centrally pinned Effect packages together and verify the full workspace.

## Getting started

The repository pins Node and pnpm versions. Use Corepack for every pnpm command.

```sh
corepack pnpm install
corepack pnpm dev
```

The web application runs at `http://localhost:5173`. Vite proxies `/api` requests to the Effect server at `http://localhost:3000`.

The root `dev` command uses Turbo to run every workspace package that declares a persistent `dev` task. Run one application through the same task graph with `corepack pnpm dev:web` or `corepack pnpm dev:api`.

## Cloudflare deployment

[Alchemy v2](https://alchemy.run/) is installed at the workspace root and exactly pinned alongside Effect. [`alchemy.run.ts`](./alchemy.run.ts) is the deployment composition root. It deploys the Effect HTTP API as a Cloudflare Worker and the Vite SPA as a Cloudflare Website, with Cloudflare-backed Alchemy state.

Normal install, local development, build, test, and typecheck commands never provision cloud resources. Local development remains provider-independent:

```sh
corepack pnpm dev
```

To use Cloudflare-backed development or deployment, authenticate Alchemy once, then explicitly run the relevant command:

```sh
corepack pnpm exec alchemy login alchemy.run.ts
corepack pnpm cloudflare:dev
corepack pnpm plan
corepack pnpm deploy
```

Remove deployed resources with `corepack pnpm destroy`.

The deployed API URL is passed to Vite as `VITE_API_URL`. This is public configuration embedded in the browser bundle, not a secret. Never put API tokens, account IDs, credentials, or other sensitive values in a `VITE_*` variable. Alchemy keeps provider profiles outside the repository in `~/.alchemy/profiles.json`; `.alchemy`, `.dev.vars*`, `.wrangler`, and local environment files are ignored.

The template permits cross-origin `GET` and `OPTIONS` requests because the SPA and API receive separate Cloudflare URLs. Tighten `allowedOrigins` in `infrastructure/cloudflare_api.ts` when introducing authentication or a custom domain.

## Commands

```sh
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm plan
```

## Naming

React files and directories use snake case. React components, TypeScript types, and Effect layer/schema/API descriptors use PascalCase to match their ecosystems; ordinary functions and variables use camelCase.
