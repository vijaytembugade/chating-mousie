import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import cron from "node-cron";

const server = http.createServer(function (request: any, response: any) {
  console.log(new Date() + " Received request for " + request.url);
});

const wss = new WebSocketServer({ server });

let dataBase = {} as any;

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data, isBinary) {
    try {
      let messageObj = JSON.parse(data.toString());
      dataBase = { ...dataBase, ...messageObj };
    } catch (err) {
      console.error("Failed to parse message from client:", err);
      return;
    }
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ ...dataBase, clientCount: wss.clients.size }),
          { binary: isBinary }
        );
      }
    });
  });

  ws.send(JSON.stringify({ ...dataBase, clientCount: wss.clients }));
});

import path from "path";
import fs from "fs";

server.on("request", (req, res) => {
  // Only handle GET requests
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  // Serve static files from ./frontend
  const frontendDir = path.join(__dirname, "frontend");
  let filePath = path.join(
    frontendDir,
    req.url === "/" ? "index.html" : req.url || ""
  );

  // Prevent directory traversal
  if (!filePath.startsWith(frontendDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      filePath = path.join(frontendDir, "index.html");
    }
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".otf": "font/otf",
      };
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      });
      res.end(content);
    });
  });
});

cron.schedule("* * * * *", function () {
  dataBase = {};
  console.log("DataBase cleared");
});

server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});
