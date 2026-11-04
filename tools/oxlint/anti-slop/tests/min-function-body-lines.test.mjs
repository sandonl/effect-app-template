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
const plugin = fileURLToPath(new URL("../index.ts", import.meta.url));
const directory = mkdtempSync(join(tmpdir(), "min-function-body-lines-"));
const configPath = join(directory, "oxlint.json");
writeFileSync(configPath, JSON.stringify({
  jsPlugins: [{ name: "anti-slop", specifier: plugin }],
  rules: {
    "no-unused-vars": "off",
    "anti-slop/min-function-body-lines": "error",
  },
}));
after(() => rmSync(directory, { recursive: true, force: true }));

const cases = [
  ["one-line declaration", "function tiny() { return 1; }", 1],
  ["empty function", "function empty() {}", 1],
  ["two body lines", "function tiny() {\n const value = 1;\n return value;\n}", 1],
  ["three body lines", "function enough() {\n const value = read();\n save(value);\n return value;\n}", 0],
  ["blank padding", "function tiny() {\n\n const value = 1;\n\n return value;\n\n}", 1],
  ["comment padding", "function tiny() {\n // first\n /* second\n third */\n return 1;\n}", 1],
  ["brace padding", "function tiny() {\n {\n {\n return 1;\n }\n }\n}", 1],
  ["punctuation padding", "function tiny() {\n return (\n  1\n );\n}", 1],
  ["multiline literal padding", "const tiny = () => `one\ntwo\nthree\nfour`;", 1],
  ["function signature excluded", "function tiny(\n first: number,\n second: number,\n third: number\n): number { return first; }", 1],
  ["multiple statements on one line", "function tiny() { read(); save(); return 1; }", 1],
  ["expression arrow", "const tiny = () => read();", 1],
  ["block arrow", "const tiny = () => { return read(); };", 1],
  ["function expression", "const tiny = function named() { return read(); };", 1],
  ["anonymous default export", "export default function () { return 1; }", 1],
  ["async function", "async function tiny() { return await read(); }", 1],
  ["generator function", "function* tiny() { yield 1; }", 1],
  ["TS generic function", "function tiny<T>(value: T): T { return value; }", 1],
  ["type-only declaration", "declare function supplied(): number;", 0],
  ["overload implementation", "function tiny(value: string): string;\nfunction tiny(value: string) { return value; }", 1],
  ["class method", "class Example { tiny() { return 1; } }", 1],
  ["class arrow field", "class Example { tiny = () => 1; }", 1],
  ["private class method", "class Example { #tiny() { return 1; } }", 1],
  ["object method", "const example = { tiny() { return 1; } };", 1],
  ["object arrow property", "const example = { tiny: () => 1 };", 1],
  ["returned function", "const factory = () => () => 1;", 2],
  ["IIFE is not a callback", "(() => 1)();", 1],
  ["direct callback", "items.map((item) => item.id);", 0],
  ["named callback", "items.map(function pick(item) { return item.id; });", 0],
  ["generator callback", "Effect.gen(function* () { return yield* read(); });", 0],
  ["constructor callback", "new Promise((resolve) => resolve(1));", 0],
  ["typed callback wrapper", "items.map(((item) => item.id) satisfies Picker);", 0],
  ["asserted callback wrapper", "items.map(((item) => item.id) as Picker);", 0],
  ["inline callback options", "Layer.succeed(Service, { read: () => value });", 0],
  ["inline options method", "register({ read() { return value; } });", 0],
  ["typed inline options", "register({ read: () => value } satisfies Options);", 0],
  ["constructor", "class Example { constructor(readonly value: number) {} }", 0],
  ["class accessors", "class Example { get value() { return 1; } set value(next) { save(next); } }", 0],
  ["object accessors", "const example = { get value() { return 1; } };", 0],
  ["explicit override", "class Example extends Base { override read() { return 1; } }", 0],
  ["explicit override field", "class Example extends Base { override read = () => 1; }", 0],
  ["JSX-returning function", "function View() { return <div />; }", 0],
  ["JSX fragment arrow", "const View = () => <>hello</>;", 0],
  ["conditional JSX", "const View = () => ok ? <A /> : <B />;", 0],
  ["logical JSX", "const View = () => ready && <A />;", 0],
  ["typed JSX", "const View = () => (<A /> satisfies React.ReactNode);", 0],
  ["wrapped override field", "class Example extends Base { override read = (() => 1) satisfies Handler; }", 0],
  ["nested JSX does not exempt helper", "function tiny() { return () => <A />; }", 1],
  ["JSX event callback", "const element = <button onClick={() => save()} />;", 0],
  ["nested helper still checked", "items.map(() => { function tiny() { return 1; } return tiny(); });", 1],
  ["reasoned narrow suppression", "// oxlint-disable-next-line anti-slop/min-function-body-lines -- Required external callback boundary.\nfunction boundary() { return read(); }", 0],
  ["multiple functions do not share counts", "function enough() {\n read();\n save();\n return 1;\n}\nfunction tiny() { return 1; }", 1],
];

for (const [index, [name, code, expected]] of cases.entries()) {
  test(name, () => {
    const file = join(directory, `case-${index}.tsx`);
    writeFileSync(file, code);
    const result = spawnSync(process.execPath, [binary, "-c", configPath, "--format", "json", file], {
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: "--experimental-strip-types" },
    });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    const output = JSON.parse(result.stdout);
    const diagnostics = output.diagnostics.filter(
      (diagnostic) => diagnostic.code === "anti-slop(min-function-body-lines)",
    );
    assert.equal(diagnostics.length, expected, result.stdout + result.stderr);
    assert.equal(output.diagnostics.filter((diagnostic) => diagnostic.severity === "error").length,
      expected, result.stdout + result.stderr);
    assert.equal(result.status, expected > 0 ? 1 : 0, result.stdout + result.stderr);
  });
}
