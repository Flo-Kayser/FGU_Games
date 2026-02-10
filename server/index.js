import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket/register.js";

const app = express();

/**
 * Setze in Render z.B.:
 * ALLOWED_ORIGINS=https://dein-frontend.onrender.com,https://dein-frontend.vercel.app
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Express CORS (für REST /health etc.)
app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (curl, health checks)
      if (!origin) return cb(null, true);

      // wenn keine whitelist gesetzt ist, erstmal erlauben (dev-friendly)
      if (allowedOrigins.length === 0) return cb(null, true);

      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);

app.get("/health", (_, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

// Socket.io CORS (separat!)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

registerSocketHandlers(io);

// WICHTIG: Render setzt PORT
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(", ") : "(any)"}`,
  );
});
