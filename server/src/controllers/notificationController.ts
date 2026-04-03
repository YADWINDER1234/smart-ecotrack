import type { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { subscribe, unsubscribe, clientCount } from "../services/notificationService";

export const sseSubscribeHandler: RequestHandler = async (req, res) => {
  // Enhanced SSE headers for stability
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for proxies
  res.flushHeaders?.();

  const id = randomUUID();
  subscribe(id, res);

  // send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ sessions: 1 })}\n\n`);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(": keep-alive heartbeat\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe(id);
  });
};
