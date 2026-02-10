import { normCode, normName } from "../utils/norm.js";

const rooms = new Map();

function makeRoom(code) {
  return {
    code,
    phase: "lobby",
    levelId: null,
    level: null,
    wheel: {
      runId: crypto.randomUUID(),
      remaining: [],
      lastGameId: null,
    },
    players: {},
  };
}

export function getRoom(code) {
  return rooms.get(normCode(code));
}

export function createOrGetRoom(code) {
  const c = normCode(code);
  if (!c) return null;

  let room = rooms.get(c);
  if (!room) {
    room = makeRoom(c);
    rooms.set(c, room);
  }
  return room;
}

export function roomSize(room) {
  return Object.keys(room.players).length;
}

export function addPlayer(room, socketId, { name, playerId }) {
  room.players[socketId] = {
    id: playerId || crypto.randomUUID(),
    name: normName(name),
    picks: [],
    ready: false,
  };
}

export function removePlayer(socketId) {
  for (const room of rooms.values()) {
    if (room.players[socketId]) {
      delete room.players[socketId];

      if (roomSize(room) === 0) {
        rooms.delete(room.code);
        return { room: null, deletedCode: room.code };
      }
      return { room, deletedCode: null };
    }
  }
  return { room: null, deletedCode: null };
}

export function snapshot(room) {
  return {
    code: room.code,
    phase: room.phase,
    levelId: room.levelId,
    level: room.level
      ? {
          id: room.level.id,
          label: room.level.label,
          games: room.level.games,
          positions: room.level.positions,
          preFilled: room.level.preFilled || [],
          picksPerRound: room.level.picksPerRound ?? 2,
        }
      : null,
    wheel: room.wheel
      ? {
          runId: room.wheel.runId,
          remaining: room.wheel.remaining,
          lastGameId: room.wheel.lastGameId,
        }
      : null,
    players: Object.entries(room.players).map(([sid, p]) => ({
      socketId: sid,
      name: p.name,
      picks: p.picks || [],
      ready: !!p.ready,
    })),
  };
}

export function setPlayerPicks(room, socketId, picks) {
  const p = room.players[socketId];
  if (!p) return false;

  const arr = Array.isArray(picks) ? picks : [];
  p.picks = [...new Set(arr)].slice(0, 2);
  p.ready = false;
  return true;
}

export function setPlayerReady(room, socketId, ready) {
  const p = room.players[socketId];
  if (!p) return false;

  if (ready === true && (!Array.isArray(p.picks) || p.picks.length !== 2)) {
    return false;
  }

  p.ready = !!ready;
  return true;
}

export function bothReady(room) {
  const players = Object.values(room.players);
  if (players.length !== 2) return false;
  return players.every((p) => p.ready === true);
}

export function bothHaveTwoPicks(room) {
  const players = Object.values(room.players);
  if (players.length !== 2) return false;
  return players.every((p) => Array.isArray(p.picks) && p.picks.length === 2);
}

export function canAutoStart(room) {
  if (room.phase !== "lobby") return false;

  const players = Object.values(room.players);
  if (players.length !== 2) return false;

  return players.every(
    (p) => p.ready === true && Array.isArray(p.picks) && p.picks.length === 2,
  );
}

export function setRoomLevel(room, level) {
  room.levelId = level.id;
  room.level = level;

  room.wheel = {
    runId: crypto.randomUUID(),
    remaining: [...level.games],
    lastGameId: null,
  };
}
