import { it } from "mocha";
import assert from "assert";

import { None, optionFrom, Some } from "../src/option/api";

it("option predicates", () => {
  assert(Some(42).isSome());
  assert(!None().isSome());
  assert(!Some(42).isNone());
  assert(None().isNone());
});

it("some map", async () => {
  assert.deepStrictEqual(
    Some(1).map((some) => `${some + 1} two`),
    Some("2 two"),
  );
  assert.deepStrictEqual(
    await Some(42).map((some) => Promise.resolve(some + 291)),
    Some(333),
  );
});

it("none_map", async () => {
  assert.deepStrictEqual(None<number>().map((three) => `${three} two`), None());
  assert.deepStrictEqual(
    await None<number>().map((some) => Promise.resolve(some + 291)),
    None(),
  );
});

it("some andThen", async () => {
  assert.deepStrictEqual(
    Some(1).andThen((some) => Some(`${some + 1} two`)),
    Some("2 two"),
  );
  assert.deepStrictEqual(
    await Some(42).andThen((some) => Promise.resolve(Some(some + 291))),
    Some(333),
  );
});

it("none_andThen", async () => {
  assert.deepStrictEqual(
    None<number>().andThen((none) => Some(`${none} two`)),
    None(),
  );
  assert.deepStrictEqual(
    await None<number>().andThen((none) => Promise.resolve(Some(none + 291))),
    None(),
  );
});

it("option_filter", () => {
  const is_even = (n: number) => n % 2 == 0;

  assert.deepStrictEqual(None<number>().filter(is_even), None());
  assert.deepStrictEqual(Some<number>(3).filter(is_even), None());
  assert.deepStrictEqual(Some<number>(4).filter(is_even), Some(4));
});

it("falsies are not None", () => {
  for (const falsy of [0, undefined, null, false]) {
    assert.notEqual(Some(falsy), None());
  }
  for (const falsy of [undefined, null, 2 / 0]) {
    assert.deepStrictEqual(optionFrom(falsy), None());
  }
});

it("for o of Option", () => {
  let n = 0;
  for (const opt of None<number>()) {
    n += opt;
  }
  assert.deepStrictEqual(n, 0);
  for (const opt of Some(15)) {
    n += opt;
  }
  assert.deepStrictEqual(n, 15);
});

it("option insert", () => {
  const x = None<{ answer: number }>();
  const y = x.getOrInsert({ answer: 41 });
  y.answer = 42;
  assert.deepStrictEqual(x, Some({ answer: 42 }));

  const someOne = Some(99);
  someOne.insert(1);
  assert.deepStrictEqual(someOne, Some(1));

  const x1 = None<number>();
  const y1 = x1.getOrInsertWith(() => 5);
  assert.deepStrictEqual(y1, 5);
  assert.deepStrictEqual(x1, Some(5));
});

it("option replace", () => {
  const x = Some(2);
  const old = x.replace(5);
  assert.deepStrictEqual(x, Some(5));
  assert.deepStrictEqual(old, Some(2));

  const y = None<number>();
  const oldy = y.replace(3);
  assert.deepStrictEqual(y, Some(3));
  assert.deepStrictEqual(oldy, None());
});

it("option promises", async () => {
  assert.deepStrictEqual(
    await Some(12)
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen((n) => Promise.resolve(Some(n * 3)))
      .andThen((n) => Promise.resolve(Some(n * 4)))
      .andThen((n) => optionFrom(Promise.resolve(Some(n * 5)))),
    Some(12 * 2 * 3 * 4 * 5),
  );

  assert.deepStrictEqual(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(321)))
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen(async (n) => await Promise.resolve(Some(n * 3)))
      .andThen(async (n) => await Promise.resolve(Some(n * 4))),
    Some(321 * 2 * 3 * 4),
  );

  assert.deepStrictEqual(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(55)))
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
    Some("110 * 3"),
  );

  assert.deepStrictEqual(
    await None<number>()
      .orElse(async () => await Promise.resolve(Some(111)))
      .map(async (n) => await Promise.resolve(n * 2))
      .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
    Some("222 * 3"),
  );

  assert.deepStrictEqual(
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

it("option unwrap", async () => {
  assert.deepStrictEqual(Some(99).unwrapOr(100), 99);
  assert.deepStrictEqual(None<number>().unwrapOr(100), 100);
  assert.deepStrictEqual(Some("99").unwrapOrElse(() => "100"), "99");
  assert.deepStrictEqual(None<string>().unwrapOrElse(() => "100"), "100");
  assert.deepStrictEqual(
    await Some("99").unwrapOrElse(async () => await Promise.resolve("100")),
    "99",
  );
  assert.deepStrictEqual(
    await None<string>().unwrapOrElse(async () => await Promise.resolve("100")),
    "100",
  );
  assert.deepStrictEqual(
    await Some(42)
      .map(async (n) => await Promise.resolve(n * n / n))
      .unwrapOr(99),
    42,
  );
});

it("option take", () => {
  const x = Some(42);
  assert.deepStrictEqual(x.take(), Some(42));
  assert.deepStrictEqual(x, None());
  assert.deepStrictEqual(x.take(), None());
  assert.deepStrictEqual(x, None());
});
