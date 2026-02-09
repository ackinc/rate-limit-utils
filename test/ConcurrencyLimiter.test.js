import { limitConcurrency } from "../src/ConcurrencyLimiter.ts";
import * as assert from "node:assert";

const limit = 50;

const rateLimitedFetch = limitConcurrency(fetch, limit);
const url = "http://localhost:3000/";

const responsePromises = [];
for (let i = 0; i < 1000; i++) responsePromises.push(rateLimitedFetch(url));
const responses = await Promise.all(responsePromises);

// verify that no more than *limit* reqs were in-flight at any given time
const times = await Promise.all(responses.map((res) => res.json()));
const maxConcurrency = computeMaxConcurrency(times);
assert.ok(maxConcurrency <= limit);

function computeMaxConcurrency(times) {
  const startTimes = times.map((t) => t.startTime).sort((a, b) => a - b);
  const endTimes = times.map((t) => t.endTime).sort((a, b) => a - b);

  let maxConcurrency = 0,
    curConcurrency = 0;
  let i = 0,
    j = 0;
  while (i < startTimes.length) {
    while (endTimes[j] < startTimes[i]) {
      curConcurrency--;
      j++;
    }
    curConcurrency++;
    maxConcurrency = Math.max(maxConcurrency, curConcurrency);
    i++;
  }
  return maxConcurrency;
}
