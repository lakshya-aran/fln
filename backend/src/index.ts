import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import routes from "./routes";
import superadminRoutes from "./superadmin/routes";
import stateAdminRoutes from "./stateadmin/routes";
import districtAdminRoutes from "./districtadmin/routes";
import blockAdminRoutes from "./blockadmin/routes";
import { globalErrorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/api/v1", apiRateLimiter);

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "FLN Platform API is running" });
});

app.use("/api/v1", routes);
app.use("/api/v1/superadmin", superadminRoutes);
app.use("/api/v1/admin", stateAdminRoutes);
app.use("/api/v1/district", districtAdminRoutes);
app.use("/api/v1/block", blockAdminRoutes);

app.use(globalErrorHandler);

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

start().catch(console.error);

export default app;
