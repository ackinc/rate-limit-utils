import * as assert from "node:assert";
import { computeMaxConcurrency } from "../src/utils.ts";

assert.equal(computeMaxConcurrency([]), 0);
assert.equal(computeMaxConcurrency([{ startTime: 1, endTime: 2 }]), 1);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 2 },
    { startTime: 3, endTime: 4 },
  ]),
  1,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 2 },
    { startTime: 1, endTime: 4 },
  ]),
  2,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 2 },
    { startTime: 2, endTime: 3 },
  ]),
  2,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 2 },
    { startTime: 2, endTime: 3 },
    { startTime: 3, endTime: 4 },
    { startTime: 4, endTime: 5 },
    { startTime: 5, endTime: 6 },
  ]),
  2,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 6 },
    { startTime: 2, endTime: 7 },
    { startTime: 3, endTime: 8 },
    { startTime: 4, endTime: 9 },
    { startTime: 5, endTime: 10 },
  ]),
  5,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 10 },
    { startTime: 2, endTime: 9 },
    { startTime: 3, endTime: 8 },
    { startTime: 4, endTime: 7 },
    { startTime: 5, endTime: 6 },
  ]),
  5,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 10 },
    { startTime: 2, endTime: 10 },
    { startTime: 3, endTime: 10 },
    { startTime: 4, endTime: 10 },
    { startTime: 5, endTime: 10 },
  ]),
  5,
);
assert.equal(
  computeMaxConcurrency([
    { startTime: 1, endTime: 10 },
    { startTime: 2, endTime: 3 },
    { startTime: 3, endTime: 10 },
    { startTime: 4, endTime: 10 },
    { startTime: 5, endTime: 10 },
  ]),
  4,
);
