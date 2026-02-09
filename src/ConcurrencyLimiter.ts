interface Request {
  args: unknown[];
  resolve: (arg0: unknown) => void;
  reject: (arg0: Error) => void;
}

export default class ConcurrencyLimiter {
  #nReqsInFlight = 0;
  #queue: Request[] = [];
  maxConcurrency: number;
  handler: (...args: unknown[]) => Promise<unknown>;

  constructor(
    maxConcurrency: number,
    handler: (...args: unknown[]) => Promise<unknown>,
  ) {
    this.maxConcurrency = maxConcurrency;
    this.handler = handler;
  }

  async process(...args: unknown[]) {
    return new Promise((resolve, reject) => {
      if (this.#nReqsInFlight < this.maxConcurrency) {
        this.#handleReq({ args, resolve, reject });
      } else {
        this.#queue.push({ args, resolve, reject });
      }
    });
  }

  async #handleReq({ args, resolve, reject }: Request) {
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

export function limitConcurrency(
  fn: (...args: unknown[]) => Promise<unknown>,
  maxConcurrency: number,
) {
  const limiter = new ConcurrencyLimiter(maxConcurrency, fn);
  return function (...args: unknown[]) {
    return limiter.process(...args);
  };
}
