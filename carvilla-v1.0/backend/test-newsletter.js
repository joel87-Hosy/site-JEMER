const http = require("http");
const data = JSON.stringify({ email: "testnewsletter@example.com" });
const opts = {
  hostname: "127.0.0.1",
  port: 3000,
  path: "/api/newsletter",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(opts, (res) => {
  let b = "";
  res.on("data", (c) => (b += c));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", b);
    process.exit(0);
  });
});
req.on("error", (e) => {
  console.error("Request error", e.message);
  process.exit(1);
});
req.write(data);
req.end();
