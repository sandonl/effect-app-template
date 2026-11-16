# Meaningful tests

Before adding a test, identify the behavior it proves and a realistic mistake
that would make it fail. Assert an output, error, or end state produced by the
code under test.

During review, ask: **Would this test still pass if the behavior named in its
title were broken or removed?** Rewrite or remove tests that would.

Check for tests that only confirm their own fixtures, a fake's configured
response, or facts already guaranteed by the type system. When assertions run
inside a loop, assert that the expected results exist so an empty collection
cannot silently skip every check.

Dependency fakes are useful when the assertions observe the real behavior that
uses them. Prefer a few focused tests tied to outcomes.

Adapted from the [`test-cannot-fail` review question](https://github.com/K-Mistele/anti-slop/blob/b7c1619b4d51b4815e89ba3700a975a6ec54b8c3/src/jev/effect-rules.ts).
This is agent review guidance; it makes no model requests.
