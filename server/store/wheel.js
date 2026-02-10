// sehr kleines deterministisches "Wheel":
// - nimmt remaining games
// - seed basiert auf runId (und optional timestamp)
// - wählt winnerIndex und gameId
// - entfernt game aus remaining (damit nicht doppelt kommt)

import { hashToUint } from "../utils/hash.js";

export function spinWheel(room) {
  const wheel = room.wheel;
  if (
    !wheel ||
    !Array.isArray(wheel.remaining) ||
    wheel.remaining.length === 0
  ) {
    return null;
  }

  const seed = hashToUint(
    `${wheel.runId}:${wheel.remaining.length}:${wheel.lastGameId || ""}`,
  );

  const winnerIndex = seed % wheel.remaining.length;
  const gameId = wheel.remaining[winnerIndex];

  const nextRemaining = wheel.remaining.filter((_, i) => i !== winnerIndex);

  room.wheel = {
    runId: wheel.runId,
    remaining: nextRemaining,
    lastGameId: gameId,
  };

  return {
    runId: wheel.runId,
    seed,
    winnerIndex,
    gameId,
    remaining: nextRemaining,
  };
}

export function resetWheel(room) {
  const games = room?.level?.games;
  if (!Array.isArray(games) || games.length === 0) return false;

  room.wheel = {
    runId: crypto.randomUUID(),
    remaining: [...games],
    lastGameId: null,
  };
  return true;
}
