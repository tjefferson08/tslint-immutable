/**
 * This file has code that is shared for all the readonly rules.
 * It supports the options for ignore-local and ignore-prefix which all readonly rules have.
 * The rules ony need to provide a checker function.
 */

import * as ts from "typescript";
import * as Lint from "tslint";

export interface CheckNodeFunction<TOptions> {
  (node: ts.Node, ctx: Lint.WalkContext<TOptions>): CheckNodeResult;
}

export interface InvalidNode {
  readonly node: ts.Node;
  readonly replacement: Lint.Replacement | undefined;
}

export function createInvalidNode(
  node: ts.Node,
  replacement?: Lint.Replacement
): InvalidNode {
  return { node, replacement };
}

export interface CheckNodeResult {
  invalidNodes: ReadonlyArray<InvalidNode>;
  skipBranch?: boolean;
}

export function walk<TOptions>(
  ctx: Lint.WalkContext<TOptions>,
  checkNode: CheckNodeFunction<TOptions>,
  failureString: string
): void {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    // Check the node
    const { invalidNodes, skipBranch } = checkNode(node, ctx);
    reportInvalidNodes(invalidNodes, ctx, failureString);
    if (skipBranch) {
      return;
    }
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

export function reportInvalidNodes<TOptions>(
  invalidNodes: ReadonlyArray<InvalidNode>,
  ctx: Lint.WalkContext<TOptions>,
  failureString: string
): void {
  invalidNodes.forEach(invalidNode =>
    ctx.addFailureAtNode(
      invalidNode.node,
      failureString,
      invalidNode.replacement
    )
  );
}
