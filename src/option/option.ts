import {
  MapOption,
  NoneValue,
  Ok,
  Option,
  OptionFrom,
  OptionLike,
  OptionMapOption,
  OptionMapOrElse,
  OptionMapResult,
  OptionPromise,
  OptionPromiseMapOption,
  OptionPromiseMapOrElse,
  OptionPromiseMapResult,
  Result,
  ResultPromise,
  SomeValue,
  UnwrapableOption,
} from "./mod.ts";

/**
 * Create an {@linkcode OptionPromise} from a value.
 * @example
 * ```typescript
 * declare function calculate(n: number): OptionPromise<number>;
 * Some(42)
 *   .mapOption(
 *     // when using Some here, the compiler will error on calculate with an Argument Error
 *     () => SomePromise(-1),
 *     calculate
 *   );
 * ```
 */
export function SomePromise<T>(value: T): OptionPromise<T> {
  return Some(Promise.resolve(value)) as OptionPromise<T>;
}

/**
 * `None` creates an Option that has no associated value. It might be useful to
 * pass a type argument:
 * ```typescript
 * const token = None<string>();
 * token.insert(12); // will give a compile error that the argument must be string
 * ```
 */
export function None<T>(): Option<T> {
  return Some() as Option<T>; // Not a mistake Some(undefined) returns a None
}

/**
 * Create an {@linkcode OptionPromise} without a value.
 * @example
 * ```typescript
 * declare function calculate(n: number): OptionPromise<number>;
 * Some(42)
 *   .mapOption(
 *     // when using Some here, the compiler will error on calculate with an Argument Error
 *     () => NonePromise,
 *     calculate
 *   );
 * ```
 */
export function NonePromise<T>(): OptionPromise<T> {
  return Some(Promise.resolve()) as OptionPromise<T>;
}

/**
 * `Some` creates an Option which has an associated value. The type argument can be
 * inferred from the argument. Actually, `Some` is a bit special, as it also might
 * return a `None` value:
 * ```typescript
 * // All the statements below return a None
 * Some();
 * Some(null);
 * Some(Infinity);
 * Some(NaN);
 * ```
 * Passing a promise to `Some` results in an {@linkcode OptionPromise<T>}, which can be
 * convenient. When a `OptionPromise` is required e.g., for {@linkcode mapOrElse},
 * {@linkcode NonePromise} or {@linkcode SomePromise}
 */
export function Some<T>(
  value?: T | undefined | null,
): OptionFrom<T> {
  return (value instanceof PromisedOption || value instanceof OptionValue
    ? value
    : value instanceof SomeValue || value instanceof NoneValue
    ? OptionValue.from(value)
    : value instanceof Promise
    ? PromisedOption.from(value)
    : value === undefined || (typeof value == "object" && value == null) ||
        (typeof value == "number" && (Number.isNaN(value) || value == Infinity))
    ? OptionValue.from(new NoneValue<T>())
    : OptionValue.from(new SomeValue<T>(value))) as OptionFrom<T>;
}

/**
 * Test that a variable implements the {@linkcode Option<T>} interface
 * @returns true if variable can be cast to `Option<T>`
 *
 * @example
 * ```typescript
 * const vut: unknown = Some(42);
 * if (isOption(vut)) {
 *   console.log(vut.unwrapOr(-99));
 * }
 * ```
 */
export function isOption<T = unknown>(
  possibleOption: unknown,
): possibleOption is Option<T> {
  return possibleOption instanceof OptionValue;
}

/**
 * Test that a variable implements the {@linkcode OptionPromise<T>} interface
 * @returns true if variable can be cast to `OptionPromise<T>`
 *
 * @example
 * const vut: unknown = Some(Promise.resolve(42));
 * if (isOptionPromise<number>(vut)) {
 *   vut.map(console.log);
 * }
 */
export function isOptionPromise<T = unknown>(
  possibleOption: unknown,
): possibleOption is OptionPromise<T> {
  return possibleOption instanceof PromisedOption;
}

export function isOptionLike<T = unknown>(
  possibleOption: unknown,
): possibleOption is OptionLike<T> {
  return isOption(possibleOption) || isOptionPromise(possibleOption);
}

export class OptionValue<T> implements Option<T>, UnwrapableOption<T> {
  constructor(
    private option: UnwrapableOption<T>,
  ) {}

  get type(): symbol {
    return this.option.type;
  }

  static from<T>(option: UnwrapableOption<T>): Option<T> {
    return new OptionValue(option);
  }

  and<U>(optb: Option<U>): Option<U> {
    return this.option.and(optb);
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | Promise<Option<U>>,
  ): OptionPromise<U> | Option<U> {
    return this.option.andThen(fn as (some: T) => Option<U>);
  }

  filter(predicate: (some: T) => boolean): Option<T> {
    return this.option.filter(predicate);
  }

  flatten<U>(this: Option<U>): Option<U>;
  flatten<U>(this: Option<Option<U>>): Option<U>;
  flatten<U>(this: Option<U> | Option<Option<U>>): Option<U> {
    return ((this as unknown as OptionValue<T>).option as unknown as Option<
      Option<U>
    >).flatten();
  }

  getOrInsert(value: T): T {
    const optional = this.option.orElse(() => {
      this.option = new SomeValue<T>(value);
      return this;
    });
    return (optional as unknown as UnwrapableOption<T>).unwrap();
  }

  getOrInsertWith(fn: () => T): T {
    const optional = this.option.orElse(() => {
      this.option = new SomeValue<T>(fn());
      return this;
    });
    return (optional as unknown as UnwrapableOption<T>).unwrap();
  }

  insert(value: T) {
    this.option = new SomeValue<T>(value);
    return value;
  }

  isSome(): boolean {
    return this.option.isSome();
  }
  isNone(): boolean {
    return this.option.isNone();
  }

  map<U>(fn: (some: T) => U): MapOption<U> {
    return this.option.map(fn as (some: T) => U);
  }

  mapOption<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionMapOption<U> {
    return this.option.mapOption(def, fn);
  }

  mapResult<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionMapResult<U> {
    return this.option.mapResult(def, fn);
  }

  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionMapOrElse<U> {
    return this.option.mapOrElse(def, fn);
  }

  okOr<E>(err: E): Result<T, E> {
    return this.option.okOr(err);
  }

  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;
  okOrElse<E>(fn: () => Promise<E> | E): ResultPromise<T, E> | Result<T, E> {
    return this.option.okOrElse(fn as () => E);
  }

  or(optb: Option<T>): Option<T> {
    return this.option.or(optb);
  }

  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    fn: () => Option<T> | Promise<Option<T>>,
  ): OptionPromise<T> | Option<T> {
    return this.option.orElse(fn as () => Option<T>);
  }

  replace(value: T): Option<T> {
    const old = OptionValue.from(this.option);
    this.insert(value);
    return old;
  }

  take(): Option<T> {
    const result = this.flatten();
    this.option = new NoneValue<T>();
    return result;
  }

  unwrap(): T {
    return this.option.unwrap();
  }

  unwrapOr(def: T): T {
    return this.option.unwrapOr(def);
  }

  unwrapOrElse(def: () => T): T;
  unwrapOrElse(def: () => Promise<T>): T | Promise<T>;
  unwrapOrElse(def: () => T | Promise<T>): T | Promise<T> {
    return this.option.unwrapOrElse(def as () => T);
  }

  xor(optb: Option<T>): Option<T> {
    return this.option.xor(optb);
  }

  [Symbol.iterator]() {
    return this.option[Symbol.iterator]();
  }
}

export class PromisedOption<T> implements OptionPromise<T> {
  promise: Promise<Option<T>>;

  constructor(
    promise: Promise<Option<T>>,
  ) {
    this.promise = promise.then(
      (resolved) => isOptionLike<T>(resolved) ? resolved : Some(resolved),
      (_reason) => None(),
    );
  }

  get [Symbol.toStringTag](): string {
    return `OptionPromise`;
  }

  static from<U>(promise: Promise<Option<U>>): OptionPromise<U> {
    return new PromisedOption(promise);
  }

  then<TResult1 = Option<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: Option<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      // deno-lint-ignore no-explicit-any
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<Option<T> | TResult> {
    return this.promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<Option<T>> {
    return this.promise.finally(onfinally);
  }

  and<U>(optb: Option<U>): OptionPromise<U> {
    return PromisedOption.from(
      this.promise.then((option) => option.and(optb)),
    );
  }

  andThen<U>(fn: (some: T) => OptionPromise<U>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): OptionPromise<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | Promise<Option<U>>,
  ): OptionPromise<U> {
    return PromisedOption.from(
      this.promise.then((option) => {
        return option.andThen(fn as (some: T) => Option<U>);
      }),
    );
  }

  filter(predicate: (some: T) => boolean): OptionPromise<T> {
    return PromisedOption.from(
      this.promise.then((option) => option.filter(predicate)),
    );
  }

  flatten<U>(this: Option<Option<U>>): OptionPromise<U>;
  flatten<U>(this: Option<U>): OptionPromise<U>;
  flatten<U>(this: Option<U> | Option<Option<U>>): OptionPromise<U> {
    return PromisedOption.from(
      (this as unknown as PromisedOption<T>).promise.then((option) =>
        option.flatten() as unknown as Option<U>
      ),
    );
  }

  isSome(): Promise<boolean> {
    return this.promise.then((option) => option.isSome());
  }

  isNone(): Promise<boolean> {
    return this.promise.then((option) => option.isNone());
  }

  map<U>(fn: (some: T) => U): OptionPromise<U> {
    return Some(
      this.promise.then((option) =>
        option.map(fn as (some: T) => U) as OptionPromise<U>
      ),
    );
  }

  mapOption<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapOption<U> {
    return Some(this.promise.then(
      (option) => option.mapOption(def, fn) as Promise<Option<U>>,
    )) as OptionPromiseMapOption<U>;
  }

  mapResult<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapResult<U> {
    return Ok(this.promise.then(
      (option) =>
        option.mapResult(def, fn) as Promise<Result<unknown, unknown>>,
    )) as OptionPromiseMapResult<U>;
  }

  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapOrElse<U> {
    return this.promise.then((option) => {
      return option.mapOrElse(def, fn);
    }) as OptionPromiseMapOrElse<U>;
  }

  okOr<E>(err: E): ResultPromise<T, E> {
    return Ok(
      this.promise.then((option) => option.okOr(err)),
    );
  }

  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E | Promise<E>): ResultPromise<T, E> {
    return Ok(
      this.promise.then((option) => option.okOrElse(fn as () => Promise<E>)),
    );
  }

  or(optb: Option<T>): OptionPromise<T> {
    return PromisedOption.from(
      this.promise.then((option) => option.or(optb)),
    );
  }

  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): OptionPromise<T>;
  orElse(fn: () => Option<T> | Promise<Option<T>>): OptionPromise<T> {
    return PromisedOption.from(
      this.promise.then((option) => {
        return option.orElse(fn as () => Option<T>);
      }),
    );
  }

  unwrapOr(def: T): Promise<T> {
    return this.promise.then((option) => option.unwrapOr(def));
  }

  unwrapOrElse(def: () => T): Promise<T>;
  unwrapOrElse(def: () => Promise<T>): Promise<T>;
  unwrapOrElse(def: () => T | Promise<T>): Promise<T> {
    return this.promise.then((option) => option.unwrapOrElse(def as () => T));
  }

  xor(optb: Option<T>): OptionPromise<T> {
    return PromisedOption.from(
      this.promise.then((option) => option.xor(optb)),
    );
  }
}
