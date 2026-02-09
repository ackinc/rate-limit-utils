interface Request {
  args: unknown[];
  resolve: (arg0: unknown) => void;
  reject: (arg0: Error) => void;
}

// throughput is measured as requests per time interval
// a "slot" represents a particular time interval

export default class ThroughputLimiter {
  maxThroughput: number;
  handler: (...args: unknown[]) => Promise<unknown>;
  #getCurSlotStart: () => number;
  #getNextSlotStart: () => number;
  #waitQueue: Request[] = [];
  #pwqTimeout: number | null = null;
  #slotStartTime: number;
  #slotsAvailable: number;

  constructor(
    maxThroughput: number,
    handler: (...args: unknown[]) => Promise<unknown>,
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

  async process(...args: unknown[]) {
    return new Promise((resolve, reject) => {
      const req: Request = { args, resolve, reject };
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

  #handleReq(req: Request) {
    const { args, resolve, reject } = req;
    this.handler(...args)
      .then(resolve)
      .catch(reject);
  }
}
