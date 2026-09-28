import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { api } from "./routes/api";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", api);
app.use(errorHandler);
app.listen(config.port, () => console.info("API listening on :" + config.port));
