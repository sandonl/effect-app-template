# Related work from Dillon Mulroy

Researched 4 November 2026 for [PR #1](https://github.com/sandonl/effect-app-template/pull/1), now merged to `main` at `bda0e11a50a0cde2a907e63c2221c69b738c7160`. The intended GitHub account is **[dmmulroy](https://github.com/dmmulroy)**, also linked by this template's README.

## Recommendation

The closest match is the **anti-slop project already vendored here**. Its current upstream has seven rules this template does not have. Start with the two rules against copying reducer accumulators, then consider Effect error handling and tagged-value rules. Treat the filter/map and spacing rules as deliberate style choices rather than automatic upgrades.

The minimum-three-body-lines rule in PR #1 is a local policy: it is absent from the inspected upstream rule exports/tree. Mulroy's coding standards offer a useful companion judgment: delete a wrapper if doing so removes complexity; retain an abstraction if deleting it spreads complexity into its callers. A short function can therefore still earn its place. Sources: [upstream exports](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/index.ts), [deep modules and deletion test](https://github.com/dmmulroy/skills/blob/8603380821fee6a77c82639f364ce8fe4f5a92be/coding-standards/SKILL.md#deep-modules).

This report records the research before implementation. [PR #2](https://github.com/sandonl/effect-app-template/pull/2) subsequently adds `no-reduce-accumulator-copy`, `no-manual-effect-error-tag`, and `no-manual-tag-comparison`, plus native `oxc/no-accumulating-spread`. The remaining rules and companion skills remain recommendations.

## What is already here

The inspected `.oxlintrc.json` enables 15 generic anti-slop rules and `anti-slop-effect/no-service-constructor-imports`. They cover type assertions, widening, broad object/unknown types, runtime type checks, reflection, module mocking and naming. It also extends Effect TSGO's correctness preset. PR #1 adds `anti-slop/min-function-body-lines` separately. Sources: [base configuration](https://github.com/sandonl/effect-app-template/blob/a486b5809debf4b6e8129d6505956104a1619818/.oxlintrc.json), [PR changes](https://github.com/sandonl/effect-app-template/pull/1/files).

## Missing upstream rules, ranked

All anti-slop links below are pinned to inspected upstream commit `13909c9e07590f5a85d93c62712259fe14a883f7` (14 October 2026). Current upstream exports 18 generic and five Effect rules. The native Oxlint rule below is recommended by anti-slop but is maintained by Oxc. Source: [upstream README and configuration](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/README.md).

| Priority | Rule | What it catches | Judgment for this template |
| --- | --- | --- | --- |
| First | `anti-slop/no-reduce-accumulator-copy` | Repeated `Object.assign({}, acc, ...)`, `Array.from(acc)` and supported array-copy methods inside inline reducers. | A focused performance guard: growing copies can make work grow quadratically. Pair with native `oxc/no-accumulating-spread`, which catches spread forms. Neither proves all reductions are efficient. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/rules/no-reduce-accumulator-copy.ts). |
| Next | `anti-slop-effect/no-manual-effect-error-tag` | Manual error `_tag` comparisons/switches inside broad `Effect.catch`, `catchAll` and `catchIf` callbacks. | Encourages `catchTag`/`catchTags` or `catchReason`/`catchReasons`, keeping selective recovery clear. Good fit for an Effect-first application. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/effect/rules/no-manual-effect-error-tag.ts). |
| Next | `anti-slop-effect/no-manual-tag-comparison` | Direct `_tag` comparisons and switches outside those broad handlers. | Encourages `Match`, `Predicate.isTagged` or tagged-enum matching. Complements the error rule: it deliberately skips broad handlers to avoid duplicate findings. More opinionated than the error rule. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/effect/rules/no-manual-tag-comparison.ts). |
| Next | `anti-slop-effect/no-manual-tagged-construction` | Literal objects with string-valued `_tag` properties. | Encourages existing Schema/tagged-class/`Data.taggedEnum` constructors. Useful where constructors own real invariants, but also bans valid plain tagged objects. Direct `Match.when`/`Match.not` patterns are exempt. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/effect/rules/no-manual-tagged-construction.ts). |
| Optional | `anti-slop-effect/prefer-effect-match` | Two or more chained literal ternaries testing the same expression. | Matches Sandon's preference to reconsider ternaries. It is a readability policy; source-text comparison does not prove type identity or exhaustive handling. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/effect/rules/prefer-effect-match.ts). |
| Optional | `anti-slop/no-array-filter-map` | Adjacent eager array `filter().map()` and `map().filter()` passes when the rule has local array evidence. | Can remove intermediate arrays, but simple two-pass code is often clear. Iterator helpers need runtime support; changing to them can change side-effect ordering, indexes and sparse-array behavior. No guaranteed speedup or autofix. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/rules/no-array-filter-map.ts). |
| Optional | `anti-slop/require-readable-spacing` | Missing blank lines around declarations, multiline bindings and control-flow boundaries. | Whitespace-only autofix. Retains groups of single-line bindings and overloads. Useful if this is the intended house style; otherwise adds maintenance and formatting churn. Its vendored ESLint Stylistic engine needs its MIT license and provenance copied too. [Source](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/rules/require-readable-spacing.ts), [license/provenance](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/src/vendor/eslint-stylistic/UPSTREAM.md). |

The Effect rules are syntactic policies, not type-checker guarantees. Their helpers recognize exact `Effect`/`Match` identifiers and do not resolve renamed imports or prove that an object named `Effect` came from the library. The array rules also have documented local-evidence limits. Source: [analysis boundaries and examples](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/README.md#analysis-boundaries).

A read-only search of application, package and infrastructure source found no existing `_tag`, reducer, broad Effect catch, or adjacent filter/map examples needing conversion. This is a small starter, so the likely benefit is guarding future code. This was a source search, not an adoption lint run; it does not establish zero violations for every proposed rule.

## Related skills worth reading

Inspected `dmmulroy/skills` at commit `8603380821fee6a77c82639f364ce8fe4f5a92be` (23 July 2026).

- **[effect-service-design](https://github.com/dmmulroy/skills/blob/8603380821fee6a77c82639f364ce8fe4f5a92be/effect-service-design/SKILL.md)** is the strongest companion to the tiny-function rule. It asks whether a service owns real authority, effects, lifecycle or meaningful complexity. Pure calculations and forwarding wrappers stay ordinary values/modules. It covers Layer composition and honest test implementations, without making a test-only injection need sufficient reason for a new service.
- **[coding-standards](https://github.com/dmmulroy/skills/blob/8603380821fee6a77c82639f364ce8fe4f5a92be/coding-standards/SKILL.md)** explains the reasoning behind the rules: typed expected errors, parsing at boundaries, domain types, deep modules and outcome-based tests. It explicitly prefers Effect when the codebase already uses it; its `better-result` alternative gives no reason to add another error model here.
- **[cloudflare-composition-root](https://github.com/dmmulroy/skills/blob/8603380821fee6a77c82639f364ce8fe4f5a92be/cloudflare-composition-root/SKILL.md)** fits this template's Cloudflare deployment. Keep raw bindings and framework context at entrypoints/adapters, and give inner code narrow capabilities. Its Hono examples are examples, not a reason to replace this template's Effect HTTP API.

These are agent guidance rather than enforceable lint rules. Review and adapt them to existing instructions before installation; no wholesale architecture or skill installation is needed to use their ideas.

## How to adopt later

Upstream deliberately supplies vendored source and has no official npm package. Its update guidance says to preserve local customizations, stage upstream separately, use a three-way merge when provenance is recoverable, and record the upstream revision. This matters because PR #1 adds a local rule that a directory replacement would lose. Keep `oxlint` and `@oxlint/plugins` at matching exact versions. Source: [upstream installation/update guidance](https://github.com/dmmulroy/anti-slop/blob/13909c9e07590f5a85d93c62712259fe14a883f7/README.md#update-an-existing-installation).

For a follow-up change, choose the specific policies first, copy their required shared helpers/tests/licenses, scan the current code, then run real Oxlint behavior fixtures and the existing workspace checks. Preserve the minimum-lines rule and its documented short-boundary exceptions.
