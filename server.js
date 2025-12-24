// server.js - COMPLETE BACKEND WITH EXPRESS
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
});

// Temporary in-memory database
let users = [
  {
    id: 1,
    picture: "https://via.placeholder.com/200",
    employeeName: "John Doe",
    employeeAge: "30",
    employeeCity: "New York",
    employeeEmail: "john@example.com",
    employeePhone: "12345678901",
    employeePost: "Developer",
    startDate: "2024-01-15",
  },
];
let nextId = 2;

// ========== API ENDPOINTS ==========

// 1. GET all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// 2. GET single user
app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// 3. CREATE new user
app.post("/api/users", (req, res) => {
  try {
    const newUser = {
      id: nextId++,
      picture: req.body.picture || "https://via.placeholder.com/200",
      employeeName: req.body.employeeName || "",
      employeeAge: req.body.employeeAge || "",
      employeeCity: req.body.employeeCity || "",
      employeeEmail: req.body.employeeEmail || "",
      employeePhone: req.body.employeePhone || "",
      employeePost: req.body.employeePost || "",
      startDate: req.body.startDate || new Date().toISOString().split("T")[0],
    };

    users.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. UPDATE user
app.put("/api/users/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[index] = {
      ...users[index],
      ...req.body,
      id: users[index].id, // Keep original ID
    };

    res.json(users[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. DELETE user
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  res.status(204).send();
});

// 6. UPLOAD image
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Serve uploaded files
app.use("/uploads", express.static("uploads"));

// 8. Create uploads folder if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 9. Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    usersCount: users.length,
  });
});

// 10. Home page
app.get("/", (req, res) => {
  res.json({
    message: "CRUD Backend API",
    endpoints: [
      "GET    /api/users",
      "GET    /api/users/:id",
      "POST   /api/users",
      "PUT    /api/users/:id",
      "DELETE /api/users/:id",
      "POST   /api/upload",
      "GET    /health",
    ],
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📁 API Endpoints:`);
  console.log(`   http://localhost:${PORT}/api/users`);
  console.log(`   http://localhost:${PORT}/api/upload`);
});
