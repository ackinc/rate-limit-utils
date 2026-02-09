import { limitThroughput } from "../src/ThroughputLimiter.ts";
import * as assert from "node:assert";
import { computeFreqs } from "./utils.ts";

const limit = 50;

const rateLimitedFetch = limitThroughput(fetch, limit);
const url = "http://localhost:3000/";

const responsePromises = [];
for (let i = 0; i < 1000; i++) responsePromises.push(rateLimitedFetch(url));
const responses = await Promise.all(responsePromises);

// verify that no more than *limit* reqs were started in any 1 second
const startTimes = await Promise.all(
  responses.map(async (res) => Math.floor((await res.json()).startTime / 1000)),
);
const freqs = computeFreqs(startTimes);
assert.ok(Math.max(...Object.values(freqs)) <= limit);
