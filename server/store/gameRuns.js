import { getGameEntry } from "../games/registry.js";
import { getRoom } from "./rooms.js";
import { buildPayout } from "./payout.js";

const RUNS = new Map();
const now = () => Date.now();

export function createRun({ runId, roomCode, gameId, playerIds }) {
  const entry = getGameEntry(gameId);
  if (!entry) throw new Error(`Unknown gameId: ${gameId}`);

  const run = {
    runId,
    roomCode,
    gameId,
    playerIds,

    phase: "rules",
    rulesAck: new Set(),

    countdownMs: 3000,
    startAt: null,
    endAt: null,

    state: entry.game.init({ playerIds }),
    result: null,
  };

  RUNS.set(runId, run);
  return run;
}

export function getRun(runId) {
  return RUNS.get(runId) || null;
}

export function ackRules(runId, playerId) {
  const run = getRun(runId);
  if (!run || run.phase !== "rules") return run;

  run.rulesAck.add(playerId);

  if (run.rulesAck.size >= run.playerIds.length) {
    run.phase = "countdown";
    run.startAt = now() + run.countdownMs;

    const entry = getGameEntry(run.gameId);
    const dur = entry?.game?.durationMs || 0;
    run.endAt = run.startAt + dur;
  }

  return run;
}

export function tickRun(runId) {
  const run = getRun(runId);
  if (!run) return null;

  if (run.phase === "countdown" && run.startAt && now() >= run.startAt) {
    run.phase = "running";
  }

  if (run.phase === "running" && run.endAt && now() >= run.endAt) {
    finishRun(runId);
  }

  return run;
}

export function submitEvent(runId, playerId, payload) {
  const run = getRun(runId);
  if (!run) return null;

  tickRun(runId);

  console.log("[RUN] submitEvent", {
    runId,
    playerId,
    phase: run.phase,
    payload,
  });

  if (run.phase !== "running") return run;

  const entry = getGameEntry(run.gameId);
  entry.game.onEvent?.({ run }, run.state, playerId, payload);

  console.log("[RUN] state.score after", run.state.score);

  return run;
}

export function finishRun(runId) {
  const run = getRun(runId);
  if (!run || run.phase === "result") return run;

  const entry = getGameEntry(run.gameId);
  const end = entry.game.getResult?.({ run }, run.state) ?? {
    outcome: "draw",
    playerIds: run.playerIds,
  };

  run.phase = "result";

  const room = getRoom(run.roomCode);
  if (!room) {
    run.result = { end, payout: null, error: "Room not found for payout" };
    return run;
  }

  const payout = buildPayout({ room, end, runId: run.runId });

  run.result = {
    end,
    payout,
  };
  console.log(run.result);
  return run;
}

export function publicView(runId, playerId) {
  const run = getRun(runId);
  if (!run) return null;

  const entry = getGameEntry(run.gameId);

  return {
    runId: run.runId,
    roomCode: run.roomCode,
    gameId: run.gameId,
    phase: run.phase,
    startAt: run.startAt,
    endAt: run.endAt,
    result: run.phase === "result" ? run.result : null,
    game: {
      title: entry.title,
      type: entry.type,
      rules: entry.game.rules || [],
      durationMs: entry.game.durationMs || 0,
      view: entry.game.getPublicState?.({ run }, run.state, playerId) ?? {},
    },
  };
}
