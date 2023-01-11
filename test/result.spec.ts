import assert from "node:assert/strict";

import { None, Option, Some } from "../src/option/api";

import {
  Err,
  ErrPromise,
  Ok,
  OkPromise,
  type Result,
  ResultPromise,
} from "../src/result/api";

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

it("result ErrPromise", async () => {
  assert.deepStrictEqual(
    await ErrPromise("ouch"),
    Err("ouch"),
  );
});

it("result andThen", async () => {
  const addOneIfEven = (n: number) =>
    n % 2 == 0
      ? Ok<string, string>(`${n + 1}`)
      : Err<string, string>(`${n - 111}`);
  const addOneIfEvenPromise = (n: number) =>
    n % 2 == 0
      ? OkPromise<string, string>(`${n + 1}`)
      : ErrPromise<string, string>(`${n - 111}`);

  assert.deepStrictEqual(
    Err<number, string>("no number")
      .andThen(addOneIfEven),
    Err("no number"),
  );
  assert.deepStrictEqual(
    Ok<number, string>(887)
      .andThen(addOneIfEven),
    Err("776"),
  );
  assert.deepStrictEqual(
    Ok<number, string>(888)
      .andThen(addOneIfEven),
    Ok("889"),
  );
  assert.deepStrictEqual(
    await Err<number, string>("no number")
      .andThen(addOneIfEvenPromise),
    Err("no number"),
  );
  assert.deepStrictEqual(
    await Ok<number, string>(887)
      .andThen(addOneIfEvenPromise),
    Err("776"),
  );
  assert.deepStrictEqual(
    await Ok<number, string>(888)
      .andThen(addOneIfEvenPromise),
    Ok("889"),
  );
});

it("result orElse", () => {
  assert.deepStrictEqual(
    Ok<number, string>(888)
      .orElse((err) => err.includes("ok") ? Ok(999) : Err(`${err}!`)),
    Ok(888),
  );
  assert.deepStrictEqual(
    Err<number, string>("ok")
      .orElse((err) => err.includes("ok") ? Ok(999) : Err(`${err}!`)),
    Ok(999),
  );
  assert.deepStrictEqual(
    Err<number, string>("nope")
      .orElse((err) => err.includes("ok") ? Ok(999) : Err(`${err}!`)),
    Err("nope!"),
  );
});

it("result promises", async () => {
  assert.deepStrictEqual(
    await Ok<number, string>(12)
      .andThen(async (n) => await Ok(Promise.resolve(n * 4 - 6)))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
});

it("result promise chaining", async () => {
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(async (n) => await Ok(Promise.resolve(n * 4 - 6)))
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[42]"),
  );
  function modify(n: number) {
    return Ok(Promise.resolve(n + 1));
  }
  assert.deepStrictEqual(
    await Ok(12)
      .andThen(modify)
      .map((nr) => `${nr}`)
      .map(async (s) => await Promise.resolve(`[${s}]`)),
    Ok("[13]"),
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

it("result mapErr", () => {
  assert.deepStrictEqual(Err(41).mapErr((err) => `${err + 2}`), Err("43"));
  assert.deepStrictEqual(
    Ok<number, number>(41).mapErr((err) => `${err + 2}`),
    Ok(41),
  );
});
