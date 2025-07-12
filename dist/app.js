"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const http_1 = __importDefault(require("http"));
const node_cron_1 = __importDefault(require("node-cron"));
const server = http_1.default.createServer(function (request, response) {
    console.log(new Date() + " Received request for " + request.url);
});
const wss = new ws_1.WebSocketServer({ server });
let dataBase = {};
wss.on("connection", function connection(ws) {
    ws.on("message", function message(data, isBinary) {
        try {
            let messageObj = JSON.parse(data.toString());
            // console.log("Message from client (object):", messageObj);
            dataBase = Object.assign(Object.assign({}, dataBase), messageObj);
            console.log("Data:", dataBase);
        }
        catch (err) {
            console.error("Failed to parse message from client:", err);
            return;
        }
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws_1.default.OPEN) {
                console.log("Message Sent:", JSON.stringify(dataBase));
                client.send(JSON.stringify(dataBase), { binary: isBinary });
            }
        });
    });
    ws.send(JSON.stringify(dataBase));
});
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
server.on("request", (req, res) => {
    // Only handle GET requests
    if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
        return;
    }
    // Serve static files from ./frontend
    const frontendDir = path_1.default.join(__dirname, "frontend");
    let filePath = path_1.default.join(frontendDir, req.url === "/" ? "index.html" : req.url || "");
    // Prevent directory traversal
    if (!filePath.startsWith(frontendDir)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
    }
    fs_1.default.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to index.html for SPA routing
            filePath = path_1.default.join(frontendDir, "index.html");
        }
        fs_1.default.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                return;
            }
            const ext = path_1.default.extname(filePath).toLowerCase();
            const mimeTypes = {
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
node_cron_1.default.schedule("* * * * *", function () {
    dataBase = {};
    console.log("DataBase cleared");
});
server.listen(8080, function () {
    console.log(new Date() + " Server is listening on port 8080");
});
