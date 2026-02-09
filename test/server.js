import * as http from "node:http";

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

// helpers

function handleRequest(req, res) {
  const startTime = +new Date();

  const [rand1, rand2] = [Math.random(), Math.random()];
  setTimeout(
    () => {
      const endTime = +new Date();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ startTime, endTime }));
    },
    // response time is < 1 second for 95% of requests, and
    //   between 1 and 5 seconds for the remaining 5%
    rand1 < 0.95 ? rand2 * 1000 : 1 + rand2 * 4 * 1000,
  );
}
