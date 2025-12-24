// Minimal Backend Server
const http = require("http");

const users = [];

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    if (req.url === "/api/users" && req.method === "GET") {
        res.end(JSON.stringify(users));
    }
    else if (req.url === "/api/users" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const newUser = JSON.parse(body);
            newUser.id = users.length + 1;
            users.push(newUser);
            res.end(JSON.stringify(newUser));
        });
    }
    else {
        res.end(JSON.stringify({ message: "Backend API", endpoints: ["GET /api/users", "POST /api/users"] }));
    }
});

server.listen(5000, () => {
    console.log("✅ Server running on http://localhost:5000");
});
