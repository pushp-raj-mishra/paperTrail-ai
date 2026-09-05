import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "paperTrail API is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

app.get("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

//global error handler as very last middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
