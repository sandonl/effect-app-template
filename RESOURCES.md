# Effect-first React Resources

## Knowledge

- [Effect `AtomHttpApi` source](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/unstable/reactivity/AtomHttpApi.ts)
  Primary implementation of typed HTTP API query and mutation atoms. Use for: client construction, query lifetimes, serialization, and reactivity keys.
- [Effect Atom runtime source](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/unstable/reactivity/Atom.ts)
  Primary implementation of `Atom.runtime` and its shared layer memo map. Use for: understanding what “runtime” means in Atom.
- [Effect React `RegistryProvider` source](https://github.com/Effect-TS/effect/blob/main/packages/atom/react/src/RegistryContext.ts)
  Primary implementation of React registry ownership and disposal. Use for: provider lifecycle and React Strict Mode behavior.
- [TanStack Query React overview](https://tanstack.com/query/latest/docs/framework/react/overview)
  First-party description of TanStack Query as asynchronous/server-state infrastructure. Use for: deciding when its broader ecosystem is the better owner.
- [TanStack Query cancellation guide](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
  First-party explanation of its `AbortSignal` query contract. Use for: understanding the Promise bridge the previous scaffold required.

## Wisdom (Communities)

- [Effect Discord](https://discord.gg/effect-ts)
  Maintainer and practitioner community. Use for: validating patterns around unstable Effect v4 APIs before a major production commitment.

## Gaps

- Effect v4 Atom documentation is still developing; source code is currently the most authoritative reference for several lifecycle details.
