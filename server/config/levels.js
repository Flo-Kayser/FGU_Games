// server/config/levels.js

export const LEVELS = {
  demo: {
    id: "demo",
    label: "Demo – 4-2-3-1 (1 prefilled)",
    games: ["list_dfb_2014"],
    picksPerRound: 2,

    positions: [
      { id: "GK", label: "TW", x: 50, y: 82 },

      { id: "LB", label: "LV", x: 22, y: 62 },
      { id: "LCB", label: "IV", x: 38, y: 68 },
      { id: "RCB", label: "IV", x: 62, y: 68 },
      { id: "RB", label: "RV", x: 78, y: 62 },

      { id: "LDM", label: "ZDM", x: 40, y: 48 },
      { id: "RDM", label: "ZDM", x: 60, y: 48 },

      { id: "LAM", label: "ZOM", x: 28, y: 32 },
      { id: "CAM", label: "ZOM", x: 50, y: 30 },
      { id: "RAM", label: "ZOM", x: 72, y: 32 },

      { id: "ST", label: "ST", x: 50, y: 10 },
    ],

    preFilled: [{ posId: "GK", cardId: "BASE_GK_001", locked: true }],

    winnerIds: [
      "W_GK",
      "W_LB",
      "W_LCB",
      "W_RCB",
      "W_RB",
      "W_LDM",
      "W_RDM",
      "W_CAM",
      "W_LW",
      "W_RW",
      "W_ST",
    ],
    loserIds: [
      "L_GK",
      "L_LB",
      "L_LCB",
      "L_RCB",
      "L_RB",
      "L_LDM",
      "L_RDM",
      "L_CAM",
      "L_LW",
      "L_RW",
      "L_ST",
    ],
  },
};

export function getLevel(levelId) {
  const id = String(levelId || "").trim() || "demo";
  return LEVELS[id] || LEVELS.demo;
}

export function listLevels() {
  return Object.values(LEVELS).map((l) => ({ id: l.id, label: l.label }));
}
