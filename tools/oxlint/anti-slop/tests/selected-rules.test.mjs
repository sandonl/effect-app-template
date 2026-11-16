import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("oxlint/package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const binary = resolve(dirname(packagePath), packageJson.bin.oxlint);
const repositoryUrl = new URL("../../../../", import.meta.url);
const repositoryConfig = JSON.parse(readFileSync(new URL(".oxlintrc.json", repositoryUrl), "utf8"));
const directory = mkdtempSync(join(tmpdir(), "anti-slop-selected-rules-"));
const configPath = join(directory, "oxlint.json");

const ternaryRule = "anti-slop/max-ternary-depth";
const disableRule = "anti-slop/no-disabled-type-assertion-rules";
const reprovideRule = "anti-slop/no-reprovide-ambient-service";
const orDieRule = "anti-slop-effect/no-ordie-in-service-construction";
const causeRule = "anti-slop-effect/require-cause-when-narrowing";
const globalRule = "anti-slop-martinfowler/global-data";
const mutableRule = "anti-slop-martinfowler/mutable-data";
const nameRule = "anti-slop-martinfowler/mysterious-name";
const selectedRules = [ternaryRule, disableRule, reprovideRule, orDieRule, causeRule, globalRule, mutableRule, nameRule];

// Read registration, options, and severity from the real config: these fixtures must fail
// if adoption stops enforcing a rejected pattern or turns a design warning into an error.
writeFileSync(configPath, JSON.stringify({
  jsPlugins: repositoryConfig.jsPlugins.map(plugin => ({
    ...plugin,
    specifier: fileURLToPath(new URL(plugin.specifier, repositoryUrl)),
  })),
  rules: {
    "no-unused-vars": "off",
    ...Object.fromEntries(selectedRules.map(name => [name, repositoryConfig.rules[name]])),
  },
}));
after(() => rmSync(directory, { recursive: true, force: true }));

function diagnostic(rule, severity = "error") {
  const separator = rule.indexOf("/");
  return { code: `${rule.slice(0, separator)}(${rule.slice(separator + 1)})`, severity };
}

function lint(files) {
  const result = spawnSync(process.execPath, [binary, "-c", configPath, "--threads", "1", "--format", "json", ...files], {
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: "--experimental-strip-types" },
  });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.ok(result.stdout.startsWith("{"), result.stdout + result.stderr);
  return { result, output: JSON.parse(result.stdout) };
}

const cases = [
  {
    name: "reject ternaries beyond the configured depth",
    source: "const label = a ? 'a' : b ? 'b' : c ? 'c' : 'd';",
    expected: [diagnostic(ternaryRule)],
  },
  {
    name: "allow a ternary chain at the configured limit",
    source: "const label = a ? 'a' : b ? 'b' : 'c';",
    expected: [],
  },
  {
    name: "reject inline bypasses of assertion safeguards",
    source: "// oxlint-disable-next-line anti-slop/no-chained-type-assertions -- Bypass the safeguard.\nconst value = input;",
    expected: [diagnostic(disableRule)],
  },
  {
    name: "reject blanket next-line disable comments",
    source: "// oxlint-disable-next-line\nconst value = input;",
    expected: [diagnostic(disableRule)],
  },
  {
    name: "allow documented casts and narrow unrelated disables",
    source: "// SAFETY: the caller validated this identifier.\nconst identifier = input as UserId;\n// oxlint-disable-next-line anti-slop/min-function-body-lines -- Framework callback.\nfunction readValue() { return identifier; }",
    expected: [],
  },
  {
    name: "reject re-providing a yielded dependency through an import alias",
    source: "import { Effect as Fx } from 'effect';\nFx.gen(function* () { const store = yield* Store; return yield* Fx.provideService(operation, Store, store); });",
    expected: [diagnostic(reprovideRule)],
  },
  {
    name: "allow a dynamically constructed dependency",
    source: "import * as Effect from 'effect/Effect';\nEffect.gen(function* () { const store = makeTenantStore(tenant); return yield* Effect.provideService(operation, Store, store); });",
    expected: [],
  },
  {
    name: "reject hiding service construction errors as defects",
    source: "import { Effect, Layer } from 'effect';\nconst live = Layer.effect(Store, Effect.gen(function* () { return yield* connect.pipe(Effect.orDie); }));",
    expected: [diagnostic(orDieRule)],
  },
  {
    name: "reject Layer.orDie with aliased imports",
    source: "import { Layer as L } from 'effect';\nconst live = L.orDie(layer);",
    expected: [diagnostic(orDieRule)],
  },
  {
    name: "allow typed startup failures and operation-local orDie",
    source: "import { Effect, Layer } from 'effect';\nconst live = Layer.effect(Store, Effect.gen(function* () { const connection = yield* connect; return { read: Effect.fn('Store.read')(function* () { return yield* read(connection).pipe(Effect.orDie); }) }; }));",
    expected: [],
  },
  {
    name: "allow test-only layer construction shortcuts",
    filename: "startup.test.ts",
    source: "import { Layer } from 'effect';\nconst live = Layer.orDie(layer);",
    expected: [],
  },
  {
    name: "reject replacing an error without retaining its cause",
    source: "import { Effect as Fx } from 'effect';\nconst parsed = request.pipe(Fx.mapError(() => new RequestError({ message: 'Failed' })));",
    expected: [diagnostic(causeRule)],
  },
  {
    name: "reject error loss in a broad catch handler",
    source: "import { Effect } from 'effect';\nconst parsed = request.pipe(Effect.catchAll(() => Effect.fail(RequestError.make({ message: 'Failed' }))));",
    expected: [diagnostic(causeRule)],
  },
  {
    name: "allow an error retained as cause",
    source: "import { Effect } from 'effect';\nconst parsed = request.pipe(Effect.mapError(cause => new RequestError({ message: 'Failed', cause })));",
    expected: [],
  },
  {
    name: "allow an error captured before replacement",
    source: "import { Effect } from 'effect';\nconst parsed = request.pipe(Effect.tapError(Effect.logError), Effect.mapError(() => new RequestError({ message: 'Failed' })));",
    expected: [],
  },
  {
    name: "allow domain recovery that succeeds instead of constructing an error",
    source: "import { Effect } from 'effect';\nconst parsed = request.pipe(Effect.catchAll(() => Effect.succeed(defaultValue)));",
    expected: [],
  },
  {
    name: "warn about exported mutable containers",
    source: "export const sessions = new Map();\nexport function registerSession(id, session) { sessions.set(id, session); }",
    expected: [diagnostic(globalRule, "warning")],
  },
  {
    name: "warn about exported reassignable state",
    source: "export let revision = 0;\nexport function advanceRevision() { revision++; }",
    expected: [diagnostic(globalRule, "warning")],
  },
  {
    name: "warn about private module state changed by a function",
    source: "let revision = 0;\nexport function advanceRevision() { revision++; return revision; }",
    expected: [diagnostic(mutableRule, "warning")],
  },
  {
    name: "allow constant exports and locally owned mutation",
    source: "export const settings = { mode: 'live' };\nexport function countItems(items) { let count = 0; for (const item of items) { count += item.count; } return count; }",
    expected: [],
  },
  {
    name: "warn about vague top-level function names",
    source: "export function processData(input) { return input.trim(); }",
    expected: [diagnostic(nameRule, "warning")],
  },
  {
    name: "warn about unnecessary same-file function aliases",
    source: "function refreshSession(input) { return input.trim(); }\nconst executeMutation = refreshSession;",
    expected: [diagnostic(nameRule, "warning")],
  },
  {
    name: "allow domain names and required constructor names",
    source: "export function normalizeEmail(input) { return input.trim(); }\nexport function make(input) { return input; }",
    expected: [],
  },
  {
    name: "skip test setup in design warnings",
    filename: "design.test.ts",
    source: "export let revision = 0;\nlet count = 0;\nfunction processData() { count++; revision++; }",
    expected: [],
  },
];

for (const [index, { name, source, expected, filename = `case-${index}.ts` }] of cases.entries()) {
  test(name, () => {
    const file = join(directory, filename);
    writeFileSync(file, source);
    const { result, output } = lint([file]);
    assert.deepEqual(output.diagnostics.map(({ code, severity }) => ({ code, severity })), expected,
      result.stdout + result.stderr);
    assert.equal(result.status, expected.some(item => item.severity === "error") ? 1 : 0,
      result.stdout + result.stderr);
  });
}

test("Effect imports do not leak into the next file in the same lint process", () => {
  const firstFile = join(directory, "first-import.ts");
  const secondFile = join(directory, "second-import.ts");
  const reprovide = namespace => `${namespace}.gen(function* () { const store = yield* Store; return yield* ${namespace}.provideService(operation, Store, store); });`;
  // Whichever file runs first, its import must not make the other's custom runtime an Effect module.
  writeFileSync(firstFile, `import { Effect } from 'effect';\nconst Fx = customRuntime;\n${reprovide("Effect")}\n${reprovide("Fx")}`);
  writeFileSync(secondFile, `import { Effect as Fx } from 'effect';\nconst Effect = customRuntime;\n${reprovide("Fx")}\n${reprovide("Effect")}`);
  const { result, output } = lint([firstFile, secondFile]);
  assert.deepEqual(output.diagnostics.map(({ code, filename }) => ({ code, filename })).sort((left, right) => left.filename.localeCompare(right.filename)), [
    { code: diagnostic(reprovideRule).code, filename: firstFile },
    { code: diagnostic(reprovideRule).code, filename: secondFile },
  ], result.stdout + result.stderr);
  assert.equal(result.status, 1, result.stdout + result.stderr);
});
