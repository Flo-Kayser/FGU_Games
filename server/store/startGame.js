import { spinWheel } from "./wheel.js";
import { snapshot } from "./rooms.js";
import { createRun } from "./gameRuns.js";
import { getGameEntry } from "../games/registry.js";

export function startGame(room, io) {
  room.phase = "spinning";
  io.to(room.code).emit("room:update", snapshot(room));

  const res = spinWheel(room);
  if (!res) {
    room.phase = "lobby";
    io.to(room.code).emit("room:update", snapshot(room));
    return;
  }

  io.to(room.code).emit("room:update", snapshot(room));

  io.to(room.code).emit("wheel:spin", {
    runId: res.runId,
    gameId: res.gameId,
    winnerIndex: res.winnerIndex,
    seed: res.seed,
  });

  setTimeout(() => {
    const entry = getGameEntry(res.gameId);
    if (!entry) {
      room.phase = "lobby";
      io.to(room.code).emit("room:error", {
        message: `Unknown game: ${res.gameId}`,
      });
      io.to(room.code).emit("room:update", snapshot(room));
      return;
    }

    const playerIds = Object.values(room.players || {})
      .map((p) => p.id ?? p.playerId)
      .filter(Boolean);

    console.log("[STARTGAME] playerIds", playerIds);

    if (playerIds.length !== 2) {
      room.phase = "lobby";
      io.to(room.code).emit("room:error", {
        message: "Need exactly 2 players to start.",
      });
      io.to(room.code).emit("room:update", snapshot(room));
      return;
    }

    createRun({
      runId: res.runId,
      roomCode: room.code,
      gameId: res.gameId,
      playerIds,
    });

    room.phase = "playing";
    io.to(room.code).emit("room:update", snapshot(room));

    io.to(room.code).emit("game:start", {
      gameId: res.gameId,
      runId: res.runId,
      title: entry.title,
      type: entry.type,
    });
  }, 3200);
}
