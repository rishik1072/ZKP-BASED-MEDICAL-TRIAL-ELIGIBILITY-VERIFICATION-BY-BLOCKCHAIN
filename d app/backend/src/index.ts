import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import "express-async-errors";
import zkRouter from "./routes/zk/proofRoutes";
import blockchainRouter from "./routes/blockchain/contractRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { initializeBlockchainService } from "./services/blockchain/contractService";
import { logger } from "./utils/logger";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(","),
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API Routes
app.use("/api/zk", zkRouter);
app.use("/api/blockchain", blockchainRouter);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} (${NODE_ENV})`);
  logger.info(`📍 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`🔗 Blockchain Network: ${process.env.CHAIN_ID}`);

  // Initialize blockchain service
  try {
    initializeBlockchainService();
    logger.info("✅ Blockchain service initialized successfully");
  } catch (error) {
    logger.warn("⚠️ Blockchain service initialization warning:", error);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export default app;
