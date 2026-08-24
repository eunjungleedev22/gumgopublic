// Serves the `dist/` static export with cleanUrls, matching how Vercel serves it.
// Needed because expo-router exports `log.html` but the app links to `/log`.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { DIST, PORT } = require("./lib");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let f = path.join(DIST, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      if (fs.existsSync(f + ".html")) f = f + ".html";
      else f = path.join(DIST, "+not-found.html");
    }
    fs.readFile(f, (err, buf) => {
      if (err) {
        res.writeHead(404);
        return res.end("not found");
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
      res.end(buf);
    });
  })
  .listen(PORT, () => console.log(`serving ${DIST} on ${PORT} (cleanUrls)`));
