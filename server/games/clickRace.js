export const clickRace = {
  id: "clickRace",

  createState(room) {
    const ids = Object.values(room.players).map((p) => p.id);
    return {
      target: 10,
      clicks: Object.fromEntries(ids.map((id) => [id, 0])),
      startedAt: Date.now(),
    };
  },

  onEvent(room, playerId, payload) {
    const state = room.game?.state;
    if (!state) return null;

    if (payload?.type !== "click") return null;

    if (!(playerId in state.clicks)) {
      console.warn("clickRace: unknown playerId for clicks map", {
        playerId,
        keys: Object.keys(state.clicks),
      });
      return null;
    }

    state.clicks[playerId] += 1;

    const update = { clicks: state.clicks, target: state.target };

    if (state.clicks[playerId] >= state.target) {
      const allIds = Object.keys(state.clicks);
      const loserId = allIds.find((id) => id !== playerId) || null;

      return {
        broadcast: update,
        end: {
          outcome: "win",
          winnerId: playerId,
          loserId: loserId,
          levelId: "default",
        },
      };
    }
    return { broadcast: update };
  },
};
