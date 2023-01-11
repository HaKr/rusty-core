import { assert, assertEquals, testCase } from "./deps.ts";

import { Err, ErrPromise, None, Ok, OkPromise, Some } from "../src/index.ts";

testCase("option predicates", () => {
  assert(Some(42).isSome());
  assert(!None().isSome());
  assert(!Some(42).isNone());
  assert(None().isNone());
});

testCase("some map", async () => {
  assertEquals(
    Some(1).map((some) => `${some + 1} two`),
    Some("2 two"),
  );
  assertEquals(
    await Some(42).map((some) => Promise.resolve(some + 291)),
    Some(333),
  );
});

testCase("none_map", async () => {
  assertEquals(None<number>().map((three) => `${three} two`), None());
  assertEquals(
    await None<number>().map((some) => Promise.resolve(some + 291)),
    None(),
  );
});

testCase("some andThen", async () => {
  assertEquals(
    Some(1).andThen((some) => Some(`${some + 1} two`)),
    Some("2 two"),
  );
  assertEquals(
    await Some(42).andThen((some) => Promise.resolve(Some(some + 291))),
    Some(333),
  );
});

testCase("none_andThen", async () => {
  assertEquals(
    None<number>().andThen((none) => Some(`${none} two`)),
    None(),
  );
  assertEquals(
    await None<number>().andThen((none) => Promise.resolve(Some(none + 291))),
    None(),
  );
});

testCase("option_filter", () => {
  const is_even = (n: number) => n % 2 == 0;

  assertEquals(None<number>().filter(is_even), None());
  assertEquals(Some<number>(3).filter(is_even), None());
  assertEquals(Some<number>(4).filter(is_even), Some(4));
});

testCase("Some( undefined | null | Infinity | NaN ) ->  None", () => {
  for (const falsy of [undefined, null, 2 / 0, NaN]) {
    assertEquals(Some(falsy), None());
  }
});

testCase("for o of Option", () => {
  let n = 0;
  for (const opt of None<number>()) {
    n += opt;
  }
  assertEquals(n, 0);
  for (const opt of Some(15)) {
    n += opt;
  }
  assertEquals(n, 15);
});

testCase("option insert", () => {
  const x = None<{ answer: number }>();
  const y = x.getOrInsert({ answer: 41 });
  y.answer = 42;
  assertEquals(x, Some({ answer: 42 }));

  const someOne = Some(99);
  someOne.insert(1);
  assertEquals(someOne, Some(1));

  const x1 = None<number>();
  const y1 = x1.getOrInsertWith(() => 5);
  assertEquals(y1, 5);
  assertEquals(x1, Some(5));
});

testCase("option replace", () => {
  const x = Some(2);
  const old = x.replace(5);
  assertEquals(x, Some(5));
  assertEquals(old, Some(2));

  const y = None<number>();
  const oldy = y.replace(3);
  assertEquals(y, Some(3));
  assertEquals(oldy, None());
});

testCase("option promises", async () => {
  assertEquals(
    await Some(12)
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen((n) => Promise.resolve(Some(n * 3)))
      .andThen((n) => Promise.resolve(Some(n * 4)))
      .andThen((n) => Some(Promise.resolve(Some(n * 5)))),
    Some(12 * 2 * 3 * 4 * 5),
  );

  assertEquals(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(321)))
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen(async (n) => await Promise.resolve(Some(n * 3)))
      .andThen(async (n) => await Promise.resolve(Some(n * 4))),
    Some(321 * 2 * 3 * 4),
  );

  assertEquals(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(55)))
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
    Some("110 * 3"),
  );

  assertEquals(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(111)))
      .map(async (n) => await Promise.resolve(n * 2))
      .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
    Some("222 * 3"),
  );

  assertEquals(
    await None<number>()
      .orElse(async () => await Promise.resolve(None()))
      .mapOrElse(
        async () => await Promise.resolve(333),
        async (n) => await Promise.resolve(n * 2),
      )
      .then(async (n) => await Promise.resolve(`${n} * 3`)),
    "333 * 3",
  );
});

testCase("option unwrap", async () => {
  assertEquals(Some(99).unwrapOr(100), 99);
  assertEquals(None<number>().unwrapOr(100), 100);
  assertEquals(Some("99").unwrapOrElse(() => "100"), "99");
  assertEquals(None<string>().unwrapOrElse(() => "100"), "100");
  assertEquals(
    await Some("99").unwrapOrElse(async () => await Promise.resolve("100")),
    "99",
  );
  assertEquals(
    await None<string>().unwrapOrElse(async () => await Promise.resolve("100")),
    "100",
  );
  assertEquals(
    await Some(42)
      .map(async (n) => Promise.resolve(n * n / n))
      .unwrapOr(99),
    42,
  );
});

testCase("option take", () => {
  const x = Some(42);
  assertEquals(x.take(), Some(42));
  assertEquals(x, None());
  assertEquals(x.take(), None());
  assertEquals(x, None());
});

function promisify<T>(arg: T): Promise<T> {
  return Promise.resolve(arg);
}

testCase("option from", async () => {
  assertEquals(Some(12), Some(12));
  Some(12).map((some) => assertEquals(some, 12));
  assertEquals(Some("forty-two"), Some("forty-two"));
  assertEquals(Some({ answer: 42 }), Some({ answer: 42 }));
  assertEquals(Some<{ answer: number }>(), None());
  await Some(promisify(12)).map((some) => assertEquals(some, 12));
  await Some(Some(promisify(12))).map((some) => assertEquals(some, 12));
  await Some(Some(Some(promisify(12)))).map((some) => assertEquals(some, 12));
  await Some(Some(Some(promisify(1 / 0)))).map((_) =>
    assert(false, "Should never be executed")
  );
  assertEquals(
    await Some(1 / 0).mapOrElse(
      () => 99,
      (some) => some,
    ),
    99,
  );
  assertEquals(
    await Some(promisify(1 / 0)).mapOrElse(
      () => 42,
      (some) => some,
    ),
    42,
  );
  assertEquals(
    Some(1 / 0).mapOrElse(
      () => 99,
      (some) => some,
    ),
    99,
  );
  assertEquals(
    Some(1 / 0).mapOrElse(
      () => Ok<number, number>(99),
      (some) => Err(some),
    ),
    Ok(99),
  );

  assertEquals(
    await Some(1 / 0).mapResult(
      () => OkPromise<number, number>(99),
      (some) => ErrPromise(some),
    ),
    Ok(99),
  );
  assertEquals(
    await Some(promisify(1 / 0)).okOrElse(
      () => 97,
    ),
    Err(97),
  );

  assertEquals(
    await Some(promisify(47)).okOrElse(
      () => 97,
    ),
    Ok(47),
  );
  Some(promisify("forty-two")).map((some) => assertEquals(some, "forty-two"));
  assertEquals(Some({ answer: 42 }), Some({ answer: 42 }));
  assertEquals(Some<{ answer: number }>(), None());
  const map: { [key: string | number]: { answer: number } } = {
    abc: { answer: 42 },
    29: { answer: 29 },
  };
  assertEquals(
    Some("abc")
      .map((key) => map[key]),
    Some({ answer: 42 }),
  );
  assertEquals(
    Some<string>()
      .map((key) => map[key]),
    None(),
  );
  assertEquals(
    Some("xyz")
      .map((key) => map[key]),
    None(),
  );
  assertEquals(
    Some(1 / 0)
      .map((key) => map[key]),
    None(),
  );
  assertEquals(
    Some(29)
      .map((key) => map[key]),
    Some({ answer: 29 }),
  );
});

testCase("result from", () => {
  assertEquals(Ok(1 / 0), Ok(Infinity));
  assertEquals(
    Some(1 / 0).okOrElse(() => "Not a valid number"),
    Err("Not a valid number"),
  );
});
