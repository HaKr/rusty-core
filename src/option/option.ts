import { Ok, Result, ResultPromise } from "../result/api";
import type {
  MapOption,
  OptionMapOption,
  OptionMapOrElse,
  OptionMapResult,
  OptionPromiseMapOption,
  OptionPromiseMapOrElse,
  OptionPromiseMapResult,
} from "../conditional_types";
import { OptionCombinators } from "./combinators";
import { NoneValue, SomeValue } from "./implementation";
import { isOption, Option, OptionPromise, Some } from "./api";

export interface UnwrapableOption<T> extends OptionCombinators<T> {
  type: symbol;

  unwrap(): T;
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
    this.promise = promise.then((resolved) =>
      isOption<T>(resolved) ? resolved : Some(resolved)
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
