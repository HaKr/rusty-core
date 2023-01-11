import { assert, assertEquals, testCase } from "./deps.ts";

import { Err, None, Ok, Option, type Result, Some } from "../src/index.ts";

testCase("result predicates", () => {
  assert(Ok(42).isOk());
  assert(!Ok(42).isErr());
  assert(!Err(42).isOk());
  assert(Err(42).isErr());
});

testCase("result andThen", () => {
  function checkedMultiply(x: number, y: number): Option<number> {
    return (y < 1_000_000) ? Some(x * y) : None();
  }
  function sqThenToString(x: number): Result<string, string> {
    return checkedMultiply(x, x).map((sq) => `${sq}`).okOr("overflowed");
  }

  assertEquals(Ok(2).andThen(sqThenToString), Ok("4"));
  assertEquals(Ok(1_000_000).andThen(sqThenToString), Err("overflowed"));
  assertEquals(
    Err<number, string>("not a number").andThen(sqThenToString),
    Err<string, string>("not a number"),
  );
});

testCase("result promises", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
});

testCase("result promise chaining", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Ok(Promise.resolve(Ok(n * 4 - 6))))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
  function modify(n: number) {
    return Ok(Promise.resolve(Ok(n + 1)));
  }
  assertEquals(
    await Ok(12)
      .andThen(modify)
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[13]"),
  );
});

testCase("result mapOrElse is different", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .mapResult(() => Err<string, string>("nope"), (nr) => Ok(`[${nr}]`)),
    Ok("[42]"),
  );
});

testCase("for o of Result", () => {
  let n = 0;
  for (const opt of Err<number, string>("nope")) {
    n += opt;
  }
  assertEquals(n, 0);
  for (const opt of Ok(15)) {
    n += opt;
  }
  assertEquals(n, 15);
});

testCase("result mapErr", () => {
  assertEquals(Err(41).mapErr((err) => `${err + 2}`), Err("43"));
  assertEquals(Ok<number, number>(41).mapErr((err) => `${err + 2}`), Ok(41));
});
