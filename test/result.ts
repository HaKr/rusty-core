import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";

import { None, type Option, Some } from "../src/option/mod.ts";
import { Err, Ok, type Result } from "../src/result/mod.ts";

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

Deno.test("doc", () => {
  class CannotDivideByZero {}

  function divide(
    numerator: number,
    denominator: number,
  ): Result<number, CannotDivideByZero> {
    if (denominator === 0) {
      return Err(new CannotDivideByZero());
    } else {
      return Ok(numerator / denominator);
    }
  }

  for (const result of [divide(7, 0), divide(2.0, 3.0)]) {
    result.mapOrElse(
      (_) => console.error("Cannot divide by zero"),
      (ok) => console.log(`Result: ${ok}`),
    );
  }
  // "Cannot divide by zero"
  // "Result: 0.6666666666666666"
});
