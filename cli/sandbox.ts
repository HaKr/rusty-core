import { Err, Ok, Some } from "../src/lib.ts";

type MFrom<U> = U extends Mapper<infer T> ? Mapper<T>
  : U extends true | false ? Mapper<boolean>
  : Mapper<U>;

class Mapper<T> {
  constructor(private v: T) {}

  map(actor: (v: T) => number): Mapper<number>;
  map(actor: (v: T) => string): Mapper<string>;
  map(actor: (v: T) => void): Mapper<void>;
  map(actor: (v: T) => number | string | void) {
    return M(actor(this.v));
  }
}
function M<T>(m?: T): MFrom<T> {
  return (
    (m instanceof Mapper) ? m : new Mapper(m)
  ) as MFrom<T>;
}

M(42).map((n) => `"${n}"`).map(console.log);
M("42").map((s) => Number.parseInt(s, 5)).map(console.log);
M(true).map((b) => b ? 42 : 0).map(console.log);
M(Infinity).map((n) => 1 / n).map(console.log);

const answer = (b: boolean) => b ? 42 : 0;

Ok(2).map(console.log);
Ok(false).map(answer).map(console.log);
Ok(true).map(answer).map(console.log);

Err(true).map((b) => `${b}?`).mapResult((err) => Ok(err ? "yes" : "no"), Ok)
  .map(console.log);

Some(true).map((b) => !b).map(console.log);
