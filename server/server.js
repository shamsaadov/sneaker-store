const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const db = require("./config/database");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const specialOrderRoutes = require("./routes/specialOrders");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:3000",
  "http://192.168.50.150:5173",
  "http://192.168.50.150:5174",
  "http://192.168.50.150:5175",
  "http://10.144.64.70:5173",
  "http://10.144.64.70:5174",
  "http://10.144.64.70:5175",
  "http://172.31.208.193:5173",
  "http://172.31.208.193:5174",
  "http://172.31.208.193:5175",
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Разрешить запросы без origin (например, мобильные приложения)
      if (!origin) return callback(null, true);

      // Разрешить все локальные адреса для разработки
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
        origin.match(/^http:\/\/172\.\d+\.\d+\.\d+:\d+$/)
      ) {
        return callback(null, true);
      }

      // Проверить, есть ли origin в списке разрешенных (для продакшена)
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Body parsing middleware with increased timeout for large uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Increase server timeout for large uploads
app.use((req, res, next) => {
  // Set timeout to 5 minutes for uploads
  if (req.method === "POST" || req.method === "PUT") {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});

// Static files
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/special-orders", specialOrderRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle payload too large error
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Данные слишком большие",
      message: "Попробуйте уменьшить размер изображений или количество файлов",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  // Handle other specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "Файл слишком большой",
      message: "Максимальный размер файла 50MB",
      code: "FILE_TOO_LARGE",
    });
  }

  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.init();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Health check available at http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
