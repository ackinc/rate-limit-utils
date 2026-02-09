import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const reqStartTimes = [];

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/log") {
    writeRequestTimesToLog(req, res);
  } else {
    handleRequest(req, res);
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

// helpers

function handleRequest(req, res) {
  reqStartTimes.push(+new Date());
  const [rand1, rand2] = [Math.random(), Math.random()];

  setTimeout(
    () => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World\n");
    },
    // response time is < 1 second for 95% of requests, and
    //   between 1 and 5 seconds for the remaining 5%
    rand1 < 0.95 ? rand2 * 1000 : 1 + rand2 * 4 * 1000,
  );
}

function writeRequestTimesToLog(req, res) {
  fs.writeFileSync(
    path.join(fileURLToPath(import.meta.url), "request_times.log"),
    reqStartTimes.join("\n"),
    "utf-8",
  );

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ok");
}
