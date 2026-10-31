# Minimum function body lines

`anti-slop/min-function-body-lines` is an error in the root Oxlint configuration.
It requires **at least three code-bearing body lines**, not a maximum function
length. Its purpose is to prompt review of tiny extracted wrappers, not to make
good short functions longer.

## What counts

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

## Deliberate exceptions

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

## Verification

`bun run test:lint-rules` runs Node's built-in test runner and the installed Oxlint
CLI against temporary TypeScript/TSX fixtures using the real plugin. The suite
covers the boundary, padding, declaration/expression/method forms, callbacks,
React/TypeScript exceptions, nested functions and narrow suppressions. It adds no
test dependency and is included before workspace tests in `bun run test`.

The repository still leaves CI setup to applications using the template. Enabling
the rule in local lint does not itself establish a required CI check.
