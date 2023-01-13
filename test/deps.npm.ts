import nodeAssert from "assert/strict";

export function assertEquals<T>(
  actual: unknown,
  expected: T,
  message?: string | Error,
): asserts actual is T {
  return nodeAssert.deepStrictEqual(actual, expected, message);
}

export const assertNotEquals = nodeAssert.notDeepStrictEqual;

export const testCase = it;

export function assert(predicate: boolean, msg?: string) {
  if (!predicate) nodeAssert.fail(msg);
}
