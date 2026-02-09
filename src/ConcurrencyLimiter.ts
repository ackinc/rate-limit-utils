import type { Request } from "./types.ts";

export default class ConcurrencyLimiter<T extends any[], R extends unknown> {
  #nReqsInFlight = 0;
  #queue: Request<T, R>[] = [];
  maxConcurrency: number;
  handler: (...args: T) => R;

  constructor(maxConcurrency: number, handler: (...args: T) => R) {
    this.maxConcurrency = maxConcurrency;
    this.handler = handler;
  }

  async process(...args: T): Promise<Awaited<R>> {
    return new Promise<Awaited<R>>((resolve, reject) => {
      if (this.#nReqsInFlight < this.maxConcurrency) {
        this.#handleReq({ args, resolve, reject });
      } else {
        this.#queue.push({ args, resolve, reject });
      }
    });
  }

  async #handleReq({ args, resolve, reject }: Request<T, R>) {
    ++this.#nReqsInFlight;
    try {
      const result = await this.handler(...args);
      resolve(result);
    } catch (e) {
      reject(e instanceof Error ? e : new Error(`${e}`));
    }
    --this.#nReqsInFlight;

    if (this.#queue.length > 0) {
      const next = this.#queue.shift()!;
      setTimeout(() => this.#handleReq(next));
    }
  }
}

export function limitConcurrency<T extends any[], R extends unknown>(
  fn: (...args: T) => R,
  maxConcurrency: number,
) {
  const limiter = new ConcurrencyLimiter(maxConcurrency, fn);
  return function (...args: T) {
    return limiter.process(...args);
  };
}
