import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorMiddleware } from "./packages/error-handler/error-middleware.js";
import { prisma } from "./packages/prisma/index.js";
import router from "./routes/page.js";


dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.USER_UI_URL,
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());

// Routes
app.use("/api", router);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Livestock Health API is running",
  });
});

// Error handling
app.use(errorMiddleware);

// Start server
const start = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();