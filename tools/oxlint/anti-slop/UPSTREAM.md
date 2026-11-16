# Upstream provenance

The following files were adapted from [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)
at commit [`13909c9e07590f5a85d93c62712259fe14a883f7`](https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7/src):

- `rules/no-reduce-accumulator-copy.ts`
- `shared/array-method.ts`
- `effect/rules/no-manual-effect-error-tag.ts`
- `effect/rules/no-manual-tag-comparison.ts`
- `effect/shared/tagged-values.ts`

Paths are relative to this directory and correspond to upstream's `src/` paths.
The upstream MIT notice is retained in [LICENSE](./LICENSE).

Local adaptations: omit unused tagged-construction helpers; stop broad-handler
classification at nested function declarations, as well as function expressions
and arrows. The CLI tests in `tests/reducer-and-tags.test.mjs` are local and run
both Effect rules together to verify that findings are not duplicated.

The existing `min-function-body-lines` rule is local. Preserve it and existing
rules when updating selected upstream files; do not replace this directory
wholesale. This revision describes only the files listed above, not the earlier
vendored rules.

## Selected rules from Kyle Mistele's fork

The following files were adapted from [K-Mistele/anti-slop](https://github.com/K-Mistele/anti-slop)
at commit [`b7c1619b4d51b4815e89ba3700a975a6ec54b8c3`](https://github.com/K-Mistele/anti-slop/tree/b7c1619b4d51b4815e89ba3700a975a6ec54b8c3/src):

- `rules/max-ternary-depth.ts`
- `rules/no-disabled-type-assertion-rules.ts`
- `rules/no-reprovide-ambient-service.ts`
- `effect/rules/no-ordie-in-service-construction.ts`
- `effect/rules/require-cause-when-narrowing.ts`
- `effect/shared/effect-modules.ts`
- `martinfowler/rules/global-data.ts`
- `martinfowler/rules/mutable-data.ts`
- `martinfowler/rules/mysterious-name.ts`
- `martinfowler/shared.ts`

The upstream MIT notice matches the retained [LICENSE](./LICENSE).
Local adaptations omit unused shared helpers, reset the ambient-service rule's
import names before each file, and register only the three selected Fowler rules
in a local `martinfowler/index.ts`. The CLI fixtures in
`tests/selected-rules.test.mjs` are local and use the root configuration's
registration, options and severities.

`docs/agents/testing.md` adapts the fork's `test-cannot-fail` review question at
the same revision. No Jev plugin, model runner or model dependencies are copied.
