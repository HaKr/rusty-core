import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { optionFrom } from "../src/option/api.ts";

import { None, Some } from "../src/option/api.ts";

Deno.test("option predicates", () => {
  assert(Some(42).isSome());
  assert(!None().isSome());
  assert(!Some(42).isNone());
  assert(None().isNone());
});

Deno.test("some map", async () => {
  assertEquals(Some(1).map((some) => `${some + 1} two`), Some("2 two"));
  assertEquals(
    await Some(42).map((some) => Promise.resolve(some + 291)),
    Some(333),
  );
});

Deno.test("none_map", async () => {
  assertEquals(None<number>().map((three) => `${three} two`), None());
  assertEquals(
    await None<number>().map((some) => Promise.resolve(some + 291)),
    None(),
  );
});

Deno.test("some andThen", async () => {
  assertEquals(
    Some(1).andThen((some) => Some(`${some + 1} two`)),
    Some("2 two"),
  );
  assertEquals(
    await Some(42).andThen((some) => Promise.resolve(Some(some + 291))),
    Some(333),
  );
});

Deno.test("none_andThen", async () => {
  assertEquals(None<number>().andThen((none) => Some(`${none} two`)), None());
  assertEquals(
    await None<number>().andThen((none) => Promise.resolve(Some(none + 291))),
    None(),
  );
});

Deno.test("option_filter", () => {
  const is_even = (n: number) => n % 2 == 0;

  assertEquals(None<number>().filter(is_even), None());
  assertEquals(Some<number>(3).filter(is_even), None());
  assertEquals(Some<number>(4).filter(is_even), Some(4));
});

Deno.test("falsies are not None", () => {
  for (const falsy of [0, undefined, null, false]) {
    assertNotEquals(Some(falsy), None());
  }
  for (const falsy of [undefined, null, 2 / 0]) {
    assertEquals(optionFrom(falsy), None());
  }
});

Deno.test("for o of Option", () => {
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

Deno.test("option insert", () => {
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

Deno.test("option replace", () => {
  const x = Some(2);
  const old = x.replace(5);
  assertEquals(x, Some(5));
  assertEquals(old, Some(2));

  const y = None<number>();
  const oldy = y.replace(3);
  assertEquals(y, Some(3));
  assertEquals(oldy, None());
});

Deno.test("option promises", async () => {
  assertEquals(
    await Some(12)
      .andThen(async (n) => await Promise.resolve(Some(n * 2)))
      .andThen((n) => Promise.resolve(Some(n * 3)))
      .andThen((n) => Promise.resolve(Some(n * 4)))
      .andThen((n) => optionFrom(Promise.resolve(Some(n * 5)))),
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
      .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
    Some("333 * 3"),
  );
});

Deno.test("option unwrap", async () => {
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
      .map(async (n) => await Promise.resolve(n * n / n))
      .unwrapOr(99),
    42,
  );
});

Deno.test("option flatten", { ignore: true }, () => {
  assertEquals(Some(Some(42)).flatten(), Some(42));
  assertEquals(Some(Some(42)).flatten().flatten(), Some(42));
  assertEquals(
    Some(Some(42)).flatten().flatten().flatten().flatten(),
    Some(42),
  );
  assertEquals(None().flatten(), None());
  assertEquals(Some(Some(Some(88))).flatten(), Some(Some(88)));
  assertEquals(Some(Some(None())).flatten(), Some(None()));
  assertEquals(Some(Some(None())).flatten().flatten(), None());
  assertEquals(Some(Some(None())).flatten().flatten().flatten(), None());
});

Deno.test("option take", () => {
  const x = Some(42);
  assertEquals(x.take(), Some(42));
  assertEquals(x, None());
  assertEquals(x.take(), None());
  assertEquals(x, None());
});
