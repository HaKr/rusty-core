import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";

import { None, type Option, Some } from "../src/option/mod.ts";
import { Err, Ok, type Result } from "../src/result/api.ts";

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

Deno.test("result mapOrElse is different", async () => {
  assertEquals(
    await Ok(12)
      .andThen(async (n) => await Promise.resolve(Ok(n * 4 - 6)))
      .mapOrElse(() => Err<string, string>("nope"), (nr) => Ok(`[${nr}]`)),
    Ok("[42]"),
  );
});
