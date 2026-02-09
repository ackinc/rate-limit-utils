import type { Request } from "./types.ts";

// throughput is measured as requests per time interval
// a "slot" represents a particular time interval

export default class ThroughputLimiter<T extends any[], R extends unknown> {
  maxThroughput: number;
  handler: (...args: T) => R;
  #getCurSlotStart: () => number;
  #getNextSlotStart: () => number;
  #waitQueue: Request<T, R>[] = [];
  #pwqTimeout: number | null = null;
  #slotStartTime: number;
  #slotsAvailable: number;

  constructor(
    maxThroughput: number,
    handler: (...args: T) => R,
    getCurSlotStart: () => number = () => Math.trunc(+new Date() / 1000),
    getNextSlotStart: () => number = () => Math.trunc(+new Date() / 1000 + 1),
  ) {
    this.maxThroughput = maxThroughput;
    this.handler = handler;
    this.#getCurSlotStart = getCurSlotStart;
    this.#getNextSlotStart = getNextSlotStart;

    this.#slotStartTime = this.#getCurSlotStart();
    this.#slotsAvailable = maxThroughput;

    this.processWaitQueue = this.processWaitQueue.bind(this);
  }

  async process(...args: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const req: Request<T, R> = { args, resolve, reject };
      this.#waitQueue.push(req);
      if (!this.#pwqTimeout) {
        this.#pwqTimeout = setTimeout(this.processWaitQueue);
      }
    });
  }

  processWaitQueue() {
    this.#pwqTimeout = null;

    const slotStartTime = this.#getCurSlotStart();
    if (this.#slotStartTime !== slotStartTime) {
      this.#slotStartTime = slotStartTime;
      this.#slotsAvailable = this.maxThroughput;
    }

    while (this.#slotsAvailable > 0 && this.#waitQueue.length > 0) {
      --this.#slotsAvailable;
      this.#handleReq(this.#waitQueue.shift()!);
    }

    if (this.#waitQueue.length > 0) {
      this.#pwqTimeout = setTimeout(
        this.processWaitQueue,
        this.#getMsToNextSlotStart(),
      );
    }
  }

  #getMsToNextSlotStart() {
    return this.#getNextSlotStart() - this.#getCurSlotStart();
  }

  async #handleReq(req: Request<T, R>) {
    const { args, resolve, reject } = req;
    try {
      const result = await this.handler(...args);
      resolve(result);
    } catch (e) {
      reject(e instanceof Error ? e : new Error(`${e}`));
    }
  }
}

export function limitThroughput<T extends any[], R extends unknown>(
  fn: (...args: T) => R,
  maxThroughput: number,
) {
  const limiter = new ThroughputLimiter(maxThroughput, fn);
  return function (...args: T) {
    return limiter.process(...args);
  };
}
