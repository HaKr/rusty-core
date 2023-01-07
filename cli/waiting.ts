import { None, type Option, Some, SomePromise } from "../src/option/api.ts";

function sleep(ms: number): Promise<number> {
  return new Promise((resolve) => {
    const start = Date.now();
    setTimeout(() => resolve((Date.now() - start) / 100.0), ms);
  });
}

function pauseIfNeeded1(ms: Option<number>) {
  return ms.mapOrElse(
    () => SomePromise(0),
    async (ms) => Some(await sleep(ms)),
  );
}

function pauseIfNeeded2(ms: Option<number>) {
  return ms.mapOrElse(
    () => 0,
    (ms) => ms,
  );
}

function pauseIfNeeded3(ms: Option<number>) {
  return ms.mapOrElse(
    () => Some(0),
    Some,
  );
}

function pauseIfNeededPromise1(ms: Option<number>) {
  return ms.mapOrElsePromise(
    () => 0,
    (ms) => ms,
  );
}

function pauseIfNeededPromise2(ms: Option<number>) {
  return ms.mapOrElsePromise(
    () => Promise.resolve(0),
    async (ms) => await sleep(ms),
  );
}

function pauseIfNeededNever1(ms: Option<number>) {
  return ms.mapOrElse(
    () => Promise.resolve(0),
    (ms) => sleep(ms),
  );
}

function pauseIfNeededNever2(ms: Option<number>) {
  return ms.mapOrElsePromise(
    None<number>,
    (ms) => Some(ms),
  );
}

function pauseIfNeededNever3(ms: Option<number>) {
  return ms.mapOrElsePromise(
    None<string>,
    (ms) => Some(`${ms}ms`),
  );
}

const tasks = {
  pauseIfNeeded1,
  pauseIfNeeded2,
  pauseIfNeeded3,
  pauseIfNeededPromise1,
  pauseIfNeededPromise2,
  pauseIfNeededNever1,
  pauseIfNeededNever2,
  pauseIfNeededNever3,
};

interface Mapable {
  map(fn: (n: number) => void): void;
}

function asMapable(v: unknown): Mapable {
  const mapable = (v as unknown as Mapable);
  return (typeof mapable.map == "function") ? mapable : { map: () => void {} };
}

interface Thenable {
  then(fn: (n: number) => void): void;
}

function asThenable(v: unknown): Thenable {
  const thenable = (v as unknown as Thenable);
  return (typeof thenable.then == "function")
    ? thenable
    : { then: () => void {} };
}

function taskRunner(
  name: string,
  ms: number,
  fn: (ms: Option<number>) => unknown,
): void {
  const rv = fn(Some(ms));
  console.log(1, name, rv);
  asThenable(rv).then((res) => console.log("\t2", name, res));
  if (!name.includes("Never")) {
    asMapable(rv).map((n) => console.log("\t3", name, "mapped to", n));
  }
}

let ms = 101;
for (const taskName in tasks) {
  // deno-lint-ignore no-explicit-any
  taskRunner(taskName, ms++, (tasks as any)[taskName]);
}

// console.log("pauseIfNeeded2", pauseIfNeeded2(Some(101)));
// console.log("pauseIfNeededPromise1", pauseIfNeededPromise1(Some(201)));
// console.log("pauseIfNeededPromise2", pauseIfNeededPromise2(Some(202)));
// pauseIfNeeded1(None()).map((n) => n + 42).okOrElse(ErrPromise<void, void>).map(
//   (n) => console.log(`Ok(${n})`),
// );
