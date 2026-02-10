import { getDataset } from "./datasets/index.js";

// ✅ bessere Norm (accents/umlaute/punkte/bindestrich)
const norm = (s) => {
  let t = String(s || "")
    .trim()
    .toLowerCase();

  // accents entfernen (é -> e, ö bleibt erstmal ö, wird unten ersetzt)
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // deutsche Sonderfälle
  t = t.replace(/ß/g, "ss");
  t = t.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");

  // vereinheitlichen
  t = t.replace(/[-'’.]/g, " ");
  t = t.replace(/\s+/g, " ").trim();

  return t;
};

export default function listGame({
  datasetId,
  durationMs = 60_000,
  rules = [],
}) {
  const ds = getDataset(datasetId);

  const allowedArr = (ds.answers || []).map(norm);
  const allowed = new Set(allowedArr);

  return {
    durationMs,
    rules,

    init({ playerIds = [] } = {}) {
      const used = {};
      const score = {};
      for (const pid of playerIds) {
        used[pid] = new Set();
        score[pid] = 0;
      }
      return { used, score };
    },

    onEvent(ctx, state, playerId, payload) {
      if (payload?.type !== "answer") return;

      const a = norm(payload.value);
      if (!a) return;

      if (!state.used) state.used = {};
      if (!state.score) state.score = {};

      if (!(state.used[playerId] instanceof Set))
        state.used[playerId] = new Set();
      if (typeof state.score[playerId] !== "number") state.score[playerId] = 0;

      if (state.used[playerId].has(a)) return;
      if (!allowed.has(a)) return;

      state.used[playerId].add(a);
      state.score[playerId] += 1;
    },

    getPublicState(ctx, state, playerId) {
      const other = ctx.run.playerIds.find((p) => p !== playerId);

      return {
        me: state?.score?.[playerId] ?? 0,
        other: other ? (state?.score?.[other] ?? 0) : 0,

        debugAllowed: allowedArr,
      };
    },

    getResult(ctx, state) {
      const ids = ctx.run.playerIds;
      console.log("[LIST] result compare ids", ids, "scores", state.score);

      const [a, b] = ids;

      const sa = state?.score?.[a] ?? 0;
      const sb = state?.score?.[b] ?? 0;

      if (sa === sb) {
        return {
          outcome: "draw",
          playerIds: [a, b],
          scores: { [a]: sa, [b]: sb },
        };
      }

      const winnerId = sa > sb ? a : b;
      const loserId = winnerId === a ? b : a;

      return {
        outcome: "win",
        winnerId,
        loserId,
        scores: { [a]: sa, [b]: sb },
      };
    },
  };
}
