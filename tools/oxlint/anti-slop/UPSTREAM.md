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
