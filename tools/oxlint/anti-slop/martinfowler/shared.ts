import type { Context, ESTree, Options, Scope, SourceCode, Variable } from "@oxlint/plugins";

type JsonValue = Options[number];
type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;

type WrapperNode =
	| ESTree.ParenthesizedExpression
	| ESTree.TSAsExpression
	| ESTree.TSSatisfiesExpression
	| ESTree.TSTypeAssertion
	| ESTree.TSNonNullExpression
	| ESTree.ChainExpression;

export type { FunctionNode };

function optionValue(options: Readonly<Options> | undefined, key: string): JsonValue | undefined {
	const first = options?.[0];
	if (typeof first !== "object" || first === null || Array.isArray(first)) return undefined;
	return first[key];
}

export function booleanOption(
	options: Readonly<Options> | undefined,
	key: string,
	fallback: boolean,
): boolean {
	const value = optionValue(options, key);
	return typeof value === "boolean" ? value : fallback;
}

export function stringListOption(
	options: Readonly<Options> | undefined,
	key: string,
	fallback: ReadonlyArray<string>,
): ReadonlyArray<string> {
	const value = optionValue(options, key);
	if (!Array.isArray(value)) return fallback;
	return value.filter((item): item is string => typeof item === "string");
}

const testFilePattern =
	/(?:^|[\\/])(?:__tests__|__mocks__|test|tests)[\\/]|\.(?:test|spec)\.[cm]?[jt]sx?$/;

export function isTestFile(filename: string): boolean {
	return testFilePattern.test(filename);
}

/** Test files follow different size and setup conventions, so rules skip them unless `ignoreTests: false`. */
export function isIgnoredTestFile(context: Context): boolean {
	return booleanOption(context.options, "ignoreTests", true) && isTestFile(context.filename);
}

export function isFunctionNode(node: ESTree.Node): node is FunctionNode {
	return (
		node.type === "FunctionDeclaration" ||
		node.type === "FunctionExpression" ||
		node.type === "ArrowFunctionExpression"
	);
}

/** Strip parentheses, TypeScript-only wrappers, and optional-chain wrappers. */
export function unwrap(node: ESTree.Expression): ESTree.Expression {
	let current = node;
	while (
		current.type === "ParenthesizedExpression" ||
		current.type === "TSAsExpression" ||
		current.type === "TSSatisfiesExpression" ||
		current.type === "TSTypeAssertion" ||
		current.type === "TSNonNullExpression" ||
		current.type === "ChainExpression"
	) {
		current = current.expression;
	}
	return current;
}

export function isWrapper(node: ESTree.Node | null): node is WrapperNode {
	return (
		node !== null &&
		(node.type === "ParenthesizedExpression" ||
			node.type === "TSAsExpression" ||
			node.type === "TSSatisfiesExpression" ||
			node.type === "TSTypeAssertion" ||
			node.type === "TSNonNullExpression" ||
			node.type === "ChainExpression")
	);
}

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export function resolveVariable(
	sourceCode: SourceCode,
	identifier: ESTree.Node & { readonly name: string },
): Variable | null {
	let scope: Scope | null = sourceCode.getScope(identifier);
	while (scope !== null) {
		const variable = scope.set.get(identifier.name);
		if (variable !== undefined) return variable;
		scope = scope.upper;
	}
	return null;
}
