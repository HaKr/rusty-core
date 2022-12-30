// import { Err, Ok, type Result } from "../result/result.ts";

import { Result, ResultPromise } from "../result/api.ts";
import { Option } from "./api.ts";
import { UnwrapableOption } from "./chainable.ts";
import { NoneValue, SomeValue } from "./implementation.ts";

export function Some<T>(value: T): Option<T> {
  return OptionValue.from(new SomeValue<T>(value));
}

export function None<T>(): Option<T> {
  return OptionValue.from(new NoneValue<T>());
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

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | Promise<Option<U>>,
  ): PromisedOption<U> | Option<U> {
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
  map<U>(fn: (some: T) => Promise<U>): PromisedOption<U>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(fn: (some: T) => U | Promise<U>): PromisedOption<U> | Option<U> {
    return this.option.map(fn as (some: T) => U);
  }

  mapOrElse<U>(
    def: () => Promise<U>,
    fn: (some: T) => Promise<U>,
  ): PromisedOption<U>;
  mapOrElse<U>(
    def: () => Promise<U>,
    fn: (some: T) => U,
  ): PromisedOption<U> | Option<U>;
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => Promise<U>,
  ): PromisedOption<U> | Option<U>;

  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): Option<U>;
  mapOrElse<U>(
    def: () => U | Promise<U>,
    fn: (some: T) => U | Promise<U>,
  ): Option<U> | PromisedOption<U> {
    return this.option.mapOrElse(def as () => U, fn as (some: T) => U);
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

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    fn: () => Option<T> | Promise<Option<T>>,
  ): PromisedOption<T> | Option<T> {
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

export class PromisedOption<T> extends Promise<Option<T>> {
  constructor(
    private promise: Promise<Option<T>>,
  ) {
    super((resolve) => {
      resolve(undefined as unknown as Option<T>);
    });
  }

  static create<U>(promise: Promise<Option<U>>): PromisedOption<U> {
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

  and<U>(optb: Option<U>): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) => option.and(optb)),
    );
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): PromisedOption<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | Promise<Option<U>>,
  ): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) => {
        return option.andThen(fn as (some: T) => Option<U>);
      }),
    );
  }

  filter(predicate: (some: T) => boolean): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => option.filter(predicate)),
    );
  }

  isSome(): Promise<boolean> {
    return this.promise.then((option) => option.isSome());
  }

  isNone(): Promise<boolean> {
    return this.promise.then((option) => option.isNone());
  }

  map<U>(fn: (some: T) => Promise<U>): PromisedOption<U>;
  map<U>(fn: (some: T) => U): PromisedOption<U>;
  map<U>(fn: unknown): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) => option.map(fn as (some: T) => Promise<U>)),
    );
  }

  mapOrElse<U>(
    def: () => Promise<U>,
    fn: (some: T) => Promise<U>,
  ): PromisedOption<U>;
  mapOrElse<U>(def: () => Promise<U>, fn: (some: T) => U): PromisedOption<U>;
  mapOrElse<U>(def: () => U, fn: (some: T) => Promise<U>): PromisedOption<U>;
  mapOrElse<U>(def: () => U, fn: (some: T) => U): PromisedOption<U>;
  mapOrElse<U>(
    def: () => U | Promise<U>,
    fn: (some: T) => U | Promise<U>,
  ): PromisedOption<U> {
    return PromisedOption.create(
      this.promise.then((option) =>
        option.mapOrElse(def as () => Promise<U>, fn as (some: T) => Promise<U>)
      ),
    );
  }

  or(optb: Option<T>): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => option.or(optb)),
    );
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): PromisedOption<T>;
  orElse(fn: () => Option<T> | Promise<Option<T>>): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => {
        return option.orElse(fn as () => Promise<Option<T>>);
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

  xor(optb: Option<T>): PromisedOption<T> {
    return PromisedOption.create(
      this.promise.then((option) => option.xor(optb)),
    );
  }
}
