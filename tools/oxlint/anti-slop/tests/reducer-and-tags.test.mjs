import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("oxlint/package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const binary = resolve(dirname(packagePath), packageJson.bin.oxlint);
const directory = mkdtempSync(join(tmpdir(), "anti-slop-reducer-and-tags-"));
const configPath = join(directory, "oxlint.json");
const reducerCode = "anti-slop(no-reduce-accumulator-copy)";
const spreadCode = "oxc(no-accumulating-spread)";
const errorTagCode = "anti-slop-effect(no-manual-effect-error-tag)";
const comparisonCode = "anti-slop-effect(no-manual-tag-comparison)";
writeFileSync(configPath, JSON.stringify({
  plugins: ["oxc"],
  jsPlugins: [
    { name: "anti-slop", specifier: fileURLToPath(new URL("../index.ts", import.meta.url)) },
    { name: "anti-slop-effect", specifier: fileURLToPath(new URL("../effect/index.ts", import.meta.url)) },
  ],
  rules: {
    "no-unused-vars": "off",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "oxc/no-accumulating-spread": "error",
    "anti-slop-effect/no-manual-effect-error-tag": "error",
    "anti-slop-effect/no-manual-tag-comparison": "error",
  },
}));
after(() => rmSync(directory, { recursive: true, force: true }));

// Real CLI fixtures prove the offending pattern is rejected and the useful alternative passes.
// Exact diagnostic codes also catch lost plugin registration and duplicate Effect findings.
const cases = [
  ["reject object accumulator copies", "items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});", [reducerCode]],
  ["follow constant accumulator aliases", "items.reduce((acc, item) => { const previous = acc; return Array.from(previous); }, []);", [reducerCode]],
  ["reject array copy methods in reduceRight", "items.reduceRight((acc, item) => acc.concat(item), []);", [reducerCode]],
  ["recognize computed copy methods", "items.reduce((acc, item) => acc['slice'](), []);", [reducerCode]],
  ["native rule rejects accumulator spread", "items.reduce((acc, item) => [...acc, item], []);", [spreadCode]],
  ["allow mutation of a fresh accumulator", "items.reduce((acc, item) => { acc.push(item); return acc; }, []);", []],
  ["allow assignment into the accumulator", "items.reduce((acc, item) => Object.assign(acc, { [item.id]: item }), {});", []],
  ["allow copies unrelated to the accumulator", "items.reduce((acc, item) => { const copy = Array.from(item); acc.push(copy); return acc; }, []);", []],
  ["respect a shadowed Array binding", "items.reduce((acc, item) => { const Array = factory; return Array.from(acc); }, []);", []],
  ["do not assume an unknown accumulator is an array", "items.reduce((acc, item) => acc.concat(item), initial);", []],
  ["ignore copies owned by nested callbacks", "items.reduce((acc, item) => { visit((acc) => Array.from(acc)); return acc; }, []);", []],
  ["catch handler gets one specific error diagnostic", "Effect.catch(program, error => error._tag === 'Missing' ? fallback : Effect.fail(error));", [errorTagCode]],
  ["recognize piped catchAll", "program.pipe(Effect.catchAll(error => 'Missing' !== error['_tag'] ? Effect.fail(error) : fallback));", [errorTagCode]],
  ["recognize catchIf predicates", "Effect.catchIf(error => error._tag === 'Missing', () => fallback);", [errorTagCode]],
  ["recognize switches on nested reasons", "Effect.catch(program, error => { switch (error.reason._tag) { case 'Missing': return fallback; default: return Effect.fail(error); } });", [errorTagCode]],
  ["general tag equality gets one comparison diagnostic", "const missing = value._tag === 'Missing';", [comparisonCode]],
  ["general tag switch is rejected", "switch (value['_tag']) { case 'Ready': consume(value); break; }", [comparisonCode]],
  ["nested functions keep general comparison ownership", "Effect.catch(program, error => { function isReady(value) { return value._tag === 'Ready'; } return recover(error, isReady); });", [comparisonCode]],
  ["allow selective Effect recovery", "program.pipe(Effect.catchTag('Missing', () => fallback), Effect.catchReason('Failure', 'Unavailable', () => fallback));", []],
  ["allow Match and Predicate helpers", "const ready = Predicate.isTagged('Ready')(value); Match.value(value).pipe(Match.tag('Ready', consume), Match.orElse(ignore));", []],
  ["allow ordinary properties and nonliteral comparisons", "const same = value.kind === 'Ready'; const matching = left._tag === right._tag;", []],
  ["allow reasoned narrow suppression", "// oxlint-disable-next-line anti-slop-effect/no-manual-tag-comparison -- External predicate contract requires this shape.\nconst ready = value._tag === 'Ready';", []],
];

for (const [index, [name, code, expectedCodes]] of cases.entries()) {
  test(name, () => {
    const file = join(directory, `case-${index}.ts`);
    writeFileSync(file, code);
    const result = spawnSync(process.execPath, [binary, "-c", configPath, "--format", "json", file], {
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: "--experimental-strip-types" },
    });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.diagnostics.map(diagnostic => diagnostic.code).sort(),
      [...expectedCodes].sort(), result.stdout + result.stderr);
    assert.equal(result.status, expectedCodes.length > 0 ? 1 : 0, result.stdout + result.stderr);
    if (name === "recognize switches on nested reasons") {
      assert.match(output.diagnostics[0].message, /catchReason/);
    }
  });
}
