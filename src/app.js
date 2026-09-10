import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";

import { errorHandler } from "./middlewares/error.middleware.js";
import documentRoutes from "./routes/document.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/documents", documentRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "paperTrail API is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

app.all("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

//global error handler as very last middleware
app.use(errorHandler);

export default app;
