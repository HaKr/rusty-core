import { it } from "mocha";
import assert from "assert";

import { None, type Option, Some } from "../src/option/api";
import { Err, Ok, type Result } from "../src/result/api";

it("result predicates", () => {
  assert(Ok(42).isOk());
  assert(!Ok(42).isErr());
  assert(!Err(42).isOk());
  assert(Err(42).isErr());
});

it("result andThen", () => {
  function checkedMultiply(x: number, y: number): Option<number> {
    return (y < 1_000_000) ? Some(x * y) : None();
  }
  function sqThenToString(x: number): Result<string, string> {
    return checkedMultiply(x, x).map((sq) => `${sq}`).okOr("overflowed");
  }

  assert.deepStrictEqual(Ok(2).andThen(sqThenToString), Ok("4"));
  assert.deepStrictEqual(
    Ok(1_000_000).andThen(sqThenToString),
    Err("overflowed"),
  );
  assert.deepStrictEqual(
    Err<number, string>("not a number").andThen(sqThenToString),
    Err<string, string>("not a number"),
  );
});

it("result promises", async () => {
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
});
