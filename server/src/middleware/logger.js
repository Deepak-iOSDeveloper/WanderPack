/**
 * Logging Middleware
 */

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log response when it's finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? "❌"
        : res.statusCode >= 400
          ? "⚠️"
          : res.statusCode >= 300
            ? "↩️"
            : "✅";

    console.log(
      `${statusColor} [${res.statusCode}] ${req.method.padEnd(6)} ${req.path} - ${duration}ms`,
    );
  });

  next();
}

/**
 * Request details logger (for debugging)
 */
export function detailedLogger(req, res, next) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n========== REQUEST ==========");
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(`Query:`, req.query);
    if (Object.keys(req.body).length > 0) {
      console.log(`Body:`, req.body);
    }
    console.log("=============================\n");
  }
  next();
}
