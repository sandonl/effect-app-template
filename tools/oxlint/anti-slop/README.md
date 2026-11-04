# Anti-slop lint policies

## Reducer copies and tagged values

These rules are errors in the root Oxlint configuration:

| Rule | Rejected pattern | Preferred approach |
| --- | --- | --- |
| `anti-slop/no-reduce-accumulator-copy` | Copying a reducer accumulator with `Object.assign({}, acc, ...)`, `Array.from(acc)` or known-array copy methods. | Update a fresh, locally owned accumulator, or choose a suitable pipeline. |
| `oxc/no-accumulating-spread` | Rebuilding a growing accumulator with spread on each iteration. | The built-in companion to the non-spread copy rule. |
| `anti-slop-effect/no-manual-effect-error-tag` | Literal `_tag` equality checks and switches in inline `Effect.catch`, `catchAll` or `catchIf` callbacks. | Selective `catchTag`/`catchTags` or `catchReason`/`catchReasons` recovery. |
| `anti-slop-effect/no-manual-tag-comparison` | Literal `_tag` equality checks and switches elsewhere. | `Match` for branching or `Predicate.isTagged` for predicates. |

For example, replace repeated `acc.concat(item)` in a reducer with a fresh
accumulator that appends items. Mutating an accumulator is appropriate only when
it is locally owned; do not mutate shared caller data to satisfy the lint rule.
Use `Effect.catchTag("Missing", recover)` for selective recovery and
`Predicate.isTagged("Ready")(value)` for a simple tag check.

The Effect rules divide responsibility so a comparison gets one diagnostic.
Nested functions own their comparisons separately. Broad handlers that do not
branch on tags remain permitted. No automatic rewrite is offered: choosing a
replacement requires understanding ownership, recovery and matching behavior.

These are syntax checks, not type-checker guarantees. Reducer detection follows
inline `reduce`/`reduceRight` callbacks, lexical bindings and constant aliases;
array copy methods need local array evidence. Named reducer callbacks, mutable
aliases and unknown accumulator types can be missed. Effect handler detection
recognizes the literal `Effect` identifier and direct method calls; renamed
imports, extracted callbacks and wrapped callback arguments are not resolved.
It does not prove that `Effect` is the library import or that a compared value
is the caught error. Tag checks use string literals and direct member access;
destructured tags and more indirect comparisons are outside this policy.

`bun run test:lint-rules` includes real CLI fixtures for rejected patterns,
valid alternatives, shadowing and diagnostic ownership. Turbo's lint inputs
include the root configuration and plugin sources so rule changes invalidate
cached workspace lint results. See [UPSTREAM.md](./UPSTREAM.md) for provenance.

## Minimum function body lines

`anti-slop/min-function-body-lines` is an error in the root Oxlint configuration.
It requires **at least three code-bearing body lines**, not a maximum function
length. Its purpose is to prompt review of tiny extracted wrappers, not to make
good short functions longer.

### What counts

The rule counts distinct body lines on which a non-punctuation token starts.
The function name, parameters, return type, braces, blank lines, comments and
punctuation-only continuation lines do not count. A multiline string or template
token counts only on its starting line. Three statements on one line count as
one line; this is a source-line heuristic, not a statement-count or complexity
rule. It cannot prove whether code is meaningful or AI-generated, and expression
wrapping can still affect the count. Do not add filler or reformat solely to pass.

Named declarations, assigned function expressions/arrows, ordinary object/class
methods and class arrow fields are checked, including async and generator forms.
Nested helpers are checked independently.

```ts
// Fails: one body line, even when braces occupy separate lines.
const getName = (person: Person) => person.name;

// Prefer using person.name at the call site instead of introducing a wrapper.
// Three genuine code-bearing body lines pass:
function savePerson(person: Person) {
  const normalized = normalizePerson(person);
  repository.save(normalized);
  return normalized;
}
```

### Deliberate exceptions

- Inline call/new arguments, including Effect generator callbacks.
- JSX attribute callbacks and direct callback properties/methods in an object
  literal passed to a call/new expression (for example, a `Layer.succeed` service
  implementation). An independently assigned object is not automatically exempt.
- Functions that directly return JSX elements/fragments (including conditional,
  logical and TypeScript-wrapped returns), allowing small React
  components and provider composition.
- Constructors, getters/setters and explicitly marked TypeScript `override`
  methods/fields. Type-only declarations have no implementation to check.

These are syntax-based exceptions, not an attempt to infer every framework's
contract. For a legitimate small public API, framework boundary or reusable pure
helper outside these cases, retain the short implementation with a narrow,
reasoned suppression:

```ts
// oxlint-disable-next-line anti-slop/min-function-body-lines -- External API requires this named callback.
function requiredCallback() { return currentValue; }
```

There is no autofix: inlining or removing a function can change semantics and
requires human review. The threshold is deliberately fixed at three for this
template; change policy explicitly rather than adding padding.

### Verification

`bun run test:lint-rules` runs Node's built-in test runner and the installed Oxlint
CLI against temporary TypeScript/TSX fixtures using the real plugin. The suite
covers the boundary, padding, declaration/expression/method forms, callbacks,
React/TypeScript exceptions, nested functions and narrow suppressions. It adds no
test dependency and is included before workspace tests in `bun run test`.

The repository still leaves CI setup to applications using the template. Enabling
the rule in local lint does not itself establish a required CI check.
