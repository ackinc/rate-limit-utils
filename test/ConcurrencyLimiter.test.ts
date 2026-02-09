import * as assert from "node:assert";
import { limitConcurrency } from "../src/index.ts";
import { computeMaxConcurrency } from "../src/utils.ts";

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
