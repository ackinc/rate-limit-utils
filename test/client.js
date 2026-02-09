import ThroughputLimiter from "../src/ThroughputLimiter.ts";

const rateLimiter = new ThroughputLimiter(50, fetch);
const url = "http://localhost:3000/";

const promises = [];
for (let i = 0; i < 1000; i++) promises.push(rateLimiter.process(url));
await Promise.allSettled(promises);

await fetch("http://localhost:3000/log", { method: "POST" });
