import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: "wanderpack-server",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
