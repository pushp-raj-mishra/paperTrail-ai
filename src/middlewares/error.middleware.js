export const errorHandler = (err, req, res, next) => {
  console.log(`[Error] ${err.message}`);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    status: "error",
    message: error.message || "Internal Server Error",
    //if we are in development mode, then we also want stack trace
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
