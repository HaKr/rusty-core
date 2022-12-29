import { Err, Ok, PromisedResult, type Result } from "../result/mod.ts";
import { Option, OptionType } from "./api.ts";
import { ChainableOption, UnwrapableOption } from "./chainable.ts";
import { None, OptionValue, PromisedOption, Some } from "./option.ts";

export class SomeValue<T> implements ChainableOption<T>, UnwrapableOption<T> {
  constructor(private value: T) {}

  [Symbol.iterator](): IterableIterator<T> {
    return [this.value][Symbol.iterator]();
  }

  get type(): symbol {
    return OptionType.Some;
  }

  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | Promise<Option<U>>,
  ): PromisedOption<U> | Option<U> {
    const alt = fn(this.value);
    return alt instanceof Promise ? PromisedOption.create(alt) : alt;
  }

  filter(predicate: (some: T) => boolean): Option<T> {
    return OptionValue.from(
      predicate(this.value) ? this : new NoneValue<T>(),
    );
  }

  flatten<U>(this: Option<U>): Option<U>;
  flatten<U>(this: Option<Option<U>>): Option<U>;
  flatten<U>(this: Option<U> | Option<Option<U>>): Option<U> {
    type Unwrap<U> = { value: unknown };

    const inner = (this as unknown as Unwrap<U>).value;
    if (inner instanceof OptionValue) {
      return inner as Option<U>;
    } else return OptionValue.from(this as unknown as SomeValue<U>);
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => Promise<U>): PromisedOption<U>;
  map<U>(fn: (some: T) => U): U;
  map<U>(fn: (some: T) => U | Promise<U>): Option<U> | PromisedOption<U> {
    const newVal = fn(this.value);

    return newVal instanceof Promise
      ? PromisedOption.create(newVal.then(Some))
      : Some(newVal);
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
    _: () => U | Promise<U>,
    fn: (some: T) => U | Promise<U>,
  ): Option<U> | PromisedOption<U> {
    const newVal = fn(this.value);

    return newVal instanceof Promise
      ? PromisedOption.create(newVal.then(Some))
      : Some(newVal);
  }

  okOr<E>(_: E): Result<T, E> {
    return Ok(this.value);
  }

  okOrElse<E>(fn: () => Promise<E>): PromisedResult<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;
  okOrElse<E>(_: unknown): PromisedResult<T, E> | Result<T, E> {
    return Ok(this.value);
  }

  or(_: Option<T>): Option<T> {
    return OptionValue.from(this);
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    _: () => Option<T> | Promise<Option<T>>,
  ): PromisedOption<T> | Option<T> {
    return OptionValue.from(this);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_: T): T {
    return this.value;
  }

  unwrapOrElse(def: () => T): T;
  unwrapOrElse(def: () => Promise<T>): T | Promise<T>;
  unwrapOrElse(_: unknown): T {
    return this.value;
  }

  xor(optb: Option<T>): Option<T> {
    if (optb.isNone()) return OptionValue.from(this);
    else return None();
  }
}

export class NoneValue<T> implements ChainableOption<T>, UnwrapableOption<T> {
  constructor() {}

  [Symbol.iterator](): IterableIterator<T> {
    return [][Symbol.iterator]();
  }

  isSome(): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }

  map<U>(fn: (some: T) => Promise<U>): PromisedOption<U>;
  map<U>(fn: (some: T) => U): Option<U>;
  map<U>(
    _: (val: T) => Option<U> | Promise<Option<U>>,
  ): Option<U> | PromisedOption<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
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
    _: (some: T) => U | Promise<U>,
  ): Option<U> | PromisedOption<U> {
    const alt = def();
    return alt instanceof Promise
      ? PromisedOption.create(alt.then(Some))
      : Some(alt);
  }

  andThen<U>(fn: (some: T) => Promise<Option<U>>): PromisedOption<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    _: (some: T) => Option<U> | Promise<Option<U>>,
  ): PromisedOption<U> | Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  okOr<E>(err: E): Result<T, E> {
    return Err(err);
  }

  okOrElse<E>(fn: () => Promise<E>): PromisedResult<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;
  okOrElse<E>(fn: () => Promise<E> | E): PromisedResult<T, E> | Result<T, E> {
    const err = fn();
    return err instanceof Promise
      ? PromisedResult.from(err.then(Err<T, E>))
      : Err(err);
  }

  or(optb: Option<T>): Option<T> {
    return optb;
  }

  orElse(fn: () => Promise<Option<T>>): PromisedOption<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    fn: () => Option<T> | Promise<Option<T>>,
  ): PromisedOption<T> | Option<T> {
    const alt = fn();
    return alt instanceof Promise ? PromisedOption.create(alt) : alt;
  }

  and<U>(_: Option<U>): Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  filter(_: (some: T) => boolean): Option<T> {
    return OptionValue.from(this);
  }

  flatten<U>(this: Option<U>): Option<U>;
  flatten<U>(this: Option<Option<U>>): Option<U>;
  flatten<U>(this: Option<U> | Option<Option<U>>): Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  unwrap(): T {
    throw new Error("Cannot unwrap None");
  }

  unwrapOr(def: T): T {
    return def;
  }

  unwrapOrElse(def: () => T): T;
  unwrapOrElse(def: () => Promise<T>): T | Promise<T>;
  unwrapOrElse(def: () => Promise<T> | T): T | Promise<T> {
    return def();
  }

  xor(optb: Option<T>): Option<T> {
    return optb;
  }

  get type(): symbol {
    return OptionType.None;
  }
}
