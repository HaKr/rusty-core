import type {
  MapOption,
  OptionMapOption,
  OptionMapOrElse,
  OptionMapResult,
} from "../conditional_types.ts";
import { Err, Ok, type Result, type ResultPromise } from "../result/api.ts";
import { None, Option, type OptionPromise, Some } from "./api.ts";
import { OptionCombinators, UnwrapableOption } from "./combinators.ts";
import { OptionValue } from "./option.ts";

const OptionType = {
  Some: Symbol(":some"),
  None: Symbol(":none"),
};

export class SomeValue<T> implements UnwrapableOption<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return [this.value][Symbol.iterator]();
  }

  get type(): symbol {
    return OptionType.Some;
  }

  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  andThen<U>(fn: (some: T) => OptionPromise<U>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    fn: (some: T) => Option<U> | OptionPromise<U> | Promise<Option<U>>,
  ): OptionPromise<U> | Option<U> {
    const alt = fn(this.value);
    return alt instanceof Promise ? Some(alt) : alt;
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
      return inner as unknown as Option<U>;
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
  map<U>(
    fn: (some: T) => U,
  ): MapOption<U> {
    const newVal = fn(this.value);

    return (newVal instanceof Promise
      ? Some(newVal.then(Some))
      : Some(newVal)) as MapOption<U>;
  }

  mapOption<U>(
    _: () => U,
    fn: (some: T) => U,
  ): OptionMapOption<U> {
    const rv = fn(this.value);
    return (rv instanceof Promise
      ? Some(rv as Promise<Option<unknown>>)
      : rv) as OptionMapOption<U>;
  }

  mapResult<U>(_: () => U, fn: (some: T) => U): OptionMapResult<U> {
    const rv = fn(this.value);
    return (rv instanceof Promise
      ? Ok(rv as Promise<Result<unknown, unknown>>)
      : rv) as OptionMapResult<U>;
  }

  mapOrElse<U>(
    _: () => U,
    fn: (some: T) => U,
  ): OptionMapOrElse<U> {
    return fn(this.value) as OptionMapOrElse<U>;
  }

  okOr<E>(_: E): Result<T, E> {
    return Ok(this.value) as Result<T, E>;
  }

  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;
  okOrElse<E>(_: unknown): ResultPromise<T, E> | Result<T, E> {
    return Ok(this.value) as Result<T, E>;
  }

  or(_: Option<T>): Option<T> {
    return OptionValue.from(this);
  }

  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    _: () => Option<T> | Promise<Option<T>>,
  ): OptionPromise<T> | Option<T> {
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

export class NoneValue<T> implements OptionCombinators<T>, UnwrapableOption<T> {
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

  map<U>(
    _: (val: T) => U,
  ): MapOption<U> {
    return OptionValue.from(this as unknown as NoneValue<U>) as MapOption<U>;
  }

  mapOption<U>(
    def: () => U,
    _: (some: T) => U,
  ): OptionMapOption<U> {
    const rv = def();
    return (rv instanceof Promise
      ? Some(rv as Promise<Option<unknown>>)
      : rv) as OptionMapOption<U>;
  }

  mapResult<U>(def: () => U, _: (some: T) => U): OptionMapResult<U> {
    const rv = def();
    return (rv instanceof Promise
      ? Ok(rv as Promise<Result<unknown, unknown>>)
      : rv) as OptionMapResult<U>;
  }

  mapOrElse<U>(
    def: () => U,
    _: (some: T) => U,
  ): OptionMapOrElse<U> {
    return def() as OptionMapOrElse<U>;
  }

  andThen<U>(fn: (some: T) => OptionPromise<U>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;
  andThen<U>(
    _: (some: T) => Option<U> | Promise<Option<U>>,
  ): OptionPromise<U> | Option<U> {
    return OptionValue.from(this as unknown as NoneValue<U>);
  }

  okOr<E>(err: E): Result<T, E> {
    return Err(err) as Result<T, E>;
  }

  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;
  okOrElse<E>(fn: () => Promise<E> | E): ResultPromise<T, E> | Result<T, E> {
    const err = fn();
    return err instanceof Promise
      ? Err(err) as ResultPromise<T, E>
      : Err(err) as Result<T, E>;
  }

  or(optb: Option<T>): Option<T> {
    return optb;
  }

  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): Option<T>;
  orElse(
    fn: () => Option<T> | Promise<Option<T>>,
  ): OptionPromise<T> | Option<T> {
    const alt = fn();
    return alt instanceof Promise ? Some(alt) : alt;
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
