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

    preFilled: [{ posId: "GK", cardId: "488_50332136", locked: true }],

    winnerIds: [
      "488_50332136",
      "261733_67370597",
      "251483_50583131",
      "202429_50534077",
      "212622_50544270",
      "215914_67324778",
      "209499_50541147",
      "78063_67186927",
      "258715_50590363",
      "247827_117688339",
      "20801_100684097",
    ],
    loserIds: [
      "252911_252911",
      "244133_244133",
      "251289_50582937",
      "73956_50405604",
      "256954_50588602",
      "262667_262667",
      "279490_279490",
      "273114_273114",
      "234385_234385",
      "262898_50594546",
      "235157_235157",
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
