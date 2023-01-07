type UseResultPromiseInstead =
  "Returning a promise here is not advisable, use resultOrElse instead";
type NoMapables<T> = T extends Mapable<unknown> | MapablePromise<unknown>
  ? UseResultPromiseInstead
  : T extends Promise<infer U> ? Promise<U>
  : Promise<T>;
type ResultOrElse<T> = T extends Mapable<infer U> | MapablePromise<infer U>
  ? MapablePromise<U>
  : never;

interface Mapable<T> {
  mapOrElse<U>(
    even: (n: T) => U,
    odd: (n: T) => U,
  ): U;
}

interface MapablePromise<T> {
  mapOrElse<U = void>(
    even: (n: T) => U,
    odd: (n: T) => U,
  ): NoMapables<U>;
  resultOrElse<U extends Mapable<unknown> | MapablePromise<unknown>>(
    even: (n: T) => U,
    odd: (n: T) => U,
  ): ResultOrElse<U>;
}

class OddOrEven implements Mapable<number> {
  constructor(private value: number) {}

  mapOrElse<U>(even: (n: number) => U, odd: (n: number) => U): U {
    return this.value % 2 == 0 ? even(this.value) : odd(this.value);
  }
}

function promisedMapable(mapable: Mapable<number>) {
  return new Promised(Promise.resolve(mapable));
}

class Promised<T = number> implements Promise<Mapable<T>>, MapablePromise<T> {
  constructor(private promise: Promise<Mapable<T>>) {}

  mapOrElse<U>(even: (n: T) => U, odd: (n: T) => U): NoMapables<U> {
    const rv = this.promise.then(
      (mapable) => mapable.mapOrElse(even, odd),
    );
    return rv as NoMapables<U>;
  }

  resultOrElse<U extends Mapable<unknown> | MapablePromise<unknown>>(
    even: (n: T) => U,
    odd: (n: T) => U,
  ): ResultOrElse<U> {
    const rv = this.promise.then((mapable) => mapable.mapOrElse(even, odd));
    return new Promised<U>(
      rv as unknown as Promise<Mapable<U>>,
    ) as MapablePromise<U> as ResultOrElse<U>;
  }

  then<TResult1 = Mapable<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: Mapable<T>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<Mapable<T> | TResult> {
    return this.promise.catch(onrejected);
  }

  finally(
    onfinally?: (() => void) | null | undefined,
  ): Promise<Mapable<T>> {
    return this.finally(onfinally);
  }

  get [Symbol.toStringTag](): string {
    return "Promised";
  }
}

const _ = new OddOrEven(1)
  .mapOrElse<Promised>(
    (n) => promisedMapable(new OddOrEven(n + 3)),
    (n) => promisedMapable(new OddOrEven(n + 5)),
  )
  .mapOrElse<Mapable<number>>(
    (n) => new OddOrEven(n + 11),
    (n) => new OddOrEven(n + 13),
  );

new OddOrEven(1)
  .mapOrElse<Mapable<number>>(
    (n) => new OddOrEven(n + 3),
    (n) => new OddOrEven(n + 5),
  )
  .mapOrElse<Promised>(
    (n) => promisedMapable(new OddOrEven(n + 7)),
    (n) => promisedMapable(new OddOrEven(n + 9)),
  ).resultOrElse<Mapable<number>>(
    (n) => new OddOrEven(n + 11),
    (n) => new OddOrEven(n + 13),
  ).resultOrElse<MapablePromise<number>>(
    (n) => promisedMapable(new OddOrEven(n + 15)),
    (n) => promisedMapable(new OddOrEven(n + 17)),
  ).mapOrElse(
    (even) => console.log("Even:", even),
    (odd) => console.log("Odd: ", odd),
  ).finally(() => console.log("1 Finished"));

new OddOrEven(2)
  .mapOrElse<Mapable<number>>(
    (n) => new OddOrEven(n + 3),
    (n) => new OddOrEven(n + 5),
  )
  .mapOrElse<Promised>(
    (n) => promisedMapable(new OddOrEven(n + 7)),
    (n) => promisedMapable(new OddOrEven(n + 9)),
  ).resultOrElse<Mapable<number>>(
    (n) => new OddOrEven(n + 11),
    (n) => new OddOrEven(n + 13),
  ).resultOrElse<MapablePromise<number>>(
    (n) => promisedMapable(new OddOrEven(n + 15)),
    (n) => promisedMapable(new OddOrEven(n + 17)),
  ).mapOrElse(
    (even) => console.log("Even:", even),
    (odd) => console.log("Odd: ", odd),
  ).finally(() => console.log("2 Finished"));
