import listGame from "./list/game.server.js";

export const games = {
  list_dfb_2014: {
    title: "Aufzählen",
    type: "solo",
    game: listGame({
      datasetId: "dfb_2014",
      durationMs: 60_000,
      rules: [
        "Nenne so viele Spieler des WM-Kaders der Deutschen Nationalmannschaft von 2014.",
        "Es reicht der Nachname der Spieler.",
        "Groß- und Kleinschreibung ist egal.",
        "Dafür hast Du 60 Sekunden Zeit.",
      ],
    }),
  },
};

export function getGameEntry(gameId) {
  return games[gameId] || null;
}
