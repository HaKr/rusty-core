import { it } from "mocha";
import assert from "assert";

import { None, type Option, Some } from "../src/option/api";
import { Err, Ok, type Result, resultFrom } from "../src/result/api";

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

it("result mapOrElse is different", async () => {
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .mapOrElse(() => Err<string, string>("nope"), (nr) => Ok(`[${nr}]`)),
    Ok("[42]"),
  );
});

it("result promise chaining", async () => {
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(async (n) => await resultFrom(Promise.resolve(Ok(n * 4 - 6))))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
  function modify(n: number) {
    return resultFrom(Promise.resolve(Ok(n + 1)));
  }
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(modify)
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[13]"),
  );
});

it("for o of Result", () => {
  let n = 0;
  for (const opt of Err<number, string>("nope")) {
    n += opt;
  }
  assert.deepStrictEqual(n, 0);
  for (const opt of Ok(15)) {
    n += opt;
  }
  assert.deepStrictEqual(n, 15);
});
