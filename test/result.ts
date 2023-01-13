import {
  assert,
  assertEquals,
  Err,
  None,
  Ok,
  Option,
  OptionPromise,
  Result,
  Some,
  testCase,
} from "./deps";

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
  assertEquals(Ok<number, string>(2).map((n) => `[${n}]`), Ok("[2]"));
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

class Failed extends Error {}

testCase("result promise rejects expected", () => {
  async function compute(n: number): Promise<number> {
    await Promise.resolve(n);
    throw new Failed("returned an Err");
  }

  Ok(compute(42)).mapErr(
    (err) => {
      assert(
        err instanceof Failed,
        "This is the Err we did expect",
      );
      if (err instanceof Failed) assertEquals(err.message, "returned an Err");
    },
  );
});

declare function calculate(n: number): OptionPromise<number>;
testCase("result promise rejects unexpected", () => {
  async function compute(n: number) {
    return await calculate(n).okOrElse(() =>
      new Failed("calculate did not return a value")
    );
  }

  Ok(compute(42)).mapErr(
    (err) => {
      assert(
        err instanceof ReferenceError,
        "because this is a coding error, but at least it is an Err",
      );
    },
  );
});
