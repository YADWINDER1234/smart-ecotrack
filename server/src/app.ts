import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { isAppError } from "./utils/errors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedStatic = [
        "http://localhost:5173",
        process.env.CORS_ORIGIN || "http://localhost:5173"
      ];

      // Allow specific static domains, any localhost, or any vercel.app preview URL
      if (
        allowedStatic.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

const scanLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/qr/scan", scanLimiter);

app.use("/api", apiRoutes);
app.use("/", apiRoutes); // Fallback for clients missing the /api prefix in their VITE_API_BASE_URL

// serve API documentation (optional, won't crash if file is missing)
try {
  const swaggerDocument = YAML.load("./openapi.yaml");
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  console.warn("openapi.yaml not found, /api/docs will be unavailable");
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-ecotrack-server" });
});

app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isAppError(err)) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
});

export default app;

