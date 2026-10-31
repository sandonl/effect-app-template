import { defineRule } from "@oxlint/plugins";
import type { ESTree, SourceCode } from "@oxlint/plugins";

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;

/** Keep parentheses and TypeScript wrappers from changing callback classification. */
function unwrapParent(node: ESTree.Node): ESTree.Node {
  let current = node;
  while (
    current.parent?.type === "ParenthesizedExpression" ||
    current.parent?.type === "TSAsExpression" ||
    current.parent?.type === "TSSatisfiesExpression" ||
    current.parent?.type === "TSNonNullExpression"
  ) {
    current = current.parent;
  }
  return current;
}

function isInlineCallback(node: FunctionNode): boolean {
  const current = unwrapParent(node);
  const parent = current.parent;
  if (parent === null) return false;
  if (parent.type === "CallExpression" || parent.type === "NewExpression") {
    return parent.arguments.some((argument) => argument === current);
  }
  if (parent.type === "JSXExpressionContainer") {
    return parent.parent?.type === "JSXAttribute";
  }
  // Callback properties in an inline API options object (e.g. Layer.succeed).
  if (parent.type !== "Property" || parent.value !== current) return false;
  if (parent.parent?.type !== "ObjectExpression") return false;
  const object = unwrapParent(parent.parent);
  const call = object.parent;
  return (
    (call?.type === "CallExpression" || call?.type === "NewExpression") &&
    call.arguments.some((argument) => argument === object)
  );
}

function isContractMethod(node: FunctionNode): boolean {
  const parent = unwrapParent(node).parent;
  if (parent === null) return false;
  if (parent.type === "MethodDefinition") {
    return parent.kind !== "method" || parent.override === true;
  }
  if (parent.type === "Property") return parent.kind !== "init";
  return parent.type === "PropertyDefinition" && parent.override === true;
}

function containsReturnedJsx(expression: ESTree.Expression | null): boolean {
  if (expression === null) return false;
  if (expression.type === "JSXElement" || expression.type === "JSXFragment") return true;
  if (
    expression.type === "ParenthesizedExpression" ||
    expression.type === "TSAsExpression" ||
    expression.type === "TSSatisfiesExpression" ||
    expression.type === "TSNonNullExpression"
  ) return containsReturnedJsx(expression.expression);
  if (expression.type === "ConditionalExpression") {
    return containsReturnedJsx(expression.consequent) || containsReturnedJsx(expression.alternate);
  }
  if (expression.type === "LogicalExpression") {
    return containsReturnedJsx(expression.left) || containsReturnedJsx(expression.right);
  }
  return false;
}

function returnsJsx(node: FunctionNode): boolean {
  const body = node.body;
  if (body === null) return false;
  if (body.type !== "BlockStatement") return containsReturnedJsx(body);
  return body.body.some(
    (statement) => statement.type === "ReturnStatement" && containsReturnedJsx(statement.argument),
  );
}

function bodyCodeLines(sourceCode: SourceCode, body: ESTree.Node): number {
  const lines = new Set<number>();
  // Tokens exclude comments. Count token starts, not multiline literal contents.
  // Punctuation-only lines (including the function's braces) add no substance.
  for (const token of sourceCode.getTokens(body)) {
    if (token.type !== "Punctuator" && token.type !== "JSXText") {
      lines.add(token.loc.start.line);
    }
  }
  return lines.size;
}

/** Discourage tiny extracted wrappers; never pad a function to satisfy this rule. */
export const minFunctionBodyLinesRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require at least three code-bearing body lines in standalone functions and ordinary methods.",
    },
    schema: [],
    messages: {
      tooShort:
        "This function has {{lines}} code-bearing body line(s); the minimum is 3. Inline a trivial wrapper or use the existing function directly. If the boundary is intentional, document a narrow lint suppression; do not add filler.",
    },
  },
  createOnce(context) {
    const checkFunction = (node: FunctionNode) => {
      if (
        node.body === null ||
        isInlineCallback(node) ||
        isContractMethod(node) ||
        returnsJsx(node)
      ) return;
      const lines = bodyCodeLines(context.sourceCode, node.body);
      if (lines < 3) {
        context.report({ node, messageId: "tooShort", data: { lines } });
      }
    };
    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
});
