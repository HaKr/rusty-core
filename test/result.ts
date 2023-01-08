import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";

import {
  Err,
  None,
  Ok,
  Option,
  type Result,
  resultFrom,
  Some,
} from "../src/index.ts";

Deno.test("result predicates", () => {
  assert(Ok(42).isOk());
  assert(!Ok(42).isErr());
  assert(!Err(42).isOk());
  assert(Err(42).isErr());
});

Deno.test("result andThen", () => {
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

Deno.test("result promises", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
});

Deno.test("result promise chaining", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await resultFrom(Promise.resolve(Ok(n * 4 - 6))))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
  function modify(n: number) {
    return resultFrom(Promise.resolve(Ok(n + 1)));
  }
  assertEquals(
    await Ok(12)
      .andThen(modify)
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[13]"),
  );
});

Deno.test("result mapOrElse is different", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .mapResult(() => Err<string, string>("nope"), (nr) => Ok(`[${nr}]`)),
    Ok("[42]"),
  );
});

Deno.test("for o of Result", () => {
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

Deno.test("result mapErr", () => {
  assertEquals(Err(41).mapErr((err) => `${err + 2}`), Err("43"));
  assertEquals(Ok<number, number>(41).mapErr((err) => `${err + 2}`), Ok(41));
});
