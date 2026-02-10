import { pickIndexDeterministic } from "../utils/deterministicPick.js";

function idxOfPos(level, posId) {
  return level.positions.findIndex((p) => p.id === posId);
}

function cardFor(level, kind, posId) {
  const idx = idxOfPos(level, posId);
  if (idx < 0) return null;
  return kind === "good" ? level.winnerIds[idx] : level.loserIds[idx];
}

export function buildPayout({ room, end, runId }) {
  const level = room.level;
  if (!level) throw new Error("Room has no level.");

  function picksOf(playerId) {
    const p = Object.values(room.players).find((x) => x.id === playerId);
    return Array.isArray(p?.picks) ? p.picks : [];
  }

  if (end.outcome === "win") {
    const winnerPicks = picksOf(end.winnerId);
    const loserPicks = picksOf(end.loserId);

    return {
      outcome: "win",
      levelId: room.levelId,
      winnerId: end.winnerId,
      loserId: end.loserId,
      rewards: {
        [end.winnerId]: winnerPicks.map((posId) => ({
          pos: posId,
          cardId: cardFor(level, "good", posId),
        })),
        [end.loserId]: loserPicks.map((posId) => ({
          pos: posId,
          cardId: cardFor(level, "bad", posId),
        })),
      },
    };
  }

  if (end.outcome === "draw") {
    const ids = Array.isArray(end.playerIds) ? end.playerIds : [];
    if (ids.length !== 2) {
      throw new Error("Draw outcome must have exactly two playerIds.");
    }

    const rewards = {};

    for (const pid of ids) {
      const picks = picksOf(pid);

      if (picks.length === 0) {
        rewards[pid] = [];
        continue;
      }

      if (picks.length === 1) {
        const goodIdx = pickIndexDeterministic(`${runId}:${pid}:single`, 2);
        const kind = goodIdx === 0 ? "good" : "bad";
        rewards[pid] = [
          {
            pos: picks[0],
            cardId: cardFor(level, kind, picks[0]),
          },
        ];
        continue;
      }

      const goodPickIndex = pickIndexDeterministic(`${runId}:${pid}:draw`, 2);
      const out = [];

      for (let i = 0; i < 2; i++) {
        const posId = picks[i];
        const kind = i === goodPickIndex ? "good" : "bad";
        out.push({
          pos: posId,
          cardId: cardFor(level, kind, posId),
        });
      }

      rewards[pid] = out;
    }

    return {
      outcome: "draw",
      levelId: room.levelId,
      playerIds: ids,
      rewards,
    };
  }

  throw new Error(`Unknown outcome type: ${end.outcome}`);
}
