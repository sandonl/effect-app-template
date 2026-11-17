# Effect app template

A deliberately small TypeScript monorepo for building a TanStack Start web application and an Effect HTTP server from one shared contract.

## Stack

- Bun workspaces and Turborepo
- Effect v4 HTTP API
- TanStack Start, TanStack Router, Vite and React
- Effect Atom and `@effect/atom-react`
- Alchemy v2 infrastructure as Effect
- Base UI with CSS Modules and CSS custom properties
- Oxlint with generic and Effect-specific [anti-slop](https://github.com/dmmulroy/anti-slop) rules
- Effect TSGO for type-aware Effect diagnostics and editor support
- Vitest and `@effect/vitest`

Effect packages are pinned to one exact version through the Bun catalog and root overrides so upgrades are deliberate and atomic. Effect v4 is stable, but the HTTP, platform and Atom APIs used here still carry unstable annotations.

## Workspace

```text
apps/
├── api/                 Effect HTTP API and local Node adapter
└── web/                 TanStack Start application and file-based routes
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
- `apps/web/src/router.tsx` creates a router per application instance; `src/routes/__root.tsx` owns the document and providers, and `src/routes/index.tsx` serves the home page.
- `apps/web/src/api_client.ts` defines the browser HTTP client as an `AtomHttpApi.Service`. Effect Atom builds its layer and exposes typed query and mutation atoms.
- `apps/web/src/app/app_providers.tsx` owns the React `RegistryProvider`, which scopes atom state, running fibers, and cleanup to the application.
- `packages/http_api` describes the HTTP interface but never creates or runs a runtime.
- `packages/ui` has no Effect dependency.

Create and compose Effects inside application code. Run them only at application edges such as `main.ts`, Effect Atom integrations, or tests.

## Template boundaries

This repository is ready as a minimal application template. It intentionally provides one complete read path rather than preselecting application architecture that every product may not need.

- TanStack Start is the preferred web framework. File-based routes live in `apps/web/src/routes`; Start owns the document and hydration. SPA mode keeps route content browser-rendered and prerenders the root shell to `dist/client/index.html`.
- The default deployment uses the SPA shell. Start server functions and request-time SSR are not part of this template; configure server hosting before adding them.
- Effect Atom owns request state, but the template does not impose retry, polling, focus-refetch, or long-lived cache policies.
- The health endpoint demonstrates a query. Add mutation and reactivity-key invalidation only when the first write use case exists.
- Cloudflare is the default deployment provider. Authentication, persistence, observability, custom domains, and CI remain application decisions.
- Upgrade all centrally pinned Effect packages together and verify the full workspace. APIs marked unstable can still change between releases, even though Effect v4 itself is stable.

## Getting started

The repository pins Bun and Node versions.

Use Bun 1.4.4 and the Node 22.23.4 version in `.node-version`. The supported Node ranges are `^22.22.3 || ^24.11.1 || >=26.0.0`, covering the updated Alchemy CLI and build tooling requirements.

```sh
bun install
bun run dev
```

The web application runs at `http://localhost:5173`. Vite proxies `/api` requests to the Effect server at `http://localhost:3000`.

The root `dev` command uses Turbo to run every workspace package that declares a persistent `dev` task. Run one application through the same task graph with `bun run dev:web` or `bun run dev:api`.

## Web routes

Prefer TanStack Start for new web features. Add route files under `apps/web/src/routes`; `bun run dev:web` and `bun run build` regenerate `src/routeTree.gen.ts`. Commit that generated file so a fresh checkout can typecheck before starting Vite. Do not edit it by hand.

The API client uses relative URLs locally and `VITE_API_URL` when deployed. It does not access browser globals during module loading, because Start also loads modules while building the SPA shell.

See the [Start setup guide](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch) and [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode).

## Effect language tooling

`@effect/tsgo` adds Effect-aware checks that ordinary TypeScript and syntax linting cannot perform, such as finding unhandled Effect errors, missing services, floating Effects, and duplicate Effect package versions.

`bun install` runs the `prepare` script, which connects Effect TSGO to TypeScript and Oxlint. Oxlint runs the Effect correctness preset alongside the existing anti-slop rules. Editor diagnostics are disabled in the language-service configuration so the same finding is not shown twice; Oxlint remains the single lint command.

VS Code-based editors will recommend the TypeScript 7 and Oxc extensions, use the workspace-pinned Effect TSGO language server, and show the type-aware Oxlint findings. Other editors need to be configured to use `effect-tsgo` and Oxlint as language servers.

## Anti-slop lint policies

The local plugins reject repeated reducer-accumulator copies and manual `_tag`
branching. Prefer a fresh, locally owned accumulator, selective Effect error
handlers, and `Match` or `Predicate.isTagged` helpers. Oxlint's built-in
`oxc/no-accumulating-spread` covers reducer spread copies alongside the custom
non-spread rule. See the [policies and limits](./tools/oxlint/anti-slop/README.md).

Additional checks limit nested ternaries, protect assertion safeguards, and
flag lost error causes, hidden startup failures and redundant dependency wiring.
Selected Fowler checks warn about shared mutable state and vague names. See the
same policy reference for their limits, and the
[test review guidance](./docs/agents/testing.md) for meaningful assertions.

The custom `anti-slop/min-function-body-lines` rule requires at least three
code-bearing body lines for standalone functions and ordinary methods. It targets
trivial extracted wrappers, not short framework callbacks or React composition.
Do not add filler to satisfy it: inline unnecessary wrappers, or document an
intentional boundary with a narrow suppression. See the [counting rules,
exceptions and tests](./tools/oxlint/anti-slop/README.md).

Run `bun run test:lint-rules` for the real Oxlint fixture tests; `bun run test`
also runs them before the workspace tests.

## Cloudflare deployment

[Alchemy v2](https://alchemy.run/) is installed at the workspace root and exactly pinned alongside Effect. [`alchemy.run.ts`](./alchemy.run.ts) is the deployment composition root. It deploys the Effect HTTP API as a Cloudflare Worker and the TanStack Start app as a Cloudflare Website, with Cloudflare-backed Alchemy state.

Normal install, local development, build, test, and typecheck commands never provision cloud resources. Local development remains provider-independent:

```sh
bun run dev
```

To use Cloudflare-backed development or deployment, authenticate Alchemy once, then explicitly run the relevant command:

```sh
bunx alchemy login alchemy.run.ts
bun run cloudflare:dev
bun run plan
bun run deploy
```

Remove deployed resources with `bun run destroy`.

The deployed API URL is passed to Vite as `VITE_API_URL`. This is public configuration embedded in the browser bundle, not a secret. Never put API tokens, account IDs, credentials, or other sensitive values in a `VITE_*` variable. Alchemy keeps provider profiles outside the repository in `~/.alchemy/profiles.json`; `.alchemy`, `.dev.vars*`, `.wrangler`, and local environment files are ignored.

The template permits cross-origin `GET` and `OPTIONS` requests because the SPA and API receive separate Cloudflare URLs. Tighten `allowedOrigins` in `infrastructure/cloudflare_api.ts` when introducing authentication or a custom domain.

## Commands

```sh
bun run build
bun run typecheck
bun run lint
bun run test
bun run plan
```

## Naming

React files and directories use snake case, except framework conventions such as `__root.tsx` and the generated `routeTree.gen.ts`. React components, TypeScript types, and Effect layer/schema/API descriptors use PascalCase to match their ecosystems; ordinary functions and variables use camelCase.
