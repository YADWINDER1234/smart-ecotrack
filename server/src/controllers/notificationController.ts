import type { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { subscribe, unsubscribe, clientCount } from "../services/notificationService";

export const sseSubscribeHandler: RequestHandler = async (req, res) => {
  // Simple SSE endpoint
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const id = randomUUID();
  subscribe(id, res);

  // send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ clients: clientCount() })}\n\n`);

  req.on("close", () => {
    unsubscribe(id);
  });
};
