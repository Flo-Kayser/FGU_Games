import {
  createOrGetRoom,
  roomSize,
  addPlayer,
  snapshot,
  removePlayer,
  setPlayerPicks,
  setPlayerReady,
  canAutoStart,
  getRoom,
  setRoomLevel,
} from "../store/rooms.js";
import { normCode } from "../utils/norm.js";
import { startGame } from "../store/startGame.js";
import { resetWheel } from "../store/wheel.js";
import { getLevel } from "../config/levels.js";
import { validateLevel } from "../config/validateLevel.js";

// ✅ NEW: run-based game lifecycle
import {
  getRun,
  ackRules,
  tickRun,
  submitEvent,
  publicView,
} from "../store/gameRuns.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("room:join", ({ code, name, playerId, levelId }) => {
      const c = String(code || "")
        .trim()
        .toUpperCase();
      if (!c) {
        socket.emit("room:error", { message: "Kein Room Code angegeben." });
        return;
      }

      const existingRoom = getRoom(c);

      if (!existingRoom) {
        const room = createOrGetRoom(c);

        const level = getLevel(levelId);
        const validation = validateLevel(level);
        if (!validation.ok) {
          socket.emit("room:error", {
            message: `LevelConfig invalid: ${validation.errors.join(" | ")}`,
          });
          return;
        }

        setRoomLevel(room, level);

        if (roomSize(room) >= 2) {
          socket.emit("room:error", {
            message: "Room ist voll (max 2 Spieler).",
          });
          return;
        }

        addPlayer(room, socket.id, { name, playerId });
        socket.join(room.code);

        io.to(room.code).emit("room:update", snapshot(room));
        return;
      }

      const room = existingRoom;

      const requestedLevelId = String(levelId || "").trim() || room.levelId;
      if (room.levelId && requestedLevelId !== room.levelId) {
        socket.emit("room:error", {
          message: `Room läuft auf Level '${room.levelId}', du wolltest '${requestedLevelId}'.`,
        });
        return;
      }

      if (!room.players[socket.id] && roomSize(room) >= 2) {
        socket.emit("room:error", {
          message: "Room ist voll (max 2 Spieler).",
        });
        return;
      }

      addPlayer(room, socket.id, { name, playerId });
      socket.join(room.code);

      io.to(room.code).emit("room:update", snapshot(room));
    });

    socket.on("room:pick", ({ code, picks }) => {
      const room = createOrGetRoom(code);
      if (!room) return;

      if (room.phase !== "lobby") return;
      if (!room.players[socket.id]) return;

      setPlayerPicks(room, socket.id, picks);
      io.to(room.code).emit("room:update", snapshot(room));
    });

    socket.on("room:ready", ({ code, ready }) => {
      const room = createOrGetRoom(code);
      if (!room) return;

      if (room.phase !== "lobby") return;
      if (!room.players[socket.id]) return;

      const ok = setPlayerReady(room, socket.id, !!ready);
      if (!ok) {
        socket.emit("room:error", { message: "Du brauchst genau 2 Picks." });
        return;
      }

      io.to(room.code).emit("room:update", snapshot(room));

      if (canAutoStart(room)) {
        startGame(room, io);
      }
    });

    // -------------------------------------------------
    // ✅ NEW: Run-based Minigame Lifecycle
    // -------------------------------------------------

    socket.on("game:join", ({ runId, playerId }) => {
      console.log("[SERVER] game:join", {
        runId,
        playerId,
        socketId: socket.id,
      });

      if (!runId) {
        console.log("[SERVER] game:join missing runId");
        socket.emit("room:error", { message: "game:join without runId" });
        return;
      }

      socket.join(`run:${runId}`);

      const run = getRun(runId);
      console.log("[SERVER] getRun", runId, "=>", !!run);

      const view = publicView(runId, playerId);
      console.log("[SERVER] publicView", runId, "=>", !!view);

      if (view) socket.emit("game:state", view);
      else
        socket.emit("room:error", {
          message: `No run found for runId=${runId}`,
        });
    });

    socket.on("game:ack_rules", ({ runId, playerId }) => {
      if (!runId) return;

      ackRules(runId, playerId);
      broadcastRun(io, runId);
    });

    socket.on("game:event", ({ runId, playerId, payload }) => {
      if (!runId) return;

      submitEvent(runId, playerId, payload);
      broadcastRun(io, runId);
    });

    socket.on("game:tick", ({ runId, playerId }) => {
      if (!runId) return;

      tickRun(runId);
      broadcastRun(io, runId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const { room, deletedCode } = removePlayer(socket.id);

      if (deletedCode) {
        console.log(`Room deleted: ${deletedCode}`);
        return;
      }
      if (room) {
        io.to(room.code).emit("room:update", snapshot(room));
      }
    });
  });
}

// helper outside
function broadcastRun(io, runId) {
  const run = getRun(runId);
  if (!run) return;

  // ✅ schick state (debug-friendly erstmal egal ob per-player oder global)
  io.to(`run:${runId}`).emit("game:state", publicView(runId, run.playerIds[0]));

  // ✅ NEU: wenn Run fertig ist -> room resetten (nur 1x)
  if (run.phase === "result" && !run._roomResetScheduled) {
    run._roomResetScheduled = true;

    const room = getRoom(run.roomCode);
    if (!room) return;

    // optional: Room kurz als "result" markieren (damit Lobby UI es sieht)
    room.phase = "result";
    io.to(room.code).emit("room:update", snapshot(room));

    setTimeout(() => {
      // zurück zur Lobby
      room.phase = "lobby";
      room.game = null;
      room.result = null;

      // Spieler reset
      for (const p of Object.values(room.players || {})) {
        p.ready = false;
        p.picks = [];
      }

      // Wheel reset wenn durch
      if (
        room.wheel &&
        Array.isArray(room.wheel.remaining) &&
        room.wheel.remaining.length === 0
      ) {
        resetWheel(room);
      }

      io.to(room.code).emit("room:update", snapshot(room));
      io.to(room.code).emit("room:backToLobby", {});
    }, 1500);
  }
}
